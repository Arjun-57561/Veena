"use client"

import type React from "react"

import { useState } from "react"
import { Send, Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface TextInputFallbackProps {
  onSubmit: (text: string) => void
  isProcessing: boolean
  placeholder?: string
}

export function TextInputFallback({ onSubmit, isProcessing, placeholder }: TextInputFallbackProps) {
  const [inputText, setInputText] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim() && !isProcessing) {
      onSubmit(inputText.trim())
      setInputText("")
    }
  }

  return (
    <Card className="mx-4 mb-4 bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Keyboard className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-300">Text Input Mode</span>
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={placeholder || "Type your message here..."}
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            disabled={isProcessing}
          />
          <Button type="submit" disabled={!inputText.trim() || isProcessing} className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
