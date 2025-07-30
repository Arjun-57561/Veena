"use client";
import { useCallback, useRef, useState } from "react";

// Voice State Interface
export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isWakeWordActive: boolean;
  voiceReady: boolean;
  currentTranscript: string;
  confidence?: number;
}

// Customer Data Interface
export interface CustomerData {
  fullName?: string;
  policyNumber?: string;
  premium?: string;
  paymentDate?: string;
  paymentMode?: string;
  phoneNumber?: string;
  email?: string;
  [key: string]: any;
}

// Helper: SpeechRecognition Polyfill
const getSpeechRecognition = (): typeof window.SpeechRecognition | null => {
  return (
    (typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)) ||
    null
  );
};

// Custom Hook
function useVoiceAgent() {
  // State
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    isWakeWordActive: true,
    voiceReady: true,
    currentTranscript: "",
  });
  const [customerData, setCustomerData] = useState<CustomerData>({});
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [metrics, setMetrics] = useState({ averageLatency: 0, totalTurns: 0 });

  // for speech instance persistence
  const recognitionRef = useRef<any>(null);

  // Language Switcher
  const changeLanguage = (lang: string) => setCurrentLanguage(lang);

  // Listening Trigger
  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      alert(
        "Your browser does not support Speech Recognition. Try Chrome or Edge."
      );
      return;
    }

    if (recognitionRef.current) {
      // safety: stop previous session if any
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = currentLanguage === "en" ? "en-US" : currentLanguage;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setVoiceState((vs) => ({
        ...vs,
        isListening: true,
        isWakeWordActive: false,
        isProcessing: false,
        currentTranscript: "",
      }));
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((res: any) => res[0].transcript)
        .join("");
      setVoiceState((vs) => ({
        ...vs,
        currentTranscript: transcript,
        confidence: event.results[0][0].confidence,
      }));
      if (event.results[0].isFinal) {
        setVoiceState((vs) => ({
          ...vs,
          isListening: false,
          isProcessing: true,
          currentTranscript: transcript,
        }));
      }
    };

    recognition.onerror = (event: any) => {
      setVoiceState((vs) => ({
        ...vs,
        isListening: false,
        isProcessing: false,
      }));
      recognition.stop();
    };

    recognition.onend = () => {
      setVoiceState((vs) => ({
        ...vs,
        isListening: false,
        isProcessing: false,
      }));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [currentLanguage]);

  // Conversation Reset
  const resetConversation = () => {
    setVoiceState((vs) => ({
      ...vs,
      isListening: false,
      isProcessing: false,
      isWakeWordActive: true,
      currentTranscript: "",
    }));
    setCustomerData({});
    setMetrics({ averageLatency: 0, totalTurns: 0 });
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  // Mock Wakeword Handler
  const handleInterruption = () => {
    setVoiceState((vs) => ({
      ...vs,
      isListening: false,
      isProcessing: false,
      isWakeWordActive: true,
    }));
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  return {
    voiceState,
    customerData,
    setCustomerData,
    currentLanguage,
    changeLanguage,
    metrics,
    setMetrics,
    resetConversation,
    handleInterruption,
    startListening,
  };
}

// Main Page Component
export default function VoiceAssistantPage() {
  const {
    voiceState,
    customerData,
    currentLanguage,
    changeLanguage,
    metrics,
    resetConversation,
    handleInterruption,
    startListening,
  } = useVoiceAgent();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Voice Assistant</h1>
        
        {/* Status Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded ${voiceState.isListening ? 'bg-green-100' : 'bg-gray-100'}`}>
              <div className="text-sm text-gray-600">Listening</div>
              <div className="font-semibold">{voiceState.isListening ? 'Active' : 'Inactive'}</div>
            </div>
            <div className={`p-3 rounded ${voiceState.isProcessing ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              <div className="text-sm text-gray-600">Processing</div>
              <div className="font-semibold">{voiceState.isProcessing ? 'Active' : 'Inactive'}</div>
            </div>
            <div className={`p-3 rounded ${voiceState.isWakeWordActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <div className="text-sm text-gray-600">Wake Word</div>
              <div className="font-semibold">{voiceState.isWakeWordActive ? 'Active' : 'Inactive'}</div>
            </div>
            <div className={`p-3 rounded ${voiceState.voiceReady ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="text-sm text-gray-600">Voice Ready</div>
              <div className="font-semibold">{voiceState.voiceReady ? 'Ready' : 'Not Ready'}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={startListening}
              disabled={voiceState.isListening}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {voiceState.isListening ? 'Listening...' : 'Start Listening'}
            </button>
            
            <button
              onClick={resetConversation}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reset Conversation
            </button>
            
            <button
              onClick={handleInterruption}
              className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Stop/Interrupt
            </button>
            
            <select
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>

        {/* Current Transcript */}
        {voiceState.currentTranscript && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Transcript</h2>
            <div className="bg-gray-50 p-4 rounded border">
              <p className="text-gray-800">{voiceState.currentTranscript}</p>
              {voiceState.confidence && (
                <p className="text-sm text-gray-600 mt-2">
                  Confidence: {Math.round(voiceState.confidence * 100)}%
                </p>
              )}
            </div>
          </div>
        )}

        {/* Customer Data */}
        {Object.keys(customerData).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Customer Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(customerData).map(([key, value]) => (
                <div key={key} className="border-b pb-2">
                  <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Average Latency</div>
              <div className="font-semibold">{metrics.averageLatency}ms</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Turns</div>
              <div className="font-semibold">{metrics.totalTurns}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}