/* ============================================================
 * NavbarSystem - Gbzin Group
 * ============================================================ */

class NavbarSystem {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.navToggle = document.querySelector('.nav-toggle');
    this.navLinks = document.querySelector('.navbar-links');
    this.navOverlay = document.querySelector('.nav-overlay');
    this.dropdowns = document.querySelectorAll('.nav-dropdown');
    this.currentPage = window.location.pathname;
    this.isMobile = window.innerWidth <= 768;
    this.init();
  }

  init() {
    this.createOverlay();
    this.setupNavToggle();
    this.setupDropdowns();
    this.setupActiveState();
    this.setupScrollEffect();
    this.setupKeyboardNavigation();
    this.setupResizeHandler();
  }

  createOverlay() {
    if (!this.navOverlay) {
      this.navOverlay = document.createElement('div');
      this.navOverlay.className = 'nav-overlay';
      document.body.appendChild(this.navOverlay);
    }
    this.navOverlay.addEventListener('click', () => this.closeMenu());
  }

  setupNavToggle() {
    if (!this.navToggle) return;
    this.navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });
  }

  toggleMenu() {
    if (this.navLinks.classList.contains('open')) this.closeMenu();
    else this.openMenu();
  }

  openMenu() {
    this.navLinks.classList.add('open');
    this.navOverlay.classList.add('active');
    this.navToggle.innerHTML = '<i class="fas fa-times"></i>';
    document.body.style.overflow = 'hidden';
    const actions = this.navLinks.querySelector('.navbar-actions');
    if (actions) actions.classList.add('mobile-visible');
  }

  closeMenu() {
    this.navLinks.classList.remove('open');
    this.navOverlay.classList.remove('active');
    this.navToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.style.overflow = '';
    this.dropdowns.forEach((d) => d.classList.remove('open'));
  }

  setupDropdowns() {
    this.dropdowns.forEach((dropdown) => {
      const trigger = dropdown.closest('.nav-item')?.querySelector('.nav-link');
      if (!trigger || !this.isMobile) return;
      if (trigger.dataset.dropdownBound === 'true') return;
      trigger.dataset.dropdownBound = 'true';
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropdowns.forEach((d) => { if (d !== dropdown) d.classList.remove('open'); });
        dropdown.classList.toggle('open');
      });
    });
  }

  setupActiveState() {
    const links = document.querySelectorAll('.nav-link, .nav-dropdown a');
    const path = this.currentPage;
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const match = href === path || href === path.split('/').slice(-2).join('/') || path.includes(href.split('/').pop());
      if (match) {
        link.classList.add('active');
        const parentLink = link.closest('.nav-item')?.querySelector('.nav-link');
        if (parentLink) parentLink.classList.add('active');
      }
    });
  }

  setupScrollEffect() {
    if (!this.navbar) return;
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 50) this.navbar.classList.add('scrolled');
      else this.navbar.classList.remove('scrolled');
    }, { passive: true });
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeMenu(); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.navbar')) this.closeMenu(); });
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      if (wasMobile !== this.isMobile) {
        this.closeMenu();
        this.setupDropdowns();
      }
    });
  }
}

