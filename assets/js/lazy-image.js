/* ============================================================
 * LAZY-IMAGE.JS - Intersection Observer para imagens
 * ============================================================ */

(function () {
  'use strict';

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const img = entry.target;

      if (img.dataset.src) img.src = img.dataset.src;
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;

      img.addEventListener('load', () => {
        img.classList.add('loaded');
        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');
      }, { once: true });

      observer.unobserve(img);
    });
  }, {
    rootMargin: '200px 0px',
    threshold: 0.01
  });

  const observar = () => {
    document.querySelectorAll('img[data-src]:not(.observed)').forEach(img => {
      img.classList.add('observed');
      observer.observe(img);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observar);
  } else {
    observar();
  }

  window.LazyImage = { observar };
})();
