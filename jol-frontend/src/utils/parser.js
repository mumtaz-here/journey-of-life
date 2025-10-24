/**
 * Journey of Life — Text Parser (Playful Serenity Edition)
 * --------------------------------------------------------
 * Purpose: a lightweight, dependency‑free parser that transforms a free‑form
 * journal entry into calm, structured signals: emotion, sentiment, topics,
 * micro‑tasks, priorities, time hints, and soft entities.
 *
 * Design notes:
 * - Pure functions, deterministic output, small & readable.
 * - English comments + mindful naming.
 * - Gentle scoring (0–1) with simple heuristics; no ML, no external libs.
 * - Optimized for short daily entries; robust to emojis and mixed language.
 *
 * Exported surface:
 *   parseEntry(text: string, options?): ParsedEntry
 *   (plus small helpers for future reuse)
 *
 * Data contract (ParsedEntry):
 * {
 *   meta: { version, parsedAtISO, charCount, wordCount },
 *   emotion: { primary, scores: Record<string, number>, confidence },
 *   sentiment: { valence: number, arousal: number, confidence },
 *   energy: { level: 'low'|'neutral'|'high', cues: string[] },
 *   topics: Array<{ name: string, score: number }>,
 *   tasks: Array<{ text: string, priority: 'low'|'medium'|'high', dueHint?: string }>,
 *   priorities: string[],
 *   time: { dates: string[], times: string[], relative: string[] },
 *   entities: { people: string[], places: string[], things: string[], hashtags: string[] },
 *   keywords: string[],
 *   summary: string
 * }
 */

// ---- Lexicons -------------------------------------------------------------

/** Core emotion lexicon with soft weights (keywords + emojis). */
const EMOTION_LEXICON = {
  joy: {
    words: [
      'joy', 'happy', 'glad', 'grateful', 'gratefully', 'light', 'relieved', 'content',
      'excited', 'smile', 'smiling', 'playful', 'cozy', 'safe', 'calm-happy', 'lega',
    ],
    emojis: ['😊', '😄', '🤗', '✨', '🥰', '😌', '🌿', '🧡']
  },
  calm: {
    words: ['calm', 'peaceful', 'balanced', 'steady', 'grounded', 'present', 'mindful', 'serene', 'ringan'],
    emojis: ['😌', '🌱', '🌿', '🫶']
  },
  hope: {
    words: ['hope', 'optimistic', 'hopeful', 'looking forward', 'bismillah', 'semoga'],
    emojis: ['🌤️', '🌈', '⭐']
  },
  tired: {
    words: ['tired', 'sleepy', 'exhausted', 'drained', 'lelah', 'ngantuk', 'capek'],
    emojis: ['🥱', '😴', '🫠']
  },
  stress: {
    words: ['stressed', 'overwhelmed', 'anxious', 'cemas', 'pusing', 'tegang', 'burnout', 'panik'],
    emojis: ['😰', '😵', '💢']
  },
  sad: {
    words: ['sad', 'down', 'low', 'sedih', 'muram', 'menyesal', 'regret'],
    emojis: ['😔', '😢', '💧']
  },
  anger: {
    words: ['angry', 'marah', 'kesal', 'frustrated', 'annoyed'],
    emojis: ['😠', '😤']
  }
};

/** Negation & intensity cues (soft). */
const NEGATIONS = ['no', "don't", 'not', "isn\'t", "wasn\'t", 'never', 'ga', 'gak', 'bukan', 'tanpa'];
const INTENSIFIERS = ['very', 'so', 'really', 'super', 'banget', 'amat', 'terlalu'];
const SOFTENERS = ['a bit', 'slightly', 'agak', 'sedikit'];