function createNavbar() {
  return `
<nav class="navbar" aria-label="Navegação principal">
  <div class="navbar-container">
    <a href="/index.html" class="navbar-logo">
      <div class="logo-text">
        <span class="logo-name">Gbzin Group</span>
        <span class="logo-tagline">Plataforma Digital</span>
      </div>
    </a>
    <button class="nav-toggle" aria-label="Abrir menu de navegação"><i class="fas fa-bars"></i></button>
    <div class="navbar-links">
      <div class="nav-item"><a href="/index.html" class="nav-link"><i class="fas fa-home"></i><span>Início</span></a></div>
      <div class="nav-item">
        <span class="nav-link"><i class="fas fa-cog"></i><span>Serviços</span><i class="fas fa-chevron-down"></i></span>
        <div class="nav-dropdown">
          <div class="dropdown-header"><h3>Nossos Serviços</h3></div>
          <a href="/pages/servicos/index.html"><i class="fas fa-th-large"></i><span>Todos os Serviços</span></a>
          <a href="/pages/servicos/web/index.html"><i class="fas fa-code"></i><span>Desenvolvimento Web</span></a>
          <a href="/pages/servicos/apps/index.html"><i class="fas fa-mobile-alt"></i><span>Aplicativos</span></a>
          <a href="/pages/servicos/discord/index.html"><i class="fab fa-discord"></i><span>Serviços Discord</span></a>
          <a href="/pages/servicos/hospedagem/index.html"><i class="fas fa-server"></i><span>Hospedagem</span></a>
        </div>
      </div>
      <div class="nav-item"><a href="/pages/planos/index.html" class="nav-link"><i class="fas fa-tags"></i><span>Planos</span></a></div>
      <div class="nav-item">
        <span class="nav-link"><i class="fas fa-rocket"></i><span>Plataforma</span><i class="fas fa-chevron-down"></i></span>
        <div class="nav-dropdown">
          <div class="dropdown-header"><h3>Ferramentas</h3></div>
          <a href="/pages/ferramentas/app/index.html"><i class="fas fa-code"></i><span>Code Editor</span><span class="dropdown-badge">Novo</span></a>
          <a href="/pages/ferramentas/file-manager/index.html"><i class="fas fa-folder"></i><span>File Manager</span></a>
          <a href="/pages/conteudo/wiki/index.html"><i class="fas fa-book"></i><span>Wiki</span></a>
          <a href="/pages/ferramentas/toshirobot/index.html"><i class="fas fa-robot"></i><span>ToshiroBot</span></a>
          <a href="/pages/suporte/speedtest/index.html"><i class="fas fa-tachometer-alt"></i><span>Speed Test</span></a>
          <a href="/pages/suporte/docs/index.html"><i class="fas fa-file-code"></i><span>Documentação</span></a>
        </div>
      </div>
      <div class="nav-item"><a href="/pages/store/index.html" class="nav-link"><i class="fas fa-shopping-cart"></i><span>Loja</span></a></div>
      <div class="nav-item">
        <span class="nav-link"><i class="fas fa-newspaper"></i><span>Conteúdo</span><i class="fas fa-chevron-down"></i></span>
        <div class="nav-dropdown">
          <div class="dropdown-header"><h3>Conteúdo</h3></div>
          <a href="/pages/conteudo/blog/index.html"><i class="fas fa-blog"></i><span>Blog</span></a>
          <a href="/pages/institucional/portfolio/index.html"><i class="fas fa-briefcase"></i><span>Portfólio</span></a>
          <a href="/pages/conteudo/changelog/index.html"><i class="fas fa-list"></i><span>Changelog</span></a>
          <a href="/pages/conteudo/newsletter/index.html"><i class="fas fa-envelope-open-text"></i><span>Newsletter</span></a>
        </div>
      </div>
      <div class="nav-item">
        <span class="nav-link"><i class="fas fa-building"></i><span>Empresa</span><i class="fas fa-chevron-down"></i></span>
        <div class="nav-dropdown">
          <div class="dropdown-header"><h3>Empresa</h3></div>
          <a href="/pages/institucional/sobre/index.html"><i class="fas fa-info-circle"></i><span>Sobre</span></a>
          <a href="/pages/institucional/equipe/index.html"><i class="fas fa-users"></i><span>Equipe</span></a>
          <a href="/pages/institucional/carreiras/index.html"><i class="fas fa-user-tie"></i><span>Carreiras</span></a>
          <a href="/pages/institucional/parceiros/index.html"><i class="fas fa-handshake"></i><span>Parceiros</span></a>
          <a href="/pages/institucional/afiliados/index.html"><i class="fas fa-share-alt"></i><span>Afiliados</span></a>
          <a href="/pages/institucional/imprensa/index.html"><i class="fas fa-bullhorn"></i><span>Imprensa</span></a>
        </div>
      </div>
      <div class="nav-item">
        <span class="nav-link"><i class="fas fa-life-ring"></i><span>Suporte</span><i class="fas fa-chevron-down"></i></span>
        <div class="nav-dropdown">
          <div class="dropdown-header"><h3>Suporte</h3></div>
          <a href="/pages/suporte/index.html"><i class="fas fa-headset"></i><span>Central de Ajuda</span></a>
          <a href="/pages/conteudo/faq/index.html"><i class="fas fa-question-circle"></i><span>FAQ</span></a>
          <a href="/pages/suporte/status/index.html"><i class="fas fa-signal"></i><span>Status dos Serviços</span></a>
          <a href="/pages/suporte/tickets/cliente/index.html"><i class="fas fa-ticket-alt"></i><span>Meus Tickets</span></a>
          <a href="/pages/suporte/contato/index.html"><i class="fas fa-envelope"></i><span>Contato</span></a>
        </div>
      </div>
      <div class="nav-item">
        <span class="nav-link"><i class="fas fa-balance-scale"></i><span>Legal</span><i class="fas fa-chevron-down"></i></span>
        <div class="nav-dropdown">
          <div class="dropdown-header"><h3>Legal</h3></div>
          <a href="/pages/termos/index.html"><i class="fas fa-file-contract"></i><span>Termos de Uso</span></a>
          <a href="/pages/privacidade/index.html"><i class="fas fa-user-shield"></i><span>Privacidade</span></a>
          <a href="/pages/cookies/index.html"><i class="fas fa-cookie-bite"></i><span>Cookies</span></a>
          <a href="/pages/lgpd/index.html"><i class="fas fa-shield-alt"></i><span>LGPD</span></a>
          <a href="/pages/reembolso/index.html"><i class="fas fa-undo"></i><span>Reembolso</span></a>
        </div>
      </div>
      <div class="nav-item">
        <span class="nav-link"><i class="fas fa-users"></i><span>Comunidade</span><i class="fas fa-chevron-down"></i></span>
        <div class="nav-dropdown">
          <div class="dropdown-header"><h3>Comunidade</h3></div>
          <a href="/pages/ferramentas/discord/index.html"><i class="fab fa-discord"></i><span>Discord</span></a>
          <a href="/pages/suporte/contato/index.html"><i class="fas fa-envelope"></i><span>Contato</span></a>
        </div>
      </div>
      <div class="nav-item">
        <span class="nav-link"><i class="fas fa-shield-alt"></i><span>Admin</span><i class="fas fa-chevron-down"></i></span>
        <div class="nav-dropdown">
          <div class="dropdown-header"><h3>Administração</h3></div>
          <a href="/dashboard.html"><i class="fas fa-chart-line"></i><span>Dashboard</span></a>
          <a href="/admin.html"><i class="fas fa-cog"></i><span>Painel Admin</span></a>
          <a href="/pages/suporte/tickets/atendente/index.html"><i class="fas fa-user-headset"></i><span>Atendimento</span></a>
        </div>
      </div>
      <div class="navbar-actions">
        <a href="/pages/suporte/contato/index.html" class="nav-btn nav-btn-secondary"><i class="fas fa-envelope"></i><span>Contato</span></a>
        <a href="/pages/ferramentas/discord/index.html" class="nav-btn nav-btn-primary"><i class="fab fa-discord"></i><span>Discord</span></a>
      </div>
    </div>
    <div class="navbar-actions">
      <a href="/pages/suporte/contato/index.html" class="nav-btn nav-btn-secondary"><i class="fas fa-envelope"></i><span>Contato</span></a>
      <a href="/pages/ferramentas/discord/index.html" class="nav-btn nav-btn-primary"><i class="fab fa-discord"></i><span>Discord</span></a>
    </div>
  </div>
</nav>`;
}

document.addEventListener('DOMContentLoaded', () => { new NavbarSystem(); });
