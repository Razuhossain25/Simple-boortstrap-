import { TYPES, tomorrow } from "./constants";

// Mirrors the server rules so people see the problem before the request is sent.
export function validateEvent(v) {
  const e = {};
  if (!v.title || v.title.trim().length < 5) e.title = "Title must be at least 5 characters.";
  if (!v.description || v.description.trim().length < 20) e.description = "Description must be at least 20 characters.";
  if (!TYPES.includes(v.eventType)) e.eventType = "Choose an event type.";
  if (!v.location || !v.location.trim()) e.location = "Location is required.";
  if (!isUrl(v.thumbnail)) e.thumbnail = "Enter an HTTP or HTTPS image URL.";
  if (!isDate(v.eventDate) || v.eventDate < tomorrow()) e.eventDate = "Pick a date in the future.";
  return e;
}

export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || "");

export function isUrl(s) {
  try {
    return ["http:", "https:"].includes(new URL(s).protocol);
  } catch {
    return false;
  }
}

export function isDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
