const API_BASE = import.meta.env.VITE_API_URL || "https://journey-of-life-production.up.railway.app/api";



// Entries
export async function fetchEntries() {
  const res = await fetch(`${API_BASE}/entries`);
  return res.json();
}

export async function createEntry(text, analysis = null) {
  const res = await fetch(`${API_BASE}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, analysis }),
  });
  return res.json();
}

// Highlights
export async function fetchHighlights() {
  const res = await fetch(`${API_BASE}/highlights`);
  return res.json();
}

export async function createHighlight(text, planned_date = null) {
  const res = await fetch(`${API_BASE}/highlights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, planned_date }),
  });
  return res.json();
}

export async function toggleHighlight(id) {
  const res = await fetch(`${API_BASE}/highlights/${id}/toggle`, {
    method: "PATCH",
  });
  return res.json();
}

export async function deleteHighlight(id) {
  const res = await fetch(`${API_BASE}/highlights/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

// Habits
export async function fetchHabits() {
  const res = await fetch(`${API_BASE}/habits`);
  return res.json();
}

export async function addHabit(title) {
  const res = await fetch(`${API_BASE}/habits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return res.json();
}

export async function toggleHabit(id) {
  const res = await fetch(`${API_BASE}/habits/${id}/toggle`, {
    method: "PATCH",
  });
  return res.json();
}
