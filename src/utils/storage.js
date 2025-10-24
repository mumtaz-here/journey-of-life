/**
 * Journey of Life — Storage Utility (Playful Serenity Edition)
 * ------------------------------------------------------------
 * Purpose: calm, minimal wrapper around localStorage for all app data.
 * Designed for gentle persistence: readable keys, no surprises,
 * easy to migrate to backend later.
 *
 * Principles:
 * - Prefix every key with "journey-" to stay organized.
 * - Fail gracefully (no console spam, no errors on quota).
 * - Keep operations synchronous and deterministic.
 * - Serialize JSON safely (reviver-ready for future backend sync).
 *
 * Exported surface:
 *   save(type, data)
 *   load(type)
 *   loadAll()
 *   remove(type)
 *   clearAll()
 *   getMeta()
 */

const PREFIX = 'journey-';

/**
 * Safe JSON stringify with fallback.
 */
function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return '{}';
  }
}

/**
 * Safe JSON parse with default fallback.
 */
function safeParse(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Build a full storage key from type.
 * e.g. type='entries' → 'journey-entries'
 */
function key(type) {
  return `${PREFIX}${type}`;
}

/**
 * Save data into localStorage.
 * @param {string} type - logical data type (entries, habits, highlights, reflections, etc.)
 * @param {any} data - serializable value
 */
function save(type, data) {
  try {
    const payload = {
      savedAt: new Date().toISOString(),
      data,
    };
    localStorage.setItem(key(type), safeStringify(payload));
    return true;
  } catch {
    return false;
  }
}

/**
 * Load one dataset by type.
 * Returns the parsed object or null if not found.
 */
function load(type) {
  const raw = localStorage.getItem(key(type));
  const parsed = safeParse(raw);
  return parsed ? parsed.data : null;
}

/**
 * Load all journey-* keys into a single object.
 * Returns { entries, habits, highlights, reflections, ... }
 */
function loadAll() {
  const result = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) {
      const type = k.replace(PREFIX, '');
      const raw = localStorage.getItem(k);
      const parsed = safeParse(raw);
      if (parsed && parsed.data !== undefined) {
        result[type] = parsed.data;
      }
    }
  }
  return result;
}

/**
 * Remove a single dataset by type.
 */
function remove(type) {
  try {
    localStorage.removeItem(key(type));
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all journey-* data (non-destructive notice).
 * Does not affect other localStorage keys.
 */
function clearAll() {
  const toRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) toRemove.push(k);
  }
  toRemove.forEach(k => localStorage.removeItem(k));
  return toRemove.length;
}

/**
 * Get lightweight metadata summary about stored data.
 */
function getMeta() {
  const meta = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) {
      const type = k.replace(PREFIX, '');
      const raw = localStorage.getItem(k);
      const parsed = safeParse(raw, {});
      meta.push({
        type,
        size: raw ? raw.length : 0,
        savedAt: parsed.savedAt || null,
      });
    }
  }
  return meta.sort((a, b) => a.type.localeCompare(b.type));
}

// ---- Export surface -------------------------------------------------------

export {
  save,
  load,
  loadAll,
  remove,
  clearAll,
  getMeta
};

export const _internals = {
  key,
  safeStringify,
  safeParse,
};
