/* ============================================================
 * UTILS / MARKDOWN.JS - Parser minimalista
 * ============================================================ */

import { escapeHTML } from './sanitize.js';

export function markdown(texto = '') {
  let html = escapeHTML(texto);

  // Blocos de codigo
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Titulos
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold, italico, inline code
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Listas
  html = html.replace(/(?:^\s*[-*] .+$\n?)+/gim, (match) => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\s*[-*] /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  html = html.replace(/(?:^\s*\d+\. .+$\n?)+/gim, (match) => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\s*\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // Paragrafos
  html = html.split(/\n{2,}/).map(p => {
    if (/^<(h[1-6]|ul|ol|pre|blockquote)/.test(p.trim())) return p;
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return html;
}
