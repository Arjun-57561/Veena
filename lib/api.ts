import type { CustomerData } from "@/hooks/useVoiceAgent";

/**
 * Calls real backend /api/veena_welcome endpoint
 */
export async function getWelcome(lang: string, userId: string, name: string = "Arjun") {
  const res = await fetch("http://localhost:5000/api/veena_welcome", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lang, user_id: userId, full_name: name }),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch welcome message: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Calls real backend /api/query_customer endpoint
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
  const res = await fetch("http://localhost:5000/api/query_customer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      user_id: userId,
      customerData,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to query Veena: ${res.statusText}`);
  }

  return res.json();
}
