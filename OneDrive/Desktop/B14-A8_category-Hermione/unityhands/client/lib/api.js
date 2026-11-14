import { authClient } from "./auth-client";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

// Calls the Express API. With auth: true it attaches a fresh BetterAuth JWT.
export async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth) {
    const { data, error } = await authClient.token();
    if (error || !data?.token) throw new Error("Please log in again. Your session could not be verified.");
    headers.Authorization = `Bearer ${data.token}`;
  }
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || "Something went wrong. Please try again.");
  return json;
}
