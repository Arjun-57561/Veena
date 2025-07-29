"use client"

import { useRef, useEffect } from "react"
import { Play, Pause, Heart, AlertTriangle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { ConversationTurn } from "../hooks/useVoiceAgent"

interface ConversationViewProps {
  conversation: ConversationTurn[]
  playingAudio: string | null
  onPlayAudio: (messageId: string) => void
}

export function ConversationView({ conversation, playingAudio, onPlayAudio }: ConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const getIntentColor = (intent: string) => {
    const colors: Record<string, string> = {
      greeting: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      policy_query: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      payment_query: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      claim_query: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      general_query: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    }
    return colors[intent] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
      {conversation.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to Help</h3>
          <p className="text-gray-600 dark:text-gray-400">Say "Hey Veena" to start a conversation</p>
        </div>
      )}

      {conversation.map((message) => (
        <div key={message.id} className={`flex ${message.speaker === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-2xl ${message.speaker === "user" ? "order-2" : "order-1"}`}>
            <div className="flex items-center space-x-2 mb-1">
              <Avatar className="w-6 h-6">
                <AvatarFallback
                  className={`text-xs ${
                    message.speaker === "user" ? "bg-blue-500 text-white" : "bg-purple-500 text-white"
                  }`}
                >
                  {message.speaker === "user" ? "U" : "V"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {message.speaker === "user" ? "You" : "Veena"}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{formatTime(message.timestamp)}</span>
              {message.latency && (
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  {message.latency}ms
                </Badge>
              )}
              {message.confidence && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(message.confidence * 100)}%
                </Badge>
              )}
            </div>

            <Card
              className={`${
                message.speaker === "user"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              }`}
            >
              <CardContent className="p-3">
                <p className="text-sm leading-relaxed">{message.text}</p>

                {/* Intent and Entities */}
                {(message.intent || message.entities) && (
                  <div className="mt-3 space-y-2">
                    {message.intent && (
                      <Badge className={`text-xs ${getIntentColor(message.intent)}`}>
                        Intent: {message.intent.replace("_", " ")}
                      </Badge>
                    )}

                    {message.entities && Object.keys(message.entities).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(message.entities).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            <span className="font-medium">{key}:</span> {value}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Objection and Rebuttal */}
                {message.objection && (
                  <div className="mt-3 space-y-1">
                    <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Objection: {message.objection.replace("_", " ")}
                    </Badge>
                    {message.rebuttal && (
                      <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Rebuttal: {message.rebuttal.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Empathy Indicator */}
                {message.empathy && (
                  <div className="mt-2">
                    <Badge className="text-xs bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300">
                      <Heart className="w-3 h-3 mr-1" />
                      Empathetic Response
                    </Badge>
                  </div>
                )}

                {/* Audio Controls for Agent Messages */}
                {message.speaker === "agent" && (
                  <div className="mt-3 flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPlayAudio(message.id)}
                      className="h-6 px-2 text-xs"
                    >
                      {playingAudio === message.id ? (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          Playing...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Replay
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
