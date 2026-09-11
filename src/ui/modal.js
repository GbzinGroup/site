/* ============================================================
 * UI / MODAL.JS - Modais acessiveis
 * ============================================================ */

import { create } from '../core/dom.js';
import { emit, EVENTS } from '../core/events.js';

let currentModal = null;
let previousFocus = null;

export function open({ title, content, footer, size = 'md', onClose } = {}) {
  close();

  previousFocus = document.activeElement;

  const overlay = create('div', { class: 'modal-overlay', role: 'dialog', 'aria-modal': 'true' });

  const dialog = create('div', { class: `modal modal-${size}`, role: 'document' },
    create('header', { class: 'modal-header' },
      create('h2', { class: 'modal-title' }, title || ''),
      create('button', { class: 'modal-close', 'aria-label': 'Fechar', onclick: () => close() },
        create('i', { class: 'fas fa-times' }))
    ),
    create('div', { class: 'modal-body' }, content),
    footer ? create('footer', { class: 'modal-footer' }, footer) : null
  );

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => overlay.classList.add('modal-open'));

  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const onClick = (e) => { if (e.target === overlay) close(); };
  document.addEventListener('keydown', onKey);
  overlay.addEventListener('click', onClick);

  const close = () => {
    if (!currentModal) return;
    overlay.classList.remove('modal-open');
    document.removeEventListener('keydown', onKey);
    overlay.removeEventListener('click', onClick);
    document.body.style.overflow = '';

    setTimeout(() => {
      overlay.remove();
      currentModal = null;
      previousFocus?.focus?.();
      emit(EVENTS.MODAL_CLOSE);
      onClose?.();
    }, 200);
  };

  currentModal = { close, overlay };

  setTimeout(() => {
    const focusable = dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.focus();
  }, 100);

  emit(EVENTS.MODAL_OPEN);
  return { close };
}

export function close() {
  currentModal?.close();
}

export function confirm(message, { title = 'Confirmar', okLabel = 'Sim', cancelLabel = 'Nao' } = {}) {
  return new Promise((resolve) => {
    const footer = create('div', { class: 'modal-actions' });
    let resolved = false;

    const finish = (val) => {
      if (resolved) return;
      resolved = true;
      resolve(val);
      close();
    };

    footer.append(
      create('button', { class: 'btn btn-secondary', onclick: () => finish(false) }, cancelLabel),
      create('button', { class: 'btn btn-primary', onclick: () => finish(true) }, okLabel)
    );

    open({
      title,
      content: create('p', {}, message),
      footer,
      size: 'sm',
      onClose: () => finish(false)
    });
  });
}
