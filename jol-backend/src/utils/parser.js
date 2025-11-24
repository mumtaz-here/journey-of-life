/**
 * Journey of Life — Backend Text Parser (Intent-aware + Priorities)
 * ----------------------------------------------------------------
 * Extracts: mood, keywords, plans (highlights), priorities (max candidates).
 * (mood manual dihapus — nanti diganti AI)
 */

export function parseEntry(text) {
  const lower = text.toLowerCase();

  // mood tidak dipakai lagi (manual detection dihapus)
  let mood = null;

  // keywords
  const stop = [
    "the","and","this","that","with","about","from","into","there","their",
    "today","yesterday","tomorrow","feel","felt","really","very","just"
  ];
  const tokens = lower.split(/[^a-z0-9]+/).filter(Boolean);
  const words = tokens.filter((w) => w.length > 2 && !stop.includes(w));
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const keywords = Object.entries(freq)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,3)
    .map(([w])=>w);

  // plans (highlights)
  const intentVerbs = ["will", "plan to", "want to", "going to", "gonna", "have to", "need to"];
  const timeWords = ["tomorrow", "later", "tonight", "this evening", "this afternoon", "this morning"];

  const sentences = text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const plans = [];
  const priorities = [];

  for (const s of sentences) {
    const sLower = s.toLowerCase();

    // planned date
    let plannedDate = null;
    const isoMatch = sLower.match(/\bon\s+(\d{4}-\d{2}-\d{2})\b/);
    if (isoMatch) plannedDate = isoMatch[1];
    if (!plannedDate && sLower.includes("tomorrow")) plannedDate = isoFromOffset(1);
    if (!plannedDate && (sLower.includes("today") || timeWords.some(t => sLower.includes(t))))
      plannedDate = isoFromOffset(0);

    // plans
    const intentRegex = new RegExp(
      `\\b(?:${intentVerbs.map(escapeReg).join("|")})\\s+([^.!?]{3,120})`,
      "i"
    );
    const m = s.match(intentRegex);
    if (m) {
      const action = tidyAction(m[1]);
      if (action) plans.push({ title: action, planned_date: plannedDate || null });
    }

    // priorities
    const prioRegex = /\b(?:need to|must|should|have to|priority(?: is)?(?: to)?)\s+([^.!?]{3,120})/i;
    const pm = s.match(prioRegex);
    if (pm) {
      const action = tidyAction(pm[1]);
      if (action) priorities.push({ title: action, date: isoFromOffset(0) });
    }
  }

  return { mood, keywords, plans, priorities };
}

function isoFromOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${dd}`;
}

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tidyAction(raw) {
  let t = raw.trim();
  t = t.replace(/^\s*to\s+/i, "");
  t = t.replace(/\s+(tomorrow|today|later|tonight|this morning|this afternoon|this evening)\b.*$/i, "");
  t = t.replace(/\s*(?:and|but|so|because|then|after)\s.*$/i, "");
  t = t.replace(/[,.;:]+$/,"").trim();
  if (t.length < 3) return null;
  return t;
}
