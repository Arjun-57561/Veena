"use client"

import { Badge } from "@/components/ui/badge"

interface LiveTranscriptProps {
  currentTranscript: string
  confidence: number
  isListening: boolean
}

export function LiveTranscript({ currentTranscript, confidence, isListening }: LiveTranscriptProps) {
  if (!isListening || !currentTranscript) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 max-w-2xl w-full px-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg p-4 border">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            Live Transcript
          </Badge>
          <Badge
            variant="outline"
            className={`text-xs ${
              confidence > 0.8 ? "text-green-600" : confidence > 0.6 ? "text-yellow-600" : "text-red-600"
            }`}
          >
            {Math.round(confidence * 100)}% confidence
          </Badge>
        </div>
        <p className="text-gray-800 dark:text-gray-200 italic">"{currentTranscript}"</p>
        <div className="mt-2 flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  )
}
