"use client";

import React from "react";
import { Mic, Loader, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils"; // optional: Tailwind helper if using clsx or classnames

interface Props {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isWakeWordActive: boolean;
  onInterrupt?: () => void;
  onMicClick?: () => void;
}

export const VoiceIndicator: React.FC<Props> = ({
  isListening,
  isSpeaking,
  isProcessing,
  isWakeWordActive,
  onMicClick,
  onInterrupt,
}) => {
  const renderState = () => {
    if (isProcessing) {
      return (
        <Loader
          className="animate-spin text-yellow-400"
          title="Assistant is processing..."
        />
      );
    }
    if (isSpeaking) {
      return (
        <Volume2
          className="text-green-400 animate-pulse"
          title="Assistant is speaking"
        />
      );
    }
    if (isListening) {
      return (
        <Mic
          className="text-red-400 animate-pulse"
          title="Listening for your input"
        />
      );
    }
    return <Mic className="text-gray-400" title="Click to speak" />;
  };

  const handleClick = () => {
    if (isSpeaking && onInterrupt) {
      onInterrupt(); // Cancel current speech
    } else if (!isSpeaking && onMicClick) {
      onMicClick(); // Start listening
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <button
        onClick={handleClick}
        className={cn(
          "rounded-full p-4 transition relative",
          isListening
            ? "bg-red-100 ring-4 ring-red-400 animate-pulse"
            : "bg-white hover:bg-blue-200"
        )}
        aria-label="Voice control button"
        title={
          isProcessing
            ? "Processing..."
            : isSpeaking
            ? "Click to interrupt"
            : isListening
            ? "Listening…"
            : "Click to speak"
        }
      >
        {renderState()}
      </button>

      {isWakeWordActive && !isListening && !isSpeaking && !isProcessing && (
        <span className="text-xs text-purple-400 mt-1 animate-pulse">
          Say "Hey Veena"…
        </span>
      )}
    </div>
  );
};
