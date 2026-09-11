/* ============================================================
 * UI / THEME.JS - Dark/Light/Auto
 * ============================================================ */

import { CONFIG } from '../core/config.js';
import { storage } from '../core/storage.js';
import { emit, EVENTS } from '../core/events.js';
import { prefersDark } from '../utils/device.js';

const KEY = CONFIG.THEME.storageKey;

export function getTheme() {
  return storage.get(KEY, CONFIG.THEME.default);
}

export function setTheme(theme) {
  if (!CONFIG.THEME.available.includes(theme)) return;
  storage.set(KEY, theme);
  apply(theme);
  emit(EVENTS.THEME_CHANGED, { theme });
}

export function apply(theme) {
  const resolved = theme === 'auto' ? (prefersDark() ? 'dark' : 'light') : theme;
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.style.colorScheme = resolved;

  // Atualiza meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = resolved === 'dark' ? '#0a0a0f' : '#ffffff';
}

export function toggle() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function init() {
  apply(getTheme());

  // Reage a mudancas do sistema quando em modo auto
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener?.('change', () => {
    if (getTheme() === 'auto') apply('auto');
  });

  // Botao com data-theme-toggle
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    e.preventDefault();
    const next = toggle();
    btn.setAttribute('aria-label', next === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
  });
}

export default { init, getTheme, setTheme, toggle, apply };
