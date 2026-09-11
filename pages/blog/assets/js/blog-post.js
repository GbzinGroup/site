/* ============================================================
 * BLOG-POST.JS - Renderiza post individual
 * ============================================================ */

const API = '/api';

function escapar(str = '') {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Markdown básico (títulos, negrito, itálico, listas, código, links)
function markdown(texto = '') {
  let html = escapar(texto);
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  html = html.replace(/^\s*[-*] (.+)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  html = html.replace(/^\s*\d+\. (.+)$/gim, '<li>$1</li>');
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/\n\n/g, '</p><p>');
  return `<p>${html}</p>`;
}

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

async function carregarPost() {
  const container = document.getElementById('post-container');
  const params = new URLSearchParams(location.search);
  const slug = params.get('id');

  if (!slug) {
    container.innerHTML = '<div class="empty"><p>Post não especificado.</p></div>';
    return;
  }

  try {
    const r = await fetch(`${API}/posts/${encodeURIComponent(slug)}`);
    if (!r.ok) throw new Error('Não encontrado');
    const p = await r.json();

    document.title = `${p.titulo} | Gbzin Group`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', p.resumo);

    container.innerHTML = `
      <header class="post-header">
        <span class="post-categoria">${escapar(p.categoria)}</span>
        <h1>${escapar(p.titulo)}</h1>
        <div class="post-meta-full">
          <span><i class="fas fa-user"></i> ${escapar(p.autor)}</span>
          <span><i class="fas fa-calendar"></i> ${formatarData(p.data)}</span>
          ${p.tags?.length ? `<span><i class="fas fa-tags"></i> ${p.tags.map(escapar).join(', ')}</span>` : ''}
        </div>
      </header>
      <div class="post-content">${markdown(p.conteudo)}</div>
      <footer class="post-footer">
        <a href="index.html" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Voltar</a>
      </footer>
    `;
  } catch (e) {
    container.innerHTML = '<div class="empty"><i class="fas fa-exclamation-triangle"></i><p>Post não encontrado.</p></div>';
  }
}

carregarPost();
