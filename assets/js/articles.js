import { database, state } from './config.js';
import { showToast } from './auth.js';

export function renderArticlesPage() {
  document.getElementById('adminContent').innerHTML = `
    <div class="admin-table-wrapper">
      <div class="admin-table-header">
        <h2 class="admin-table-title">Todos os Artigos</h2>
        <button class="admin-btn admin-btn-primary" onclick="showArticleModal()">
          + Novo Artigo
        </button>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Categoria</th>
            <th>Autor</th>
            <th>Status</th>
            <th>Atualizado</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${state.articles.map(article => `
            <tr>
              <td>${article.titulo}</td>
              <td>${article.categoria || 'N/A'}</td>
              <td>${article.autor || 'N/A'}</td>
              <td><span class="badge ${article.status === 'publicado' ? 'badge-success' : 'badge-warning'}">${article.status || 'N/A'}</span></td>
              <td>${formatDate(article.atualizadoEm)}</td>
              <td>
                <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="editArticle('${article.id}')">Editar</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="deleteArticle('${article.id}')">Excluir</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

export function showArticleModal(articleId = null) {
  const article = articleId ? state.articles.find(a => a.id === articleId) : null;
  
  document.getElementById('modalTitle').textContent = article ? 'Editar Artigo' : 'Novo Artigo';
  document.getElementById('modalBody').innerHTML = `
    <div class="admin-form-group">
      <label class="admin-form-label">Título</label>
      <input type="text" class="admin-form-input" id="articleTitle" value="${article?.titulo || ''}">
    </div>
    
    <div class="admin-form-row">
      <div class="admin-form-group">
        <label class="admin-form-label">Categoria</label>
        <select class="admin-form-select" id="articleCategory">
          <option value="">Selecione...</option>
          ${state.categories.map(cat => `
            <option value="${cat.id}" ${article?.categoria === cat.id ? 'selected' : ''}>${cat.nome}</option>
          `).join('')}
        </select>
      </div>
      
      <div class="admin-form-group">
        <label class="admin-form-label">Status</label>
        <select class="admin-form-select" id="articleStatus">
          <option value="rascunho" ${article?.status === 'rascunho' ? 'selected' : ''}>Rascunho</option>
          <option value="publicado" ${article?.status === 'publicado' ? 'selected' : ''}>Publicado</option>
        </select>
      </div>
    </div>
    
    <div class="admin-form-group">
      <label class="admin-form-label">Descrição</label>
      <textarea class="admin-form-textarea" id="articleDescription">${article?.descricao || ''}</textarea>
    </div>
    
    <div class="admin-form-group">
      <label class="admin-form-label">Tags (separadas por vírgula)</label>
      <input type="text" class="admin-form-input" id="articleTags" value="${article?.tags?.join(', ') || ''}">
    </div>
    
    <div class="admin-form-group">
      <label class="admin-form-label">Conteúdo (Markdown)</label>
      <textarea class="admin-form-textarea" id="articleContent" style="min-height: 200px;">${article?.conteudo?.texto || ''}</textarea>
    </div>
  `;
  
  document.getElementById('modalFooter').innerHTML = `
    <button class="admin-btn admin-btn-secondary" onclick="closeModal()">Cancelar</button>
    <button class="admin-btn admin-btn-primary" onclick="saveArticle('${articleId || ''}')">Salvar</button>
  `;
  
  document.getElementById('adminModal').classList.add('show');
}

export async function saveArticle(articleId) {
  const titulo = document.getElementById('articleTitle').value;
  const categoria = document.getElementById('articleCategory').value;
  const status = document.getElementById('articleStatus').value;
  const descricao = document.getElementById('articleDescription').value;
  const tags = document.getElementById('articleTags').value.split(',').map(t => t.trim()).filter(Boolean);
  const conteudo = document.getElementById('articleContent').value;
  
  if (!titulo) {
    showToast('Título é obrigatório', 'error');
    return;
  }
  
  const articleData = {
    titulo,
    categoria,
    status,
    descricao,
    tags,
    autor: state.currentUser?.email || 'admin',
    atualizadoEm: new Date().toISOString(),
    conteudo: {
      tipo: 'markdown',
      texto: conteudo
    }
  };
  
  try {
    if (articleId) {
      await database.ref(`wiki/artigos/${articleId}`).update(articleData);
      showToast('Artigo atualizado com sucesso', 'success');
    } else {
      await database.ref('wiki/artigos').push(articleData);
      showToast('Artigo criado com sucesso', 'success');
    }
    
    closeModal();
    loadAllData();
  } catch (error) {
    console.error('Erro ao salvar artigo:', error);
    showToast('Erro ao salvar artigo', 'error');
  }
}

export async function deleteArticle(articleId) {
  if (!confirm('Tem certeza que deseja excluir este artigo?')) return;
  
  try {
    await database.ref(`wiki/artigos/${articleId}`).remove();
    showToast('Artigo excluído com sucesso', 'success');
    loadAllData();
  } catch (error) {
    console.error('Erro ao excluir artigo:', error);
    showToast('Erro ao excluir artigo', 'error');
  }
}

function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR');
}