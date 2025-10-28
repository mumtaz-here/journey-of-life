/**
 * Journey of Life — Intent Parser (English)
 * ----------------------------------------
 * Extracts simple "plan" intents from free text and returns
 * [{ text, planned_date }] using local server date as reference.
 *
 * Rules (soft):
 * - Phrases with "tomorrow", "today", "next week", "on <weekday>", "on <YYYY-MM-DD>"
 * - Verbs: will, plan to, going to, want to
 * - Output text = concise action phrase (original sentence trimmed)
 *
 * NOTE: This is intentionally lightweight & deterministic (no ML).
 */

const WEEKDAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function parseExplicitISO(token) {
  // YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(token)) return null;
  const d = new Date(token + "T00:00:00");
  return isNaN(d.getTime()) ? null : token;
}

function nextWeekday(from, weekday) {
  const d = new Date(from);
  const current = d.getDay(); // 0..6
  const target = WEEKDAYS.indexOf(weekday.toLowerCase());
  if (target < 0) return null;
  let diff = target - current;
  if (diff <= 0) diff += 7;
  const nd = addDays(d, diff);
  return toISODate(nd);
}

function normalizeSentence(s) {
  return s
    .replace(/\s+/g, " ")
    .replace(/^[-–•\s]+/, "")
    .trim();
}

export function extractPlans(text, baseDate = new Date()) {
  if (!text || typeof text !== "string") return [];
  const plans = [];
  const todayISO = toISODate(baseDate);
  const tomorrowISO = toISODate(addDays(baseDate, 1));

  // Split by sentence-ish delimiters
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/g)
    .map(normalizeSentence)
    .filter(Boolean);

  for (const s of sentences) {
    const low = s.toLowerCase();

    // Must contain an intent verb to reduce false positives
    const hasIntent =
      /\b(will|plan to|planning to|going to|want to|wanna|intend to)\b/.test(low);

    if (!hasIntent) continue;

    // Date heuristics
    let planned = null;

    if (/\btoday\b/.test(low)) {
      planned = todayISO;
    } else if (/\btomorrow\b/.test(low)) {
      planned = tomorrowISO;
    } else {
      // next week → +7d
      if (/\bnext week\b/.test(low)) {
        planned = toISODate(addDays(baseDate, 7));
      }
      // on <weekday>
      const wd = WEEKDAYS.find((w) => new RegExp(`\\bon\\s+${w}\\b`).test(low));
      if (!planned && wd) {
        planned = nextWeekday(baseDate, wd);
      }
      // explicit YYYY-MM-DD
      const isoMatch = low.match(/\bon\s+(\d{4}-\d{2}-\d{2})\b/);
      if (!planned && isoMatch) {
        const iso = parseExplicitISO(isoMatch[1]);
        if (iso) planned = iso;
      }
    }

    // Build concise text
    // Strip leading subjects like "I will", "I'm going to", etc.
    let concise = s
      .replace(/\b(I\s+will|I'll|I am going to|I'm going to|I plan to|I intend to|I want to|I wanna)\b/i, "")
      .replace(/\b(will|going to|plan to|planning to|intend to|want to|wanna)\b/i, "")
      .replace(/\b(tomorrow|today|next week|on\s+\d{4}-\d{2}-\d{2}|on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi, "")
      .replace(/^\s*to\b/i, "") // "to play padel" -> "play padel"
      .trim();

    // Fallback if we trimmed too much
    if (!concise) concise = s;

    plans.push({
      text: concise.charAt(0).toLowerCase() + concise.slice(1),
      planned_date: planned || null,
    });
  }

  // Deduplicate by (text + planned_date)
  const uniq = [];
  const seen = new Set();
  for (const p of plans) {
    const key = `${p.text}__${p.planned_date || "null"}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(p);
    }
  }
  return uniq;
}
