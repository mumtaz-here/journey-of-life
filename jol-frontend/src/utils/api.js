// ✅ src/utils/api.js
// ----------------------------------------------------
// This file handles all API requests for Journey of Life.
// It automatically switches between localhost and production
// based on the .env environment variable.
// ----------------------------------------------------

// Ambil base URL dari .env (frontend)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://journey-of-life-production.up.railway.app/api";

// ✅ Helper untuk handle error dengan aman
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ API Error:", err.message);
    return null;
  }
}

// 🪶 ENTRIES ----------------------------------------------------
export async function fetchEntries() {
  return safeFetch(`${API_BASE_URL}/entries`);
}

export async function createEntry(text, analysis = null) {
  return safeFetch(`${API_BASE_URL}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, analysis }),
  });
}

// ✨ HIGHLIGHTS -------------------------------------------------
export async function fetchHighlights() {
  return safeFetch(`${API_BASE_URL}/highlights`);
}

export async function createHighlight(text, planned_date = null) {
  return safeFetch(`${API_BASE_URL}/highlights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, planned_date }),
  });
}

export async function toggleHighlight(id) {
  return safeFetch(`${API_BASE_URL}/highlights/${id}/toggle`, {
    method: "PATCH",
  });
}

export async function deleteHighlight(id) {
  return safeFetch(`${API_BASE_URL}/highlights/${id}`, {
    method: "DELETE",
  });
}

// 🌿 HABITS -----------------------------------------------------
export async function fetchHabits() {
  return safeFetch(`${API_BASE_URL}/habits`);
}

export async function addHabit(title) {
  return safeFetch(`${API_BASE_URL}/habits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

export async function toggleHabit(id) {
  return safeFetch(`${API_BASE_URL}/habits/${id}/toggle`, {
    method: "PATCH",
  });
}
