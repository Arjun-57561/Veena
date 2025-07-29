"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EntityPanel } from "@/components/EntityPanel";
import { VoiceIndicator } from "@/components/VoiceIndicator";
import { LiveTranscript } from "@/components/LiveTranscript";
import { VeenaLogo } from "@/components/VeenaLogo";
import { getWelcome, queryVeena } from "@/lib/api";
import { useVoiceAgent, CustomerData } from "@/hooks/useVoiceAgent";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function VeenaAutonomousAgent() {
  const [isClient, setIsClient] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const userId = "demo_user";

  const {
    voiceState,
    customerData,
    setCustomerData,
    currentLanguage,
    changeLanguage,
    metrics,
    resetConversation,
    handleInterruption,
    startListening,
  } = useVoiceAgent();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (voiceState.isWakeWordActive && voiceState.voiceReady) {
      const name = customerData?.fullName?.trim() || "Sir/Madam";
      getWelcome(currentLanguage, userId, name)
        .then((res) => {
          setMessages((m) => [...m, { role: "assistant", text: res.response }]);
          if (res.audio_url) {
            const audio = new Audio(res.audio_url);
            audio.onended = () => startListening(); // resume mic after greeting
            audio.onerror = () => startListening();
            audio.play().catch(() => startListening());
          }
        })
        .catch(console.error);
    }
  }, [
    voiceState.isWakeWordActive,
    voiceState.voiceReady,
    currentLanguage,
    customerData.fullName,
    startListening,
  ]);

  const buildQuery = (data: Partial<CustomerData>): string => {
    const fields: string[] = [];
    if (data.fullName) fields.push(`My name is ${data.fullName}`);
    if (data.policyNumber) fields.push(`My policy number is ${data.policyNumber}`);
    if (data.premium) fields.push(`Premium is ${data.premium}`);
    if (data.paymentDate) fields.push(`Due date is ${data.paymentDate}`);
    if (data.paymentMode) fields.push(`Payment mode is ${data.paymentMode}`);
    if (data.phoneNumber) fields.push(`Phone number is ${data.phoneNumber}`);
    if (data.email) fields.push(`Email is ${data.email}`);
    return fields.join(". ") + ".";
  };

  const handleSubmit = async () => {
    const query = buildQuery(customerData);
    if (!query.trim()) return;

    try {
      const res = await queryVeena({ text: query, userId, customerData });
      setMessages((m) => [
        ...m,
        { role: "user", text: query },
        { role: "assistant", text: res.response },
      ]);
      if (res.audio_url) {
        const audio = new Audio(res.audio_url);
        audio.onended = () => startListening();
        audio.onerror = () => startListening();
        audio.play().catch(() => startListening());
      } else {
        startListening();
      }
    } catch (err) {
      console.error("Submit error:", err);
      startListening();
    }
  };

  if (!isClient) return <div>Loading Veena…</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <div className="mx-auto">
          <VeenaLogo />
        </div>
        <div className="ml-auto w-[160px]">
          <Select value={currentLanguage} onValueChange={changeLanguage}>
            <SelectTrigger className="bg-gray-800 text-white border-white">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="mr">Marathi</SelectItem>
              <SelectItem value="gu">Gujarati</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="text-sm text-gray-400 flex justify-between items-center px-6 py-1">
        <div>Status: <span className="text-purple-400 font-semibold">Say "Hey Veena"</span></div>
        <div>Avg Latency: {metrics.averageLatency.toFixed(0)}ms</div>
        <div>Turns: {metrics.totalTurns}</div>
        <div>Language: {currentLanguage.toUpperCase()}</div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3 overflow-y-auto flex-1">
            {messages.map((msg, idx) => (
              <div key={idx} className={`w-fit max-w-xl ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}>
                <div className={`p-3 rounded-md font-mono text-sm ${msg.role === "user" ? "bg-blue-900 text-blue-300" : "bg-green-900 text-green-300"}`}>
                  <strong>{msg.role.toUpperCase()}:</strong> {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4">
            <Button onClick={handleSubmit}>Submit</Button>
            <Button variant="outline" onClick={resetConversation}>Reset</Button>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[400px] border-l border-gray-700 p-4 bg-black">
          <EntityPanel
            customerData={customerData}
            onUpdateCustomerData={setCustomerData}
            metrics={metrics}
          />
        </div>
      </div>

      {/* Voice Mic & Transcript */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <VoiceIndicator
          isListening={voiceState.isListening}
          isSpeaking={voiceState.isSpeaking}
          isProcessing={voiceState.isProcessing}
          isWakeWordActive={voiceState.isWakeWordActive}
          onInterrupt={handleInterruption}
          onMicClick={startListening}
        />
      </div>

      <LiveTranscript
        currentTranscript={voiceState.currentTranscript}
        confidence={voiceState.confidence}
        isListening={voiceState.isListening}
      />
    </div>
  );
}