/** Topic hints — keep minimal and kind. */
const TOPIC_LEXICON = {
  work: ['work', 'task', 'deadline', 'project', 'pmo', 'edit', 'upload', 'content'],
  study: ['study', 'learn', 'course', 'read', 'practice', 'code', 'react', 'tailwind'],
  health: ['sleep', 'rest', 'walk', 'exercise', 'skincare', 'sunscreen', 'makan', 'minum'],
  emotion: ['journal', 'feel', 'mood', 'perasaan', 'mindful', 'breath'],
  home: ['clean', 'laundry', 'sweep', 'mop', 'nyapu', 'ngepel', 'kamar', 'rumah'],
  finance: ['budget', 'spend', 'hutang', 'debt', 'token', 'biaya', 'harga'],
  relationships: ['chat', 'call', 'family', 'friend', 'mas', 'bang', 'umi', 'adik'],
  pets: ['cat', 'kucing', 'litter', 'wet food'],
  app: ['journey of life', 'app', 'feature', 'design', 'ui', 'component']
};

/** Lightweight entity regexes. */
const RE_HASHTAG = /#([\p{L}\p{N}_]+)/giu;
const RE_PERSON_HINT = /\b(mas|bang|mb|mba|mbak|umi|ayah|hafshah|faqih|ade)\b/giu;
const RE_DATE = /\b(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})\b/g; // 24/10/25, 24-10-2025
const RE_TIME = /\b(\d{1,2}[:.]\d{2})(?:\s?(am|pm))?\b/gi;   // 18:41, 7.30 am
const RELATIVE_TIME = /(today|yesterday|tomorrow|pagi|siang|malam|now|later|kemarin)/gi;

// ---- Small utilities ------------------------------------------------------

