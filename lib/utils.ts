import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatCompactINR(n: number): string {
  if (n >= 1e7) return `${(n / 1e7).toFixed(1)} Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(1)} Lac`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return `${n}`;
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

/**
 * Safely parse a fetch response body as JSON. If the response is not JSON
 * (e.g. an HTML error page or a gateway/proxy error), returns `null` instead of
 * throwing "Unexpected token '<' ...". Callers should fall back to a clear
 * message when this returns null.
 */
export async function safeJson<T = Record<string, unknown>>(
  res: Response,
): Promise<T | null> {
  try {
    const text = await res.text();
    if (text.startsWith("{") || text.startsWith("[")) {
      return JSON.parse(text) as T;
    }
    return null;
  } catch {
    return null;
  }
}
