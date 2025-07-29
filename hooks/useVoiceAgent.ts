"use client";

import { useState, useEffect, useCallback } from "react";
import dialogTree from "@/data/dialog_tree.json";
import { useMemo } from "react";
export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isWakeWordActive: boolean;
  currentTranscript: string;
  finalTranscript: string;
  confidence: number;
  error: string | null;
  voiceReady: boolean;
}

export interface ConversationTurn {
  id: string;
  speaker: "user" | "agent";
  text: string;
  timestamp: Date;
}

export interface CustomerData {
  fullName: string;
  name?: string;
  policyNumber?: string;
  premium?: string;
  paymentDate?: string;
  paymentMode?: string;
  phoneNumber?: string;
  email?: string;
}

export function useVoiceAgent() {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    isWakeWordActive: true,
    currentTranscript: "",
    finalTranscript: "",
    confidence: 0,
    error: null,
    voiceReady: true, // ✅ fake mic is always ready
  });

  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [currentLanguage] = useState<string>("en");

  const [customerData, setCustomerData] = useState<CustomerData>({
    fullName: "Ajay",
    policyNumber: "1234567890",
    premium: "₹5,000",
    paymentDate: "31 July 2025",
    paymentMode: "Online",
    phoneNumber: "9876543210",
    email: "ajay@example.com",
  });

  const [metrics, setMetrics] = useState({
    averageLatency: 0,
    totalTurns: 0,
    successRate: 100,
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [scriptedRunning, setScriptedRunning] = useState(false);



const dialogSequence = useMemo(() => {
  return dialogTree.map((n) => ({
    id: n.id,
    prompt: n.veena_prompt.en.replace("{policy_holder_name}", customerData.fullName || "Ajay"),
  }));
}, [customerData.fullName]);

  const speakResponse = useCallback((text: string) => {
    window.speechSynthesis.cancel(); // stop previous
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onstart = () =>
      setVoiceState((p) => ({ ...p, isSpeaking: true }));
    utterance.onend = () =>
      setVoiceState((p) => ({
        ...p,
        isSpeaking: false,
        isWakeWordActive: true,
      }));
    window.speechSynthesis.speak(utterance);
  }, []);

  const simulateNextStep = useCallback(() => {
    if (stepIndex >= dialogSequence.length) {
      console.log("🎬 All scripted steps completed.");
      return;
    }

    const step = dialogSequence[stepIndex];
    console.log("Dialog step:", stepIndex, step.prompt);

    const fakeUser: ConversationTurn = {
      id: `user-${stepIndex}`,
      speaker: "user",
      text: `Response to step ${step.id}`,
      timestamp: new Date(),
    };

    const agent: ConversationTurn = {
      id: `agent-${stepIndex}`,
      speaker: "agent",
      text: step.prompt,
      timestamp: new Date(),
    };

    setConversation((prev) => [...prev, fakeUser, agent]);
   if (!step || !step.prompt) return;
    speakResponse(step.prompt);

    const latency = 500 + Math.random() * 1000;
    const total = metrics.totalTurns + 1;
    const avgLatency =
      (metrics.averageLatency * metrics.totalTurns + latency) / total;

    setMetrics({
      ...metrics,
      totalTurns: total,
      averageLatency: avgLatency,
      successRate: Math.max(80, 100 - (avgLatency / 1000) * 10),
    });

    setStepIndex((i) => i + 1); // ✅ Important to increment properly
  }, [stepIndex, dialogSequence, speakResponse, metrics]);

  const runScriptedAssistant = useCallback(() => {
    setScriptedRunning(true);
    setStepIndex(0);
    setConversation([]);

    let i = 0;
    const interval = setInterval(() => {
      simulateNextStep();
      i++;
      if (i >= dialogSequence.length) {
        clearInterval(interval);
        setTimeout(() => setScriptedRunning(false), 2000);
      }
    }, 4000); // 4 sec between turns
  }, [dialogSequence.length, simulateNextStep]);

  const resetConversation = () => {
    setConversation([]);
    setMetrics({ averageLatency: 0, totalTurns: 0, successRate: 100 });
    setStepIndex(0);
    setScriptedRunning(false);
  };

  // ✅ Dummy startListening for scripted demo
  const startListening = () => {
    setVoiceState((prev) => ({ ...prev, isListening: true }));
    setTimeout(() => {
      setVoiceState((prev) => ({ ...prev, isListening: false }));
    }, 2000);
  };

  // ✅ Dummy interruption
  const handleInterruption = () => {
    window.speechSynthesis.cancel();
    setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
  };

  return {
    voiceState,
    customerData,
    setCustomerData,
    currentLanguage,
    resetConversation,
    metrics,
    conversation,
    runScriptedAssistant,
    scriptedRunning,
    startListening,
    handleInterruption,
  };
}
