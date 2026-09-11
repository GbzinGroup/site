/* ============================================================
 * UTILS / SANITIZE.JS - Previne XSS
 * ============================================================ */

const MAP = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;', '/':'&#x2F;' };

export function escapeHTML(str = '') {
  return String(str).replace(/[&<>"'/]/g, c => MAP[c]);
}

export function stripTags(html = '') {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

export function safeURL(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url, location.origin);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) return '';
    return parsed.href;
  } catch {
    return '';
  }
}

export function safeJSON(str, fallback = null) {
  try { return JSON.parse(str); }
  catch { return fallback; }
}
