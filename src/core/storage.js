/* ============================================================
 * CORE / STORAGE.JS - localStorage tipado com prefixo
 * ============================================================ */

import { CONFIG } from './config.js';

const PREFIX = CONFIG.STORAGE.prefix;

function key(k) { return `${PREFIX}${k}`; }

export const storage = {
  get(k, fallback = null) {
    try {
      const raw = localStorage.getItem(key(k));
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  set(k, value) {
    try {
      localStorage.setItem(key(k), JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[storage] Falha ao salvar:', e);
      return false;
    }
  },

  remove(k) {
    localStorage.removeItem(key(k));
  },

  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },

  has(k) {
    return localStorage.getItem(key(k)) !== null;
  }
};

export const session = {
  get(k, fallback = null) {
    try {
      const raw = sessionStorage.getItem(key(k));
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(k, value) {
    try { sessionStorage.setItem(key(k), JSON.stringify(value)); return true; }
    catch { return false; }
  },
  remove(k) { sessionStorage.removeItem(key(k)); }
};

export default storage;
