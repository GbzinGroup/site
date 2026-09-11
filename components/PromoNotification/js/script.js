(function() {
    const PromoNotification = {
        config: {
            delay: 3000,
            autoShow: true,
            showOnce: true,
            cookieExpires: 7
        },

        init(userConfig = {}) {
            this.config = { ...this.config, ...userConfig };
            
            if (this.config.autoShow && !this.hasSeenNotification()) {
                setTimeout(() => {
                    this.loadHTML();
                }, this.config.delay);
            }
        },

        loadHTML() {
            fetch('/components/PromoNotification/promo-notification.html')
                .then(response => response.text())
                .then(html => {
                    document.body.insertAdjacentHTML('beforeend', html);
                    this.show();
                    this.bindEvents();
                })
                .catch(error => {
                    console.error('Erro ao carregar notificação:', error);
                });
        },

        show() {
            const notification = document.getElementById('promoNotification');
            if (notification) {
                notification.classList.add('active');
                this.setSeenNotification();
            }
        },

        close() {
            const notification = document.getElementById('promoNotification');
            if (notification) {
                notification.classList.remove('active');
                notification.style.display = 'none';
            }
        },

        bindEvents() {
            const closeBtn = document.querySelector('.promo-notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.close();
                });
            }

            const notification = document.getElementById('promoNotification');
            if (notification) {
                notification.addEventListener('click', (e) => {
                    if (!notification.contains(e.target)) {
                        this.close();
                    }
                });
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.close();
                }
            });
        },

        setSeenNotification() {
            const expires = new Date();
            expires.setDate(expires.getDate() + this.config.cookieExpires);
            document.cookie = `promoNotificationSeen=true; expires=${expires.toUTCString()}; path=/`;
        },

        hasSeenNotification() {
            return document.cookie.includes('promoNotificationSeen=true');
        }
    };

    window.PromoNotification = PromoNotification;
})();   