(function() {
    'use strict';
    
    const affiliateLink = 'https://app.monetizze.com.br/r/ALF25834634?u=c&pl=HG216689';
    
    document.querySelectorAll('.cta-button, .btn-header').forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'cta_click', {
                    'event_category': 'conversion',
                    'event_label': 'Monetizze CTA'
                });
            }
            
            window.open(affiliateLink, '_blank', 'noopener,noreferrer');
        });
    });
    
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(function(item) {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            faqItems.forEach(function(otherItem) {
                otherItem.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
    
})();