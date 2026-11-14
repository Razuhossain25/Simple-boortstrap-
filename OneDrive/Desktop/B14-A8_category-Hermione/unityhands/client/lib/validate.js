import { TYPES, tomorrow } from "./constants";

// Mirrors the server rules so people see the problem before the request is sent.
export function validateEvent(v) {
  const e = {};
  if (!v.title || v.title.trim().length < 5) e.title = "Title must be at least 5 characters.";
  if (!v.description || v.description.trim().length < 20) e.description = "Description must be at least 20 characters.";
  if (!TYPES.includes(v.eventType)) e.eventType = "Choose an event type.";
  if (!v.location || !v.location.trim()) e.location = "Location is required.";
  try {
    new URL(v.thumbnail);
  } catch {
    e.thumbnail = "Enter a valid image URL, starting with https://.";
  }
  if (!v.eventDate || v.eventDate < tomorrow()) e.eventDate = "Pick a date in the future.";
  return e;
}

export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || "");

export function isUrl(s) {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}
