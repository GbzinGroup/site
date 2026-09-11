(function() {
  'use strict';

  const servicos = ['hospedagem', 'discord', 'site', 'api'];
  const endpoints = {
    hospedagem: '/api/status/hospedagem',
    discord: '/api/status/discord',
    site: '/api/status/site',
    api: '/api/status/api'
  };

  function atualizar(servico, online) {
    const el = document.querySelector(`[data-servico="${servico}"] .indicador`);
    if (!el) return;
    el.textContent = online ? 'Operacional' : 'Instavel';
    el.className = 'indicador ' + (online ? 'ok' : 'erro');
  }

  async function verificar(servico) {
    try {
      const r = await fetch(endpoints[servico], { method: 'HEAD' });
      atualizar(servico, r.ok);
    } catch {
      atualizar(servico, false);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    servicos.forEach(verificar);
    setInterval(() => servicos.forEach(verificar), 60000);
  });
})();
