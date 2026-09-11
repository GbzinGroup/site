/* ============================================================
 * BLOG-ADMIN.JS - Painel administrativo
 * ============================================================ */

const API = '/api';
const TOKEN_KEY = 'gbzin_blog_token';

const state = {
  token: localStorage.getItem(TOKEN_KEY) || '',
  posts: [],
  editando: null
};

const $ = (id) => document.getElementById(id);

// ============ API HELPER ============
async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const r = await fetch(`${API}${path}`, { ...opts, headers });
  if (r.status === 401) { logout(); throw new Error('Sessão expirada'); }
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).erro || 'Erro');
  return r.json();
}

// ============ LOGIN ============
$('form-login')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = $('login-msg');
  msg.textContent = 'Entrando...';
  msg.style.color = 'var(--text-muted)';

  try {
    const { token } = await api('/login', {
      method: 'POST',
      body: JSON.stringify({ usuario: $('usuario').value, senha: $('senha').value })
    });
    state.token = token;
    localStorage.setItem(TOKEN_KEY, token);
    abrirPainel();
  } catch (err) {
    msg.textContent = err.message;
    msg.style.color = 'var(--danger)';
  }
});

function logout() {
  state.token = '';
  localStorage.removeItem(TOKEN_KEY);
  $('login-box').hidden = false;
  $('admin-box').hidden = true;
}

$('btn-logout')?.addEventListener('click', logout);

// ============ PAINEL ============
function abrirPainel() {
  $('login-box').hidden = true;
  $('admin-box').hidden = false;
  carregarPosts();
}

// ============ LISTAR ============
async function carregarPosts() {
  const lista = $('lista-posts');
  lista.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Carregando...</p>';
  try {
    const { posts } = await api('/admin/posts');
    state.posts = posts;
    renderizarLista();
  } catch (e) {
    lista.innerHTML = `<p style="color:var(--danger)">${e.message}</p>`;
  }
}

function renderizarLista() {
  const lista = $('lista-posts');
  if (!state.posts.length) {
    lista.innerHTML = '<p>Nenhum post ainda. Clique em "Novo Post".</p>';
    return;
  }
  lista.innerHTML = state.posts.map(p => `
    <div class="admin-item" data-id="${p.id}">
      <div class="admin-item-info">
        <strong>${escapar(p.titulo)}</strong>
        <span class="post-categoria">${escapar(p.categoria)}</span>
        ${p.destaque ? '<span class="badge badge-accent">Destaque</span>' : ''}
        <small>${new Date(p.data).toLocaleDateString('pt-BR')} • /${escapar(p.slug)}</small>
      </div>
      <div class="admin-item-actions">
        <button class="btn-icon" data-acao="editar" data-id="${p.id}" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon danger" data-acao="excluir" data-id="${p.id}" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function escapar(str = '') {
  return String(str).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

// ============ FORMULÁRIO ============
function abrirForm(post = null) {
  state.editando = post;
  $('form-post').hidden = false;
  $('post-id').value = post?.id || '';
  $('post-titulo').value = post?.titulo || '';
  $('post-slug').value = post?.slug || '';
  $('post-resumo').value = post?.resumo || '';
  $('post-conteudo').value = post?.conteudo || '';
  $('post-categoria').value = post?.categoria || 'noticia';
  $('post-autor').value = post?.autor || 'Gbzin Group';
  $('post-tags').value = (post?.tags || []).join(', ');
  $('post-destaque').checked = !!post?.destaque;
  $('form-msg').textContent = '';
  $('post-titulo').focus();
}

function fecharForm() {
  $('form-post').hidden = true;
  state.editando = null;
}

$('btn-novo')?.addEventListener('click', () => abrirForm());
$('btn-cancelar')?.addEventListener('click', fecharForm);
$('btn-recarregar')?.addEventListener('click', carregarPosts);

// Auto-gerar slug a partir do título
$('post-titulo')?.addEventListener('input', (e) => {
  if (state.editando) return;
  const slug = e.target.value
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-');
  $('post-slug').value = slug;
});

// ============ SALVAR ============
$('form-post')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = $('form-msg');
  msg.textContent = 'Salvando...';
  msg.style.color = 'var(--text-muted)';

  const dados = {
    titulo: $('post-titulo').value.trim(),
    slug: $('post-slug').value.trim(),
    resumo: $('post-resumo').value.trim(),
    conteudo: $('post-conteudo').value,
    categoria: $('post-categoria').value,
    autor: $('post-autor').value.trim(),
    tags: $('post-tags').value.split(',').map(t => t.trim()).filter(Boolean),
    destaque: $('post-destaque').checked
  };

  try {
    if (state.editando) {
      await api(`/admin/posts/${state.editando.id}`, {
        method: 'PUT',
        body: JSON.stringify(dados)
      });
    } else {
      await api('/admin/posts', {
        method: 'POST',
        body: JSON.stringify(dados)
      });
    }
    msg.textContent = 'Salvo com sucesso!';
    msg.style.color = 'var(--success)';
    setTimeout(() => { fecharForm(); carregarPosts(); }, 800);
  } catch (err) {
    msg.textContent = err.message;
    msg.style.color = 'var(--danger)';
  }
});

// ============ AÇÕES ============
$('lista-posts')?.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-acao]');
  if (!btn) return;
  const { acao, id } = btn.dataset;

  if (acao === 'editar') {
    const post = state.posts.find(p => p.id === id);
    if (post) abrirForm(post);
  }

  if (acao === 'excluir') {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      await api(`/admin/posts/${id}`, { method: 'DELETE' });
      carregarPosts();
    } catch (err) {
      alert(err.message);
    }
  }
});

// ============ BOOT ============
if (state.token) {
  abrirPainel();
} else {
  $('login-box').hidden = false;
}
