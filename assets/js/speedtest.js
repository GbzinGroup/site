(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-testar');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      document.getElementById('download').textContent = '...';
      document.getElementById('upload').textContent = '...';
      document.getElementById('ping').textContent = '...';

      // Ping simples
      const t0 = performance.now();
      try {
        await fetch('/favicon.svg?cache=' + Date.now(), { cache: 'no-store' });
        document.getElementById('ping').textContent = (performance.now() - t0).toFixed(0);
      } catch {
        document.getElementById('ping').textContent = 'erro';
      }

      // Network Information API (se disponivel)
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn && conn.downlink) {
        document.getElementById('download').textContent = conn.downlink;
        document.getElementById('upload').textContent = '~' + (conn.downlink / 4).toFixed(1);
      } else {
        document.getElementById('download').textContent = 'N/D';
        document.getElementById('upload').textContent = 'N/D';
      }
    });
  });
})();
