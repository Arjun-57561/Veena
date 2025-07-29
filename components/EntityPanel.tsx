"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Phone, Mail, CreditCard, Calendar, User, FileText, CheckCircle, XCircle } from "lucide-react"
import type { CustomerData } from "../hooks/useVoiceAgent"
import { getWelcome } from "@/lib/api";

interface EntityPanelProps {
  customerData: CustomerData
  onUpdateCustomerData: (data: CustomerData) => void
  metrics: {
    averageLatency: number
    totalTurns: number
    successRate: number
  }
}

export function EntityPanel({ customerData, onUpdateCustomerData, metrics }: EntityPanelProps) {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const updateField = (field: string, value: string) => {
    onUpdateCustomerData({ ...customerData, [field]: value })
    setErrors((prev) => ({ ...prev, [field]: "" })) // Clear error on change
  }

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {}
    const { policyNumber, premium, paymentDate, phoneNumber, email } = customerData

    if (!/^[a-zA-Z0-9]+$/.test(policyNumber || ""))
      newErrors.policyNumber = "Policy must be alphanumeric"

    if (!/^\d+$/.test(premium || ""))
      newErrors.premium = "Premium must be numeric"

    if (!paymentDate || isNaN(Date.parse(paymentDate)))
      newErrors.paymentDate = "Invalid date"

    if (!/^\d{10,15}$/.test(phoneNumber || ""))
      newErrors.phoneNumber = "Phone must be 10–15 digits"

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || ""))
      newErrors.email = "Invalid email"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

const handleSubmit = async () => {
  if (!validateFields()) {
    setSubmitStatus("error");
    setTimeout(() => setSubmitStatus("idle"), 3000);
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/save_customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    });

    if (res.ok) {
      setSubmitStatus("success");

      // ✅ Trigger welcome message after successful form submission
      const userId = "demo_user"; // or dynamically set if needed
      const lang = "en"; // or pull from state if you're supporting multilingual
      const welcome = await getWelcome(lang, userId);
      if (welcome?.audio_url) {
        new Audio(welcome.audio_url).play();
      }
    } else {
      throw new Error("Submission failed");
    }
  } catch (err) {
    console.error("Error submitting form", err);
    setSubmitStatus("error");
  } finally {
    setTimeout(() => setSubmitStatus("idle"), 3000);
  }
};

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
      <Card className="m-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              Customer Profile
            </div>
            <Badge variant="secondary" className="text-xs animate-pulse">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "name", icon: <User className="w-3 h-3 mr-1" />, label: "Full Name", key: "name" },
              { id: "policyNumber", icon: <FileText className="w-3 h-3 mr-1" />, label: "Policy Number", key: "policyNumber" },
              { id: "premium", icon: <CreditCard className="w-3 h-3 mr-1" />, label: "Premium Amount", key: "premium" },
              { id: "paymentDate", icon: <Calendar className="w-3 h-3 mr-1" />, label: "Payment Due Date", key: "paymentDate" },
              { id: "phoneNumber", icon: <Phone className="w-3 h-3 mr-1" />, label: "Phone Number", key: "phoneNumber" },
              { id: "email", icon: <Mail className="w-3 h-3 mr-1" />, label: "Email Address", key: "email", type: "email" },
            ].map(({ id, icon, label, key, type }) => (
              <div key={id}>
                <Label htmlFor={id} className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center">
                  {icon}
                  {label}
                </Label>
                <Input
                  id={id}
                  type={type || "text"}
                  value={customerData[key as keyof CustomerData] || ""}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="mt-1"
                  placeholder={label}
                />
                {errors[key] && <div className="text-xs text-red-500">{errors[key]}</div>}
              </div>
            ))}

            <div>
              <Label htmlFor="paymentMode" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Payment Mode
              </Label>
              <Select
                value={customerData.paymentMode || ""}
                onValueChange={(value) => updateField("paymentMode", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  {["Online", "Monthly Installments", "Bank Transfer", "Cash", "Cheque"].map((mode) => (
                    <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
            Submit Details
          </Button>

          {submitStatus === "success" && (
            <div className="text-green-500 text-sm mt-2 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" /> Submitted successfully!
            </div>
          )}
          {submitStatus === "error" && (
            <div className="text-red-500 text-sm mt-2 flex items-center">
              <XCircle className="w-4 h-4 mr-1" /> Please fix the highlighted fields.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="m-4">
        <CardHeader>
          <CardTitle className="text-lg">Session Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</span>
            <Badge
              variant="secondary"
              className={`font-mono ${
                metrics.averageLatency < 1000
                  ? "text-green-600"
                  : metrics.averageLatency < 2000
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {Math.round(metrics.averageLatency)}ms
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Turns</span>
            <Badge variant="secondary" className="font-mono">{metrics.totalTurns}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
            <Badge
              className={`font-mono ${
                metrics.successRate >= 95
                  ? "bg-green-100 text-green-800"
                  : metrics.successRate >= 80
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {metrics.successRate}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
