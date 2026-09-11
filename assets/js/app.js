// App Page JavaScript - Enhanced
class AppPage {
    constructor() {
        this.newsletterSubscribers = Utils.getItem('newsletter_subscribers', []);
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkExistingSubscription();
    }
    
    setupEventListeners() {
        // Newsletter form
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
        }
        
        // FAQ toggles
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => this.toggleFaq(question));
        });
    }
    
    handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('newsletterEmail');
        const email = emailInput.value.trim();
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showToast('Por favor, insira um email válido!', 'error');
            return;
        }
        
        // Check if already subscribed
        if (this.newsletterSubscribers.includes(email)) {
            this.showToast('Este email já está cadastrado!', 'warning');
            return;
        }
        
        // Add subscriber
        this.newsletterSubscribers.push(email);
        Utils.setItem('newsletter_subscribers', this.newsletterSubscribers);
        
        // Show success
        this.showToast('Cadastro realizado com sucesso!', 'success');
        
        // Reset form
        e.target.reset();
        
        // Update button
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Cadastrado!';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }, 3000);
        
        // Update stats
        this.updateNewsletterStats();
    }
    
    toggleFaq(question) {
        const faqItem = question.closest('.faq-item');
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQs
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
            item.querySelector('.faq-question').classList.remove('active');
        });
        
        // Open clicked FAQ if it was closed
        if (!isActive) {
            faqItem.classList.add('active');
            question.classList.add('active');
        }
    }
    
    checkExistingSubscription() {
        const emailInput = document.getElementById('newsletterEmail');
        if (emailInput && this.newsletterSubscribers.length > 0) {
            emailInput.placeholder = `Você já está inscrito! (${this.newsletterSubscribers.length} inscritos)`;
        }
    }
    
    updateNewsletterStats() {
        const statsElement = document.querySelector('.newsletter-stats span:first-child');
        if (statsElement) {
            statsElement.innerHTML = `<i class="fas fa-users"></i> ${this.newsletterSubscribers.length}+ inscritos`;
        }
    }
    
    showToast(message, type = 'success') {
        // Create container if it doesn't exist
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Utils
const Utils = {
    setItem(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    
    getItem(key, defaultValue = null) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new AppPage();
    
    // Add toast styles if not present
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 3000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .toast {
                background: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: var(--radius-sm);
                padding: 1rem 1.5rem;
                box-shadow: var(--shadow-lg);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
                min-width: 250px;
            }
            
            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .toast i {
                font-size: 1.2rem;
            }
            
            .toast-success i { color: var(--success); }
            .toast-error i { color: var(--danger); }
            .toast-warning i { color: var(--warning); }
            .toast-info i { color: var(--info); }
            
            .toast span {
                color: var(--text-primary);
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }
});