(function(global) {
    'use strict';
    
    const defaults = {
        title: 'OFERTA EXCLUSIVA',
        subtitle: 'Ganhe 20% de desconto na sua primeira compra!',
        message: 'Use o cupom abaixo e aproveite essa oferta especial.',
        ctaText: 'QUERO APROVEITAR',
        badgeText: 'OFERTA LIMITADA',
        termsText: 'Valido apenas para primeira compra. Nao cumulativo com outras promocoes.',
        couponCode: 'ROXO20',
        ctaLink: '/checkout',
        autoOpen: true,
        delay: 1500,
        closeOnEscape: true,
        closeOnOverlayClick: true,
        onOpen: null,
        onClose: null,
        onUseCoupon: null,
        onCopyCoupon: null,
    };
    
    let config = { ...defaults };
    let isOpen = false;
    let elements = {};
    let autoOpenTimer = null;
    
    function createHTML() {
        return `
            <div class="coupon-popup-overlay" id="cpOverlay">
                <div class="coupon-popup">
                    <div class="cp-header">
                        <button class="cp-close" id="cpClose" aria-label="Fechar">
                            <svg viewBox="0 0 16 16" fill="none">
                                <path d="M12 4L4 12M4 4L12 12" stroke="white" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                        
                        <div class="cp-badge">
                            <span class="cp-badge-text">${config.badgeText}</span>
                        </div>
                        
                        <div class="cp-icon">
                            <svg viewBox="0 0 32 32" fill="none">
                                <path d="M16 4L20 12L28 12L22 18L24 26L16 21L8 26L10 18L4 12L12 12L16 4Z" fill="white" opacity="0.9"/>
                                <circle cx="16" cy="16" r="14" stroke="white" stroke-width="1.5" opacity="0.3"/>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="cp-content">
                        <h2 class="cp-title">${config.title}</h2>
                        <p class="cp-subtitle">${config.subtitle}</p>
                        
                        <div class="cp-code-container">
                            <span class="cp-code-label">Seu cupom exclusivo</span>
                            <div class="cp-code-wrapper">
                                <span class="cp-code">${config.couponCode}</span>
                                <button class="cp-copy-btn" id="cpCopyBtn">
                                    <span id="cpCopyText">Copiar</span>
                                </button>
                            </div>
                        </div>
                        
                        <p class="cp-message">${config.message}</p>
                        
                        <a href="${config.ctaLink}" class="cp-cta-btn" id="cpCtaBtn">
                            ${config.ctaText}
                        </a>
                        
                        <p class="cp-terms">${config.termsText}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    function inject() {
        const existing = document.getElementById('cpOverlay');
        if (existing) existing.remove();
        
        const div = document.createElement('div');
        div.innerHTML = createHTML();
        document.body.appendChild(div.firstElementChild);
        
        elements = {
            overlay: document.getElementById('cpOverlay'),
            closeBtn: document.getElementById('cpClose'),
            copyBtn: document.getElementById('cpCopyBtn'),
            copyText: document.getElementById('cpCopyText'),
            ctaBtn: document.getElementById('cpCtaBtn'),
        };
        
        attachEvents();
    }
    
    function attachEvents() {
        if (elements.closeBtn) {
            elements.closeBtn.addEventListener('click', close);
        }
        
        if (elements.overlay && config.closeOnOverlayClick) {
            elements.overlay.addEventListener('click', function(e) {
                if (e.target === elements.overlay) {
                    close();
                }
            });
        }
        
        if (elements.copyBtn) {
            elements.copyBtn.addEventListener('click', copyCoupon);
        }
        
        if (elements.ctaBtn) {
            elements.ctaBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (config.onUseCoupon) {
                    config.onUseCoupon(config.couponCode);
                }
                
                close();
                
                setTimeout(function() {
                    window.location.href = config.ctaLink;
                }, 200);
            });
        }
        
        if (config.closeOnEscape) {
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && isOpen) {
                    close();
                }
            });
        }
    }
    
    function init(userConfig) {
        config = { ...defaults, ...userConfig };
        inject();
        
        if (config.autoOpen) {
            autoOpenTimer = setTimeout(open, config.delay);
        }
        
        return {
            open: open,
            close: close,
            destroy: destroy
        };
    }
    
    function open() {
        if (isOpen || !elements.overlay) return;
        
        isOpen = true;
        elements.overlay.classList.add('active');
        
        if (config.onOpen) {
            config.onOpen();
        }
    }
    
    function close() {
        if (!isOpen) return;
        
        isOpen = false;
        elements.overlay.classList.remove('active');
        
        if (config.onClose) {
            config.onClose();
        }
    }
    
    function copyCoupon() {
        const code = config.couponCode;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code)
                .then(function() {
                    handleCopySuccess(code);
                })
                .catch(function() {
                    fallbackCopy(code);
                });
        } else {
            fallbackCopy(code);
        }
    }
    
    function fallbackCopy(code) {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            handleCopySuccess(code);
        } catch (err) {
            console.error('Erro ao copiar:', err);
        }
        
        document.body.removeChild(textArea);
    }
    
    function handleCopySuccess(code) {
        if (elements.copyText) {
            elements.copyText.textContent = 'Copiado';
            elements.copyBtn.classList.add('copied');
        }
        
        if (config.onCopyCoupon) {
            config.onCopyCoupon(code);
        }
        
        setTimeout(function() {
            if (elements.copyText) {
                elements.copyText.textContent = 'Copiar';
                elements.copyBtn.classList.remove('copied');
            }
        }, 2000);
    }
    
    function destroy() {
        if (autoOpenTimer) {
            clearTimeout(autoOpenTimer);
        }
        
        if (elements.overlay) {
            elements.overlay.remove();
        }
        
        isOpen = false;
        elements = {};
    }
    
    global.CouponPopup = {
        init: init,
        open: open,
        close: close,
        destroy: destroy,
        version: '1.0.0'
    };
    
})(window);