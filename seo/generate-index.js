/* ============================================================
 * SEO / generate-index.js
 * Gera search-index.json com todas as URLs do site
 * Rode com: node seo/generate-index.js
 * ============================================================ */

import fs from 'node:fs/promises';
import path from 'node:path';

const PAGES = [
  { url: '/', titulo: 'Gbzin Group', descricao: 'Soluções digitais completas' },
  { url: '/pages/servicos/', titulo: 'Serviços', descricao: 'Todos os nossos serviços' },
  { url: '/pages/servicos/web/', titulo: 'Desenvolvimento Web', descricao: 'Sites profissionais' },
  { url: '/pages/servicos/apps/', titulo: 'Aplicativos', descricao: 'Apps mobile' },
  { url: '/pages/servicos/discord/', titulo: 'Serviços Discord', descricao: 'Bots e servidores' },
  { url: '/pages/servicos/hospedagem/', titulo: 'Hospedagem', descricao: 'Servidores rápidos' },
  { url: '/pages/planos/', titulo: 'Planos', descricao: 'Preços e pacotes' },
  { url: '/pages/store/', titulo: 'Loja', descricao: 'Produtos digitais' },
  { url: '/pages/conteudo/blog/', titulo: 'Blog', descricao: 'Artigos e novidades' },
  { url: '/pages/conteudo/faq/', titulo: 'FAQ', descricao: 'Perguntas frequentes' },
  { url: '/pages/suporte/contato/', titulo: 'Contato', descricao: 'Fale conosco' },
  { url: '/pages/institucional/sobre/', titulo: 'Sobre', descricao: 'Conheça a empresa' },
  { url: '/pages/institucional/portfolio/', titulo: 'Portfolio', descricao: 'Nossos trabalhos' },
  { url: '/pages/conteudo/glossario/', titulo: 'Glossário', descricao: 'Termos técnicos' },
  { url: '/pages/conteudo/guias/', titulo: 'Guias', descricao: 'Tutoriais completos' },
  { url: '/pages/conteudo/comparativos/', titulo: 'Comparativos', descricao: 'Comparações de serviços' },
  { url: '/pages/institucional/cases/', titulo: 'Cases', descricao: 'Casos de sucesso' }
];

const index = PAGES.map(p => ({
  url: `https://gbzin.com.br${p.url}`,
  titulo: p.titulo,
  descricao: p.descricao,
  tags: [p.titulo.toLowerCase(), p.descricao.toLowerCase()]
}));

await fs.writeFile(
  path.join(process.cwd(), 'search-index.json'),
  JSON.stringify(index, null, 2),
  'utf-8'
);

console.log(`✅ search-index.json gerado com ${index.length} entradas`);
