/* ============================================================
 * UI / TOAST.JS - Notificacoes
 * ============================================================ */

import { create } from '../core/dom.js';
import { emit, EVENTS } from '../core/events.js';

const ICONS = {
  success: 'fa-check-circle',
  error: 'fa-times-circle',
  warning: 'fa-exclamation-triangle',
  info: 'fa-info-circle'
};

let container;

function ensureContainer() {
  if (container) return container;
  container = create('div', { class: 'toast-container', role: 'region', 'aria-label': 'Notificacoes' });
  document.body.appendChild(container);
  return container;
}

export function toast(message, { type = 'info', duration = 4000, action } = {}) {
  ensureContainer();

  const el = create('div', { class: `toast toast-${type}`, role: 'status' },
    create('i', { class: `fas ${ICONS[type] || ICONS.info}` }),
    create('div', { class: 'toast-body' },
      create('p', {}, message),
      action ? create('button', {
        class: 'toast-action',
        onclick: () => { action.onClick?.(); close(); }
      }, action.label) : null
    ),
    create('button', {
      class: 'toast-close',
      'aria-label': 'Fechar',
      onclick: () => close()
    }, create('i', { class: 'fas fa-times' }))
  );

  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('toast-visible'));

  const close = () => {
    el.classList.remove('toast-visible');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  };

  if (duration > 0) setTimeout(close, duration);

  emit(EVENTS.TOAST_SHOW, { message, type });
  return { close };
}

export const success = (m, o) => toast(m, { ...o, type: 'success' });
export const error = (m, o) => toast(m, { ...o, type: 'error' });
export const warning = (m, o) => toast(m, { ...o, type: 'warning' });
export const info = (m, o) => toast(m, { ...o, type: 'info' });

export default { toast, success, error, warning, info };
