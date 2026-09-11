/* ============================================================
 * UI / BACK-TO-TOP.JS
 * ============================================================ */

import { create } from '../core/dom.js';
import { rafThrottle } from '../utils/debounce.js';

export function init({ threshold = 400, label = 'Voltar ao topo' } = {}) {
  const btn = create('button', {
    class: 'back-to-top',
    'aria-label': label,
    title: label,
    onclick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
  }, create('i', { class: 'fas fa-arrow-up' }));

  document.body.appendChild(btn);

  const onScroll = rafThrottle(() => {
    btn.classList.toggle('visible', window.pageYOffset > threshold);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return () => {
    window.removeEventListener('scroll', onScroll);
    btn.remove();
  };
}

export default { init };
