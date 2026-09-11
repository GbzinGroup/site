/* ============================================================
 * MAINTENANCE.JS — Contador regressivo + barra de progresso
 * ============================================================ */

(function () {
  'use strict';

  /* ⚙️ CONFIGURE AQUI */
  const CONFIG = {
    // Data de início da manutenção
    startDate: new Date('2026-01-01T00:00:00'),
    // Data prevista de término
    endDate: new Date('2026-02-01T03:00:00'),
    // Auto-refresh ao terminar (segundos, 0 = desativado)
    autoReloadAtEnd: true
  };

  /* ============ CONTADOR REGRESSIVO ============ */
  const els = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    progressFill: document.getElementById('progress-fill'),
    progressValue: document.getElementById('progress-value'),
    year: document.getElementById('year')
  };

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function updateCountdown() {
    const now = new Date();
    const total = CONFIG.endDate - CONFIG.startDate;
    const elapsed = now - CONFIG.startDate;
    const remaining = CONFIG.endDate - now;

    // Terminou
    if (remaining <= 0) {
      if (els.days) els.days.textContent = '00';
      if (els.hours) els.hours.textContent = '00';
      if (els.minutes) els.minutes.textContent = '00';
      if (els.seconds) els.seconds.textContent = '00';
      if (els.progressFill) els.progressFill.style.width = '100%';
      if (els.progressValue) els.progressValue.textContent = '100%';

      if (CONFIG.autoReloadAtEnd) {
        clearInterval(timer);
        setTimeout(() => window.location.reload(), 3000);
      }
      return;
    }

    // Cálculo do tempo restante
    const d = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const h = Math.floor((remaining / (1000 * 60 * 60)) % 24);
    const m = Math.floor((remaining / (1000 * 60)) % 60);
    const s = Math.floor((remaining / 1000) % 60);

    if (els.days) els.days.textContent = pad(d);
    if (els.hours) els.hours.textContent = pad(h);
    if (els.minutes) els.minutes.textContent = pad(m);
    if (els.seconds) els.seconds.textContent = pad(s);

    // Barra de progresso
    const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    if (els.progressFill) els.progressFill.style.width = percent.toFixed(1) + '%';
    if (els.progressValue) els.progressValue.textContent = percent.toFixed(0) + '%';
  }

  const timer = setInterval(updateCountdown, 1000);
  updateCountdown();

  /* ============ ANO NO RODAPÉ ============ */
  if (els.year) {
    els.year.textContent = new Date().getFullYear();
  }

  /* ============ PARALLAX SUAVE ============ */
  const orbs = document.querySelectorAll('.maintenance-bg .orb');

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 0.5;
        orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    }, { passive: true });
  }

})();