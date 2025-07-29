"use client"

import Image from "next/image"

interface VeenaLogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function VeenaLogo({ size = "md", className = "" }: VeenaLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-base",
    md: "w-12 h-12 text-xl",
    lg: "w-16 h-16 text-2xl",
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <Image
          src="/images/veena-logo.png"
          alt="Veena AI Assistant Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <span className={`text-white font-semibold tracking-wide ${sizeClasses[size]}`}>
        Veena
      </span>
    </div>
  )
}
