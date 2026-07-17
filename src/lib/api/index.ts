const BASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ""

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  return res.json()
}

export const paymentsApi = {
  createPayment: (data: unknown) =>
    request<unknown>("/functions/v1/create-payment", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

export const newsletterApi = {
  subscribe: (data: { email: string; source?: string; name?: string }) =>
    request<{ success: boolean; message: string }>("/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  unsubscribe: (email: string) =>
    request<{ success: boolean; message: string }>("/newsletter/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  check: (email: string) =>
    request<{ success: boolean; data: { subscribed: boolean } }>(
      `/newsletter/check?email=${encodeURIComponent(email)}`,
    ),
}
