
// install-prompt.js - Управление установкой PWA как нативного приложения

class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.installButton = null;
    this.isInstalled = false;
    this.init();
  }

  init() {
    // Проверяем поддержку PWA
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      this.setupServiceWorker();
    }

    // Слушаем событие beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('EventX PWA: beforeinstallprompt event fired');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Проверяем установлено ли уже приложение
    window.addEventListener('appinstalled', (e) => {
      console.log('EventX PWA: App was installed');
      this.isInstalled = true;
      this.hideInstallButton();
      this.showInstalledMessage();
    });

    // Проверяем standalone режим (запущено как приложение)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      console.log('EventX PWA: Running in standalone mode');
      this.isInstalled = true;
    }

    this.createInstallButton();
  }

  setupServiceWorker() {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('EventX PWA: Service Worker registered successfully:', registration.scope);

        // Проверяем обновления каждые 5 минут
        setInterval(() => {
          registration.update();
        }, 300000);
      })
      .catch((error) => {
        console.log('EventX PWA: Service Worker registration failed:', error);
      });
  }

  createInstallButton() {
    // Создаем кнопку установки
    const installButtonHTML = `
      <div id="pwa-install-banner" class="install-banner" style="display: none;">
        <div class="install-content">
          <div class="install-icon">📱</div>
          <div class="install-text">
            <h3>Installera EventX App</h3>
            <p>Få snabb åtkomst till bokningar direkt från hemskärmen</p>
          </div>
          <button id="pwa-install-btn" class="install-btn">Installera</button>
          <button id="pwa-dismiss-btn" class="dismiss-btn">×</button>
        </div>
      </div>

      <style>
        .install-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
          z-index: 1000;
          transform: translateY(100%);
          transition: transform 0.3s ease-in-out;
        }

        .install-banner.show {
          transform: translateY(0);
        }

        .install-content {
          display: flex;
          align-items: center;
          max-width: 600px;
          margin: 0 auto;
          gap: 15px;
        }

        .install-icon {
          font-size: 2em;
          flex-shrink: 0;
        }

        .install-text h3 {
          margin: 0 0 5px 0;
          font-size: 1.1em;
          font-weight: 600;
        }

        .install-text p {
          margin: 0;
          font-size: 0.9em;
          opacity: 0.9;
        }

        .install-btn {
          background: white;
          color: #667eea;
          border: none;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .install-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255,255,255,0.3);
        }

        .dismiss-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.5em;
          cursor: pointer;
          padding: 5px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .dismiss-btn:hover {
          opacity: 1;
        }

        @media (max-width: 480px) {
          .install-content {
            gap: 10px;
          }
          .install-text h3 {
            font-size: 1em;
          }
          .install-text p {
            font-size: 0.8em;
          }
          .install-btn {
            padding: 8px 15px;
            font-size: 0.9em;
          }
        }
      </style>
    `;

    // Вставляем баннер в DOM
    document.body.insertAdjacentHTML('beforeend', installButtonHTML);

    // Добавляем обработчики событий
    document.getElementById('pwa-install-btn').addEventListener('click', () => {
      this.installApp();
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
      this.hideInstallButton();
      localStorage.setItem('eventx-pwa-dismissed', Date.now().toString());
    });
  }

  showInstallButton() {
    // Не показываем если уже установлено или недавно отклонено
    if (this.isInstalled) return;

    const dismissed = localStorage.getItem('eventx-pwa-dismissed');
    if (dismissed && (Date.now() - parseInt(dismissed)) < 604800000) { // 7 дней
      return;
    }

    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.style.display = 'block';
      setTimeout(() => {
        banner.classList.add('show');
      }, 100);
    }
  }

  hideInstallButton() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.classList.remove('show');
      setTimeout(() => {
        banner.style.display = 'none';
      }, 300);
    }
  }

  async installApp() {
    if (!this.deferredPrompt) {
      this.showManualInstallInstructions();
      return;
    }

    try {
      // Показываем нативный промпт
      this.deferredPrompt.prompt();

      // Ждем ответа пользователя
      const { outcome } = await this.deferredPrompt.userChoice;

      console.log(`EventX PWA: User response to install prompt: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('EventX PWA: User accepted the install prompt');
      } else {
        console.log('EventX PWA: User dismissed the install prompt');
      }

      // Очищаем промпт
      this.deferredPrompt = null;
      this.hideInstallButton();

    } catch (error) {
      console.error('EventX PWA: Error during installation:', error);
      this.showManualInstallInstructions();
    }
  }

  showManualInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    let instructions = '';

    if (isIOS && isSafari) {
      instructions = `
        För att installera EventX appen på iOS:
        1. Tryck på delningsikonen (□↑) i Safari
        2. Välj "Lägg till på hemskärmen"
        3. Tryck "Lägg till"
      `;
    } else if (navigator.userAgent.includes('Chrome')) {
      instructions = `
        För att installera EventX appen:
        1. Tryck på menyn (⋮) i Chrome
        2. Välj "Installera app" eller "Lägg till på hemskärmen"
        3. Följ instruktionerna
      `;
    } else {
      instructions = `
        För att få bästa upplevelsen, öppna EventX i Chrome eller Safari
        och följ instruktionerna för att lägga till på hemskärmen.
      `;
    }

    alert(instructions);
  }

  showInstalledMessage() {
    // Visa meddelande om lyckad installation
    const message = document.createElement('div');
    message.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
      ">
        ✅ EventX appen har installerats!
      </div>
      <style>
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `;

    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
    }, 4000);
  }
}

// Инициализация PWA установщика когда DOM готов
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PWAInstaller();
  });
} else {
  new PWAInstaller();
}
