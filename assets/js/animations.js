export function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
  });
}

const style = document.createElement('style');
style.textContent = `
  [data-animate] {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease;
  }
  
  [data-animate].visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .toast {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 16px 24px;
    box-shadow: var(--shadow-lg);
    animation: slideIn 0.3s ease;
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

document.head.appendChild(style);