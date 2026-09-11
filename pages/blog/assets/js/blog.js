/* ============================================================
 * BLOG.JS - Lista pública de posts
 * ============================================================ */

const API = '/api'; // troque para 'http://localhost:3001/api' em dev
const state = { posts: [], filtro: 'all', busca: '' };

const els = {
  grid: document.getElementById('posts-grid'),
  busca: document.getElementById('busca'),
  filtros: document.getElementById('filtros'),
  paginacao: document.getElementById('paginacao')
};

function escapar(str = '') {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatarData(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderizar(posts) {
  if (!posts.length) {
    els.grid.innerHTML = '<div class="empty"><i class="fas fa-inbox"></i><p>Nenhum post encontrado.</p></div>';
    return;
  }

  els.grid.innerHTML = posts.map(p => `
    <article class="post-card${p.destaque ? ' destaque' : ''}">
      ${p.destaque ? '<span class="badge badge-accent">Destaque</span>' : ''}
      <span class="post-categoria">${escapar(p.categoria)}</span>
      <h2><a href="post.html?id=${encodeURIComponent(p.slug)}">${escapar(p.titulo)}</a></h2>
      <p>${escapar(p.resumo)}</p>
      <footer class="post-meta">
        <span><i class="fas fa-user"></i> ${escapar(p.autor)}</span>
        <span><i class="fas fa-calendar"></i> ${formatarData(p.data)}</span>
      </footer>
      <a href="post.html?id=${encodeURIComponent(p.slug)}" class="btn-card">
        Ler mais <i class="fas fa-arrow-right"></i>
      </a>
    </article>
  `).join('');
}

async function carregar() {
  els.grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Carregando posts...</p></div>';

  const params = new URLSearchParams();
  if (state.filtro !== 'all') params.set('categoria', state.filtro);
  if (state.busca) params.set('busca', state.busca);

  try {
    const r = await fetch(`${API}/posts?${params}`);
    const data = await r.json();
    state.posts = data.posts || [];
    renderizar(state.posts);
  } catch (e) {
    els.grid.innerHTML = '<div class="empty"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar posts.</p></div>';
    console.error(e);
  }
}

// Filtros
els.filtros?.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  els.filtros.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.filtro = btn.dataset.cat;
  carregar();
});

// Busca (com debounce)
let timerBusca;
els.busca?.addEventListener('input', (e) => {
  clearTimeout(timerBusca);
  timerBusca = setTimeout(() => {
    state.busca = e.target.value.trim();
    carregar();
  }, 300);
});

// Inicializa
carregar();
