from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
from langdetect import detect
from deep_translator import GoogleTranslator
from gtts import gTTS
import subprocess
import json
import uuid
import os
import faiss
import time
import glob
from dotenv import load_dotenv

# === CONFIGURATION ===
load_dotenv()

LANG_CODES = {
    "en": "en", "hi": "hi", "mr": "hi", "gu": "gu"
}
TTS_LANG_MAP = LANG_CODES

# === FLASK SETUP ===
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# === MODELS ===
embedder = SentenceTransformer("distiluse-base-multilingual-cased-v1")

# === DATA ===
with open("data/intent_data.json", encoding="utf-8") as f:
    faq_data = json.load(f)
faq_texts = [d["text"] for d in faq_data]
faq_embeddings = embedder.encode(faq_texts, convert_to_numpy=True)
index = faiss.IndexFlatL2(faq_embeddings.shape[1])
index.add(faq_embeddings)

with open("data/dialog_tree.json", encoding="utf-8") as f:
    dialog_tree = {node["id"]: node for node in json.load(f)}

with open("data/rebuttals.json", encoding="utf-8") as f:
    rebuttals = json.load(f)

user_state = {}  # memory: {user_id: "1.0"}

# === HELPERS ===
def detect_lang(text):
    return detect(text)

def embed_query(query):
    return embedder.encode([query])

def retrieve_faq_context(query, k=3):
    query_vec = embed_query(query)
    _, I = index.search(query_vec, k)
    return [faq_texts[i] for i in I[0]]

def generate_llm_response(prompt):
    system_message = "You are Veena, a helpful multilingual insurance assistant."
    full_prompt = system_message + "\nUser: " + prompt + "\nAssistant:"

    cmd = ["ollama", "run", "llama3.2"]

    proc = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        encoding="utf-8",   # handle unicode input/output properly
        errors="replace"
    )

    stdout, stderr = proc.communicate(input=full_prompt)

    if proc.returncode != 0:
        raise RuntimeError(f"Ollama CLI failed: {stderr}")

    return stdout.strip()

def generate_tts(text, lang):
    filename = f"voice_{uuid.uuid4().hex}.mp3"
    tts = gTTS(text=text, lang=lang)
    tts.save(filename)
    return filename

def match_rebuttal(user_text):
    for item in rebuttals:
        if item["objection"].lower() in user_text.lower():
            rb = item.get("rebuttal")
            return rb if isinstance(rb, dict) else {"en": rb}
    return None

@app.before_request
def cleanup_audio_files():
    now = time.time()
    for f in glob.glob("voice_*.mp3"):
        if os.path.getmtime(f) < now - 3600:
            os.remove(f)

# === SAVE CUSTOMER FORM ===
@app.route("/api/save_customer", methods=["POST"])
def save_customer():
    data = request.get_json()
    print("[Customer Data]", data)
    return jsonify({"status": "success"})

# === INITIAL GREETING ===
@app.route("/api/veena_welcome", methods=["POST"])
def veena_welcome():
    req = request.get_json()
    lang = req.get("lang", "en")
    user_id = req.get("user_id", "default")
    full_name = req.get("full_name", "Sir/Madam")

    user_state[user_id] = "1.0"
    node = dialog_tree["1.0"]
    prompt = node["veena_prompt"].get(lang, node["veena_prompt"]["en"])
    prompt = prompt.replace("{policy_holder_name}", full_name)

    audio_path = generate_tts(prompt, TTS_LANG_MAP.get(lang, "en"))

    return jsonify({
        "response": prompt,
        "audio_url": f"http://localhost:5000/api/audio/{audio_path}",
        "lang": lang
    })

# === MAIN INTERACTION ===
@app.route("/api/query_customer", methods=["POST"])
def handle_query():
    req = request.form if request.content_type and request.content_type.startswith("multipart") else request.json
    user_id = req.get("user_id", "default")
    user_text = req.get("text", "").strip()

    if not user_text:
        return jsonify({"error": "No input provided"}), 400

    customer_data = json.loads(req.get("customerData", "{}")) if isinstance(req.get("customerData"), str) else req.get("metadata", {})

    if 'audio' in request.files:
        from speech_recognition import Recognizer, AudioFile
        recognizer = Recognizer()
        audio = request.files['audio']
        audio.save("temp.wav")
        with AudioFile("temp.wav") as source:
            audio_data = recognizer.record(source)
            user_text = recognizer.recognize_google(audio_data)

    if not user_text:
        return jsonify({"error": "No input provided"}), 400

    lang = detect_lang(user_text)
    user_text_en = GoogleTranslator(source="auto", target="en").translate(user_text) if lang != "en" else user_text

    matched_rebuttal = match_rebuttal(user_text_en)
    if matched_rebuttal:
        response = matched_rebuttal.get(lang, matched_rebuttal.get("en", ""))
    else:
        extract_prompt = f"""
You are an insurance assistant AI. Your job is to extract customer information from the input.

Input: "{user_text_en}"

Return a JSON object with keys:
- fullName
- name
- policyNumber
- premium
- paymentDate
- paymentMode
- phoneNumber
- email

Only include fields that are mentioned in the input. Use null or omit for missing values.
"""
        extraction_raw = ""
        try:
            extraction_raw = generate_llm_response(extract_prompt)
            extracted_data = json.loads(extraction_raw)
        except Exception as e:
            print("[LLM Extraction Error]", extraction_raw, str(e))
            extracted_data = {}

        for key, val in extracted_data.items():
            if val and not customer_data.get(key):
                customer_data[key] = val

        current_node = dialog_tree.get(user_state.get(user_id, "1.0"))
        context = retrieve_faq_context(user_text_en)

        reply_prompt = f"""User said: {user_text_en}
Current Dialog Step: {current_node['title'] if current_node else 'Unknown'}
Customer Info: {json.dumps(customer_data)}
Relevant FAQs: {"; ".join(context)}

Respond in {lang.upper()} language. Be helpful, natural, and friendly like a human insurance advisor."""

        llm_reply_en = generate_llm_response(reply_prompt)
        response = GoogleTranslator(source="auto", target=lang).translate(llm_reply_en) if lang != "en" else llm_reply_en

    audio_path = generate_tts(response, TTS_LANG_MAP.get(lang, "en"))

    return jsonify({
        "response": response,
        "audio_url": f"http://localhost:5000/api/audio/{audio_path}",
        "lang": lang,
        "customerData": customer_data
    })

# === AUDIO SERVE ===
@app.route("/api/audio/<filename>")
def serve_audio(filename):
    path = os.path.abspath(filename)
    print(f"[Serving Audio] {path}")
    return send_file(path, mimetype="audio/mpeg")

# === RUN ===
if __name__ == "__main__":
    app.run(port=5000, debug=True)
