(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-newsletter');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      const msg = document.getElementById('msg-newsletter');

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = 'Email invalido';
        msg.style.color = 'red';
        return;
      }

      try {
        const r = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        if (r.ok) {
          msg.textContent = 'Inscrito com sucesso!';
          msg.style.color = 'green';
          form.reset();
        } else {
          throw new Error('Falha');
        }
      } catch {
        msg.textContent = 'Erro. Tente novamente.';
        msg.style.color = 'red';
      }
    });
  });
})();
