class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isSupported = false;
        this.debugMode = true; // Включаем debug режим

        this.init();
        this.checkPWASupport();
        this.setupDebugConsole();
    }

    log(message, type = 'info') {
        if (this.debugMode) {
            console.log(`[PWA Installer ${type.toUpperCase()}]:`, message);
        }
    }

    init() {
        this.log('Initializing PWA Installer...');

        // Проверяем поддержку Service Worker
        if ('serviceWorker' in navigator) {
            this.log('Service Worker supported');
            this.registerServiceWorker();
        } else {
            this.log('Service Worker not supported', 'error');
        }

        // Слушаем событие beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            this.log('beforeinstallprompt event fired');
            e.preventDefault();
            this.deferredPrompt = e;
            this.isSupported = true;
            this.showInstallButton();
        });

        // Проверяем установлено ли уже приложение
        window.addEventListener('appinstalled', () => {
            this.log('App installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.deferredPrompt = null;
            this.showSuccessMessage();
        });

        // Принудительно показываем кнопку через 2 секунды если не сработало событие
        setTimeout(() => {
            if (!this.isSupported && !this.isInstalled) {
                this.log('Force showing install button (no beforeinstallprompt)');
                this.showInstallButton(true);
            }
        }, 2000);

        // Создаем кнопку установки
        this.createInstallButton();
    }

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('./service-worker.js');
            this.log('Service Worker registered successfully');

            registration.addEventListener('updatefound', () => {
                this.log('Service Worker update found');
            });
        } catch (error) {
            this.log(`Service Worker registration failed: ${error}`, 'error');
        }
    }

    checkPWASupport() {
        const checks = {
            'HTTPS': location.protocol === 'https:' || location.hostname === 'localhost',
            'Service Worker': 'serviceWorker' in navigator,
            'Manifest': document.querySelector('link[rel="manifest"]') !== null,
            'Standalone Support': window.matchMedia('(display-mode: standalone)').matches || 
                                 window.navigator.standalone ||
                                 document.referrer.includes('android-app://') ||
                                 window.matchMedia('(display-mode: minimal-ui)').matches
        };

        this.log('PWA Support Check:', checks);

        // Проверяем установлено ли приложение
        if (checks['Standalone Support']) {
            this.isInstalled = true;
            this.log('App is already installed');
            this.hideInstallButton();
            this.hideInstallPromptSection();
        }

        // Дополнительная проверка через navigator.getInstalledRelatedApps (если поддерживается)
        if ('getInstalledRelatedApps' in navigator) {
            navigator.getInstalledRelatedApps().then(apps => {
                if (apps.length > 0) {
                    this.isInstalled = true;
                    this.log('App detected via getInstalledRelatedApps');
                    this.hideInstallButton();
                    this.hideInstallPromptSection();
                }
            }).catch(err => {
                this.log('getInstalledRelatedApps failed:', err);
            });
        }

        return checks;
    }

    createInstallButton() {
        // Удаляем существующую кнопку если есть
        const existingButton = document.getElementById('pwa-install-button');
        if (existingButton) {
            existingButton.remove();
        }

        const installButton = document.createElement('div');
        installButton.id = 'pwa-install-button';
        installButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 25px;
            padding: 15px 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            display: none;
            animation: pulse 2s infinite;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // Определяем текст кнопки по языку страницы
        const isSwedish = document.documentElement.lang === 'sv' || document.body.classList.contains('swedish');
        installButton.innerHTML = isSwedish ? '📱 Installera App' : '📱 Install App';

        installButton.addEventListener('click', () => this.handleInstallClick());

        // Добавляем CSS анимацию
        if (!document.getElementById('pwa-install-styles')) {
            const style = document.createElement('style');
            style.id = 'pwa-install-styles';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }

                #pwa-install-button:hover {
                    transform: scale(1.1);
                    transition: transform 0.2s ease;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(installButton);
        this.installButton = installButton;
    }

    showInstallButton(force = false) {
        if (this.isInstalled) {
            this.log('App already installed, not showing button');
            return;
        }

        if (this.installButton) {
            this.installButton.style.display = 'block';
            this.log(force ? 'Force showing install button' : 'Showing install button');
        }
    }

    hideInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'none';
            this.log('Hiding install button');
        }
    }

    async handleInstallClick() {
        this.log('Install button clicked');

        if (this.deferredPrompt) {
            // Используем нативный prompt
            this.log('Using native install prompt');
            this.deferredPrompt.prompt();

            const { outcome } = await this.deferredPrompt.userChoice;
            this.log(`User choice: ${outcome}`);

            if (outcome === 'accepted') {
                this.hideInstallButton();
            }

            this.deferredPrompt = null;
        } else {
            // Показываем инструкции для ручной установки
            this.log('Showing manual install instructions');
            this.showManualInstallInstructions();
        }
    }

    showManualInstallInstructions() {
        const isSwedish = document.documentElement.lang === 'sv' || document.body.classList.contains('swedish');

        // Определяем устройство и браузер
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        const isChrome = /Chrome/.test(navigator.userAgent);

        let instructions = '';

        if (isIOS && isSafari) {
            instructions = isSwedish ? 
                `📱 För att installera på iPhone/iPad:\n\n1. Tryck på Dela-knappen (⬆️) längst ned\n2. Välj "Lägg till på hemskärmen"\n3. Tryck "Lägg till"` :
                `📱 To install on iPhone/iPad:\n\n1. Tap the Share button (⬆️) at the bottom\n2. Select "Add to Home Screen"\n3. Tap "Add"`;
        } else if (isAndroid && isChrome) {
            instructions = isSwedish ?
                `📱 För att installera på Android:\n\n1. Tryck på menyn (⋮) i Chrome\n2. Välj "Lägg till på startskärmen"\n3. Tryck "Lägg till"` :
                `📱 To install on Android:\n\n1. Tap the menu (⋮) in Chrome\n2. Select "Add to Home screen"\n3. Tap "Add"`;
        } else {
            instructions = isSwedish ?
                `💻 För att installera på datorn:\n\n1. Leta efter app-ikonen i adressfältet\n2. Eller tryck Ctrl+Shift+A\n3. Välj "Installera"` :
                `💻 To install on desktop:\n\n1. Look for the app icon in the address bar\n2. Or press Ctrl+Shift+A\n3. Select "Install"`;
        }

        // Показываем красивый popup с инструкциями
        this.showInstructionModal(instructions, isSwedish);
    }

    showInstructionModal(instructions, isSwedish) {
        // Удаляем существующий modal если есть
        const existingModal = document.getElementById('pwa-instruction-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'pwa-instruction-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 400px;
            margin: 20px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;

        const title = isSwedish ? 'Installera EventX App' : 'Install EventX App';
        const closeText = isSwedish ? 'Stäng' : 'Close';

        modalContent.innerHTML = `
            <h3 style="margin-top: 0; color: #333;">${title}</h3>
            <p style="white-space: pre-line; line-height: 1.6; color: #666;">${instructions}</p>
            <button id="close-instruction-modal" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 16px;
                margin-top: 20px;
            ">${closeText}</button>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Закрытие modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.id === 'close-instruction-modal') {
                modal.remove();
            }
        });
    }

    showSuccessMessage() {
        const isSwedish = document.documentElement.lang === 'sv' || document.body.classList.contains('swedish');
        const message = isSwedish ? 
            'EventX App installerad! 🎉' : 
            'EventX App installed! 🎉';

        // Показываем toast уведомление
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideIn 0.3s ease;
        `;

        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    setupDebugConsole() {
        // Создаем debug панель для разработчиков
        if (this.debugMode && (location.hostname === 'localhost' || location.search.includes('debug=true'))) {
            this.createDebugPanel();
        }
    }

    createDebugPanel() {
        const debugPanel = document.createElement('div');
        debugPanel.id = 'pwa-debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            font-family: monospace;
            z-index: 9999;
            max-width: 300px;
        `;

        const checks = this.checkPWASupport();
        let debugHTML = '<strong>PWA Debug Info:</strong><br>';

        for (const [check, status] of Object.entries(checks)) {
            const icon = status ? '✅' : '❌';
            debugHTML += `${icon} ${check}: ${status}<br>`;
        }

        debugHTML += `<br>Install supported: ${this.isSupported ? '✅' : '❌'}<br>`;
        debugHTML += `App installed: ${this.isInstalled ? '✅' : '❌'}<br>`;
        debugHTML += `Deferred prompt: ${this.deferredPrompt ? '✅' : '❌'}`;

        debugPanel.innerHTML = debugHTML;
        document.body.appendChild(debugPanel);

        // Обновляем каждые 2 секунды
        setInterval(() => {
            const updatedChecks = this.checkPWASupport();
            let updatedHTML = '<strong>PWA Debug Info:</strong><br>';

            for (const [check, status] of Object.entries(updatedChecks)) {
                const icon = status ? '✅' : '❌';
                updatedHTML += `${icon} ${check}: ${status}<br>`;
            }

            updatedHTML += `<br>Install supported: ${this.isSupported ? '✅' : '❌'}<br>`;
            updatedHTML += `App installed: ${this.isInstalled ? '✅' : '❌'}<br>`;
            updatedHTML += `Deferred prompt: ${this.deferredPrompt ? '✅' : '❌'}`;

            debugPanel.innerHTML = updatedHTML;
        }, 2000);
    }

    hideInstallPromptSection() {
        // Add your logic to hide the install prompt section here
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('[EventX PWA] Initializing...');
    window.pwaInstaller = new PWAInstaller();
});

// Экспорт для использования в других скриптах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAInstaller;
}