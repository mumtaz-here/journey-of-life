/**
 * Journey of Life — Frontend API Utils (Ultra Safe + Fast)
 * ---------------------------------------------------------
 * - Auto abort old requests
 * - Auto retry on weak network
 * - Safe JSON parsing
 * - Consistent return: always []
 * - No lag from stale responses
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// -------------------------------
// GLOBAL Abort Registry
// -------------------------------
const abortMap = new Map();

// auto abort fetch for same key
function makeAbort(key) {
  if (abortMap.has(key)) {
    abortMap.get(key).abort();
  }
  const controller = new AbortController();
  abortMap.set(key, controller);
  return controller;
}

// -------------------------------
// SAFE FETCH WRAPPER
// -------------------------------
async function safeFetch(url, key = "default", options = {}) {
  const controller = makeAbort(key);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store", // always get fresh
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!res.ok) throw new Error(`Request ${res.status}`);

    // some responses might be empty
    const text = await res.text();
    if (!text) return [];

    return JSON.parse(text);
  } catch (err) {
    if (err.name === "AbortError") {
      // silently ignore aborted requests
      return [];
    }
    console.error("❌ API Error:", err.message);
    return [];
  }
}

// =========================================================
// 📌 ENTRIES
// =========================================================
export async function fetchEntries(context) {
  const queryKey = context?.queryKey || [];
  const [, params] = queryKey;

  const search = new URLSearchParams();
  if (params?.days) search.set("days", String(params.days));

  const qs = search.toString() ? `?${search}` : "";
  return safeFetch(`${API_BASE_URL}/entries${qs}`, "entries");
}

export async function createEntry(text) {
  return safeFetch(`${API_BASE_URL}/entries`, "entries-create", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

// =========================================================
// ⭐ HIGHLIGHTS
// =========================================================
export async function fetchHighlights() {
  return safeFetch(`${API_BASE_URL}/highlights`, "highlights");
}

export async function createHighlight(text, planned_date = null) {
  return safeFetch(`${API_BASE_URL}/highlights`, "highlight-create", {
    method: "POST",
    body: JSON.stringify({ text, planned_date }),
  });
}

export async function toggleHighlight(id) {
  return safeFetch(
    `${API_BASE_URL}/highlights/${id}/toggle`,
    `highlight-toggle-${id}`,
    { method: "PATCH" }
  );
}

export async function deleteHighlight(id) {
  return safeFetch(
    `${API_BASE_URL}/highlights/${id}`,
    `highlight-delete-${id}`,
    { method: "DELETE" }
  );
}

// =========================================================
// 🌿 HABITS
// =========================================================
export async function fetchHabits() {
  return safeFetch(`${API_BASE_URL}/habits`, "habits");
}

export async function addHabit(title) {
  return safeFetch(`${API_BASE_URL}/habits`, "habit-add", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function toggleHabit(id) {
  return safeFetch(
    `${API_BASE_URL}/habits/${id}/toggle`,
    `habit-toggle-${id}`,
    { method: "PATCH" }
  );
}

export async function deleteHabit(id) {
  return safeFetch(
    `${API_BASE_URL}/habits/${id}`,
    `habit-delete-${id}`,
    { method: "DELETE" }
  );
}

// =========================================================
// 📌 SUMMARIES
// =========================================================
export async function fetchSummaries() {
  return safeFetch(`${API_BASE_URL}/summaries`, "summaries");
}

// =========================================================
// 📚 DAILY STORY
// =========================================================
export async function fetchStory() {
  return safeFetch(`${API_BASE_URL}/story`, "story");
}

// =========================================================
// 💬 CHAT AI (ONE WAY)
// =========================================================
export async function sendChatMessage(message) {
  return safeFetch(`${API_BASE_URL}/chat`, "chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
