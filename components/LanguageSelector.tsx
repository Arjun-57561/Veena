"use client"

import { Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  description: string
}

const languages: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    description: "Global communication",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिंदी",
    flag: "🇮🇳",
    description: "भारत की राष्ट्रीय भाषा",
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    flag: "🇮🇳",
    description: "महाराष्ट्राची भाषा",
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    flag: "🇮🇳",
    description: "ગુજરાતની ભાષા",
  },
]

interface LanguageSelectorProps {
  currentLanguage: string
  onLanguageChange: (language: string) => void
  compact?: boolean
}

export function LanguageSelector({ currentLanguage, onLanguageChange, compact = false }: LanguageSelectorProps) {
  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Globe className="w-4 h-4 text-gray-400" />
        <div className="flex space-x-1">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={currentLanguage === lang.code ? "default" : "ghost"}
              size="sm"
              onClick={() => onLanguageChange(lang.code)}
              className={`px-2 py-1 text-xs ${
                currentLanguage === lang.code
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              {lang.flag} {lang.code.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center space-x-2">
          <Globe className="w-5 h-5 text-blue-400" />
          <span>Choose Your Language</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant="ghost"
            onClick={() => onLanguageChange(lang.code)}
            className={`w-full justify-start p-4 h-auto ${
              currentLanguage === lang.code
                ? "bg-blue-600/20 border border-blue-500 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left">
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-sm opacity-70">{lang.description}</div>
                </div>
              </div>
              {currentLanguage === lang.code && <Check className="w-5 h-5 text-blue-400" />}
            </div>
          </Button>
        ))}
        <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800">
          <p className="text-sm text-blue-200">
            <span className="font-medium">Current:</span>{" "}
            {languages.find((l) => l.code === currentLanguage)?.nativeName} - Veena will understand and respond in this
            language.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
