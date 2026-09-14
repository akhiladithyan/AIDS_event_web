import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function safeJsonResponse<T = any>(res: Response, fallback: T = {} as T): Promise<T> {
  if (!res) return fallback;
  try {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    const text = await res.text();
    if (!text || text.trim().startsWith("<") || text.trim().startsWith("<!DOCTYPE")) {
      console.warn(`[safeJsonResponse] Non-JSON response received from ${res.url} (Status: ${res.status})`);
      return fallback;
    }
    return JSON.parse(text);
  } catch (err) {
    console.warn(`[safeJsonResponse] Error parsing response from ${res.url}:`, err);
    return fallback;
  }
}

