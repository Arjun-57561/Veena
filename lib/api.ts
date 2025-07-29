// lib/api.ts

import type { CustomerData } from "@/hooks/useVoiceAgent";

/**
 * FAKE getWelcome - Simulates backend /api/veena_welcome
 */
export async function getWelcome(lang: string, userId: string, name: string = "Sir/Madam") {
  // Simulate a short delay like a real backend
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    response: `Hello ${name}, this is Veena, your assistant. Let's get started.`,
    audio_url: null, // You can set a demo MP3 path here if needed
    lang,
  };
}

/**
 * FAKE queryVeena - Simulates backend /api/query_customer
 */
export async function queryVeena({
  text,
  userId,
  customerData,
}: {
  text: string;
  userId: string;
  customerData: CustomerData;
}) {
  console.log("Fake query sent:", text, customerData);

  // Simulate a delay like network + LLM response
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    response: `Got it! Based on what you said: "${text}", we'll continue.`,
    audio_url: null,
    lang: "en",
    customerData,
  };
}
