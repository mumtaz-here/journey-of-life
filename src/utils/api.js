// ✅ src/utils/api.js (FINAL LOCAL VERSION)
// ----------------------------------------------------
// Routes ke backend lokal (http://localhost:5000/api)
// ----------------------------------------------------

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

// safer fetch
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ API Error:", err.message);
    return null;
  }
}

/* -------- ENTRIES -------- */
export async function fetchEntries() {
  return safeFetch(`${API_BASE_URL}/entries`);
}

export async function createEntry(text, analysis = null) {
  return safeFetch(`${API_BASE_URL}/entries`, {
    method: "POST",
    body: JSON.stringify({ text, analysis }),
  });
}

/* -------- HIGHLIGHTS -------- */
export async function fetchHighlights() {
  return safeFetch(`${API_BASE_URL}/highlights`);
}

export async function createHighlight(text, planned_date = null) {
  return safeFetch(`${API_BASE_URL}/highlights`, {
    method: "POST",
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

/* -------- HABITS -------- */
export async function fetchHabits() {
  return safeFetch(`${API_BASE_URL}/habits`);
}

export async function addHabit(title) {
  return safeFetch(`${API_BASE_URL}/habits`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function toggleHabit(id) {
  return safeFetch(`${API_BASE_URL}/habits/${id}/toggle`, {
    method: "PATCH",
  });
}

export async function deleteHabit(id) {
  return safeFetch(`${API_BASE_URL}/habits/${id}`, {
    method: "DELETE",
  });
}

/* -------- SUMMARIES -------- */
export async function fetchSummaries() {
  return safeFetch(`${API_BASE_URL}/summaries`);
}