/** Normalize text for token logic without destroying original. */
function normalize(text) {
  return (text || '')
    .replace(/[\u2019\u2018]/g, "'")
    .replace(/[\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Tokenize to words & emojis (very simple). */
function tokenize(text) {
  const split = normalize(text)
    .split(/([\p{Emoji_Presentation}\p{Emoji}\p{Extended_Pictographic}]|[^\p{L}\p{N}]+)/u)
    .map(t => t.trim())
    .filter(Boolean);
  // Collapse punctuation tokens
  return split.filter(t => !/^[-_,.;:()\[\]{}<>]+$/.test(t));
}

/** Count occurrences of a word or emoji around a window with simple negation. */
function scoreByLexicon(tokens, bucket) {
  let score = 0;
  const words = (bucket.words || []).map(w => w.toLowerCase());
  const emojis = bucket.emojis || [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i].toLowerCase();
    const isWordHit = words.some(w => t.includes(w));
    const isEmojiHit = emojis.includes(tokens[i]);
    if (!isWordHit && !isEmojiHit) continue;

    // Base weight
    let w = isEmojiHit ? 0.9 : 0.6;

    // Look left for negation/intensity/softener within 3 tokens
    for (let j = Math.max(0, i - 3); j < i; j++) {
      const lj = tokens[j].toLowerCase();
      if (NEGATIONS.includes(lj)) w *= 0.2;           // negate
      if (INTENSIFIERS.includes(lj)) w *= 1.3;        // intensify
      if (SOFTENERS.includes(lj)) w *= 0.8;           // soften
    }
    score += w;
  }
  return score;
}

/** Softmax‑like normalize to 0–1 per category (stable for zeros). */
function normalizeScores(map) {
  const entries = Object.entries(map);
  const max = Math.max(0.0001, ...entries.map(([, v]) => v));
  const norm = {};
  for (const [k, v] of entries) norm[k] = Math.min(1, +(v / max).toFixed(3));
  return norm;
}

/** Simple language hint (en/id mix support). */
function guessLanguage(text) {
  const idHints = ['dan', 'yang', 'aku', 'kamu', 'gimana', 'banget', 'ngantuk', 'rumah'];
  const enHints = ['and', 'the', 'feel', 'today', 'task', 'sleep'];
  const t = text.toLowerCase();
  const idScore = idHints.reduce((s, w) => s + (t.includes(w) ? 1 : 0), 0);
  const enScore = enHints.reduce((s, w) => s + (t.includes(w) ? 1 : 0), 0);
  if (idScore === 0 && enScore === 0) return 'und';
  return idScore >= enScore ? 'id' : 'en';
}

// ---- Extractors -----------------------------------------------------------

function extractEmotion(tokens) {
  const raw = {};
  for (const [k, bucket] of Object.entries(EMOTION_LEXICON)) {
    raw[k] = scoreByLexicon(tokens, bucket);
  }
  const scores = normalizeScores(raw);
  // choose primary ignoring near‑ties with calm bias
  let primary = 'calm';
  let best = -1;
  for (const [k, v] of Object.entries(scores)) {
    if (v > best) { best = v; primary = k; }
  }
  const confidence = Math.min(1, +(best * 0.85 + 0.15).toFixed(3));
  return { primary, scores, confidence };
}

function extractSentiment(tokens, emotion) {
  // Valence from emotion blend; arousal from (joy|anger|stress|tired)
  const e = emotion.scores;
  const valence = +( (
    (e.joy || 0) + (e.calm || 0) + (e.hope || 0) - (e.sad || 0) - (e.anger || 0) - (e.stress || 0)
  ) / 3 ).toFixed(3);
  const arousal = +( (
    (e.anger || 0) + (e.stress || 0) + (e.joy || 0) - (e.tired || 0)
  ) / 3 ).toFixed(3);
  // Normalize to -1..1 for valence, 0..1 for arousal (soft clamp)
  const vNorm = Math.max(-1, Math.min(1, valence));
  const aNorm = Math.max(0, Math.min(1, (arousal + 1) / 2));
  const confidence = +(0.6 + 0.4 * emotion.confidence).toFixed(3);
  return { valence: vNorm, arousal: aNorm, confidence };
}

function extractEnergy(tokens) {
  const t = tokens.map(x => x.toLowerCase());
  const cues = [];
  if (t.some(x => ['tired','sleepy','drained','lelah','ngantuk','capek'].includes(x))) cues.push('low-cues');
  if (t.some(x => ['excited','semangat','energetic'].includes(x))) cues.push('high-cues');
  const level = cues.includes('high-cues') ? 'high' : cues.includes('low-cues') ? 'low' : 'neutral';
  return { level, cues };
}

function extractTopics(text) {
  const t = text.toLowerCase();
  const result = [];
  for (const [name, hints] of Object.entries(TOPIC_LEXICON)) {
    const score = hints.reduce((s, h) => s + (t.includes(h) ? 1 : 0), 0);
    if (score > 0) result.push({ name, score: Math.min(1, score / 3) });
  }
  return result.sort((a,b) => b.score - a.score);
}

function extractTasks(text) {
  // Lines with bullets, checkboxes, or imperative verbs at start
  const lines = text.split(/\n|•/).map(s => s.trim()).filter(Boolean);
  const tasks = [];
  for (const line of lines) {
    const isBullet = /^[-*]\s+/.test(line) || /^\[(?: |x|X)\]\s+/.test(line);
    const imperative = /^(finish|clean|write|edit|upload|learn|study|code|call|pay|buy|cook|journal|review)\b/i.test(line);
    if (isBullet || imperative) {
      const text = line.replace(/^[-*]\s+/, '')
                       .replace(/^\[(?: |x|X)\]\s+/, '')
                       .trim();
      // Priority hints
      let priority = 'medium';
      const lower = text.toLowerCase();
      if (/[!]{2,}/.test(text) || /(urgent|today|now|segera)/i.test(text)) priority = 'high';
      if (/(later|sometime|besok|minggu depan)/i.test(text)) priority = 'low';
      const dueHintMatch = text.match(/\b(today|tonight|tomorrow|besok|this week|weekend)\b/i);
      tasks.push({ text, priority, dueHint: dueHintMatch?.[0] });
    }
  }
  // Cap at 8 to keep UI calm
  return tasks.slice(0, 8);
}

function extractPriorities(text) {
  const lines = text.split(/\n/);
  const out = [];
  let capture = false;
  for (const line of lines) {
    const l = line.toLowerCase();
    if (/today\'s priorities|priorities today|focus today|prioritas hari ini/.test(l)) { capture = true; continue; }
    if (capture && l.trim() === '') break;
    if (capture) out.push(line.replace(/^[-*]\s+/, '').trim());
  }
  // Fallback: pick highest‑priority tasks if explicit bar absent
  if (out.length === 0) {
    const tasks = extractTasks(text).filter(t => t.priority === 'high').map(t => t.text);
    return tasks.slice(0, 3);
  }
  return out.slice(0, 3);
}

function extractTime(text) {
  const dates = [...new Set((text.match(RE_DATE) || []).map(s => s))];
  const times = [...new Set((text.match(RE_TIME) || []).map(s => s[0] ? s[0] : s))];
  const relative = [...new Set((text.match(RELATIVE_TIME) || []).map(s => s.toLowerCase()))];
  return { dates, times, relative };
}

function extractEntities(text) {
  const hashtags = [...new Set(Array.from(text.matchAll(RE_HASHTAG)).map(m => `#${m[1]}`))];
  const people = [...new Set(Array.from(text.matchAll(RE_PERSON_HINT)).map(m => m[0]))];
  // Places & things: very soft heuristics via keywords
  const lower = text.toLowerCase();
  const places = [];
  if (/(bekasi|bogor|solo|klaten|jakarta|bandung)/.test(lower)) {
    places.push(...(lower.match(/bekasi|bogor|solo|klaten|jakarta|bandung/g) || []));
  }
  const things = [];
  if (/(smartwatch|mouse|keyboard|ac|galon|sunscreen)/.test(lower)) {
    things.push(...(lower.match(/smartwatch|mouse|keyboard|ac|galon|sunscreen/g) || []));
  }
  return { people, places, things, hashtags };
}

function extractKeywords(tokens) {
  // Keep simple: 3–10 chars, letters only, frequency >= 2, not in stoplist
  const STOP = new Set(['the','and','you','are','for','with','have','this','that','atau','dan','aku','kamu','yang','jadi','udah','gitu','kalo','bgt']);
  const map = new Map();
  for (const t of tokens) {
    const s = t.toLowerCase();
    if (!/^[\p{L}]{3,10}$/u.test(s)) continue;
    if (STOP.has(s)) continue;
    map.set(s, (map.get(s) || 0) + 1);
  }
  return Array.from(map.entries())
    .filter(([, c]) => c >= 2)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 10)
    .map(([k]) => k);
}

function buildSummary(data) {
  const mood = data.emotion.primary;
  const topTopic = data.topics[0]?.name;
  const p = data.priorities?.length ? `Focus: ${data.priorities.join(' · ')}` : '';
  const t = topTopic ? `Theme: ${topTopic}.` : '';
  return [
    `Tone: ${mood}.`,
    t,
    p
  ].filter(Boolean).join(' ');
}

// ---- Main ---------------------------------------------------------------

/**
 * @typedef {ReturnType<typeof parseEntry>} ParsedEntry
 */

/**
 * Parse a free‑form entry into calm structure.
 * @param {string} text
 * @param {{ languageHint?: 'en'|'id'|'und' }} [options]
 */
function parseEntry(text, options = {}) {
  const raw = normalize(text);
  const tokens = tokenize(raw);

  const emotion = extractEmotion(tokens);
  const sentiment = extractSentiment(tokens, emotion);
  const energy = extractEnergy(tokens);
  const topics = extractTopics(raw);
  const tasks = extractTasks(text);
  const priorities = extractPriorities(text);
  const time = extractTime(text);
  const entities = extractEntities(text);
  const keywords = extractKeywords(tokens);

  const data = {
    meta: {
      version: '1.0.0',
      parsedAtISO: new Date().toISOString(),
      charCount: raw.length,
      wordCount: tokens.filter(t => /[\p{L}\p{N}]/u.test(t)).length
    },
    language: options.languageHint || guessLanguage(text),
    emotion,
    sentiment,
    energy,
    topics,
    tasks,
    priorities,
    time,
    entities,
    keywords,
    summary: '' // filled below
  };

  data.summary = buildSummary(data);
  return data;
}

// ---- Exports -------------------------------------------------------------

export { parseEntry };
export const _internals = {
  normalize, tokenize, extractEmotion, extractSentiment, extractEnergy,
  extractTopics, extractTasks, extractPriorities, extractTime,
  extractEntities, extractKeywords, buildSummary
};
