// Enhanced notification manager with push notifications and event reminders
window.NotificationManager = {
  permission: 'default',
  
  async requestPermission() {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    }
    return false;
  },

  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      await this.requestPermission();
    }

    if (this.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      return notification;
    }
  },

  // Schedule event reminder notifications
  scheduleEventReminder(booking) {
    const eventDate = new Date(booking.eventDate);
    const now = new Date();
    
    // Schedule reminders at different intervals
    const reminders = [
      { time: 24 * 60 * 60 * 1000, message: '24 timmar' }, // 24 hours
      { time: 2 * 60 * 60 * 1000, message: '2 timmar' },   // 2 hours
      { time: 30 * 60 * 1000, message: '30 minuter' }      // 30 minutes
    ];

    reminders.forEach(reminder => {
      const reminderTime = eventDate.getTime() - reminder.time;
      const timeUntilReminder = reminderTime - now.getTime();

      if (timeUntilReminder > 0) {
        setTimeout(() => {
          this.showNotification(
            window.I18n.t('eventReminder'),
            {
              body: `${booking.eventTitle} ${window.I18n.t('eventStartsSoon')} ${reminder.message}`,
              icon: '/icon-192.png',
              tag: `reminder-${booking.id}-${reminder.time}`,
              requireInteraction: true,
              actions: [
                {
                  action: 'view-ticket',
                  title: 'Visa biljett'
                },
                {
                  action: 'dismiss',
                  title: 'Stäng'
                }
              ]
            }
          );
        }, timeUntilReminder);
      }
    });
  },

  // Show booking confirmation notification
  showBookingConfirmation(booking) {
    this.showNotification(
      window.I18n.t('bookingConfirmed'),
      {
        body: `Din bokning för ${booking.eventTitle} är bekräftad!`,
        icon: '/icon-192.png',
        tag: `booking-${booking.id}`,
        actions: [
          {
            action: 'view-ticket',
            title: 'Visa biljett'
          }
        ]
      }
    );
  },

  // Show payment success notification
  showPaymentSuccess(ticket) {
    this.showNotification(
      'Betalning lyckades!',
      {
        body: `Din biljett för ${ticket.eventTitle} ${window.I18n.t('ticketReady')}`,
        icon: '/icon-192.png',
        tag: `payment-${ticket.id}`,
        actions: [
          {
            action: 'view-ticket',
            title: 'Visa biljett'
          },
          {
            action: 'add-to-wallet',
            title: 'Lägg till i Wallet'
          }
        ]
      }
    );
  },

  // Register service worker for push notifications
  async registerServiceWorker() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Subscribe to push notifications
        await this.subscribeToPush(registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  },

  // Subscribe to push notifications
  async subscribeToPush(registration) {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIGzSgHSFkwFzwqjSWAcqJxQIqHrqHdTj6QYdqn1ZFGR0C8-7_fhM' // Demo key
        )
      });

      console.log('Push subscription:', subscription);
      
      // Send subscription to server (in real app)
      // await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  },

  // Convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  // Handle notification clicks
  handleNotificationClick(event) {
    event.notification.close();

    switch (event.action) {
      case 'view-ticket':
        // Navigate to wallet screen
        window.dispatchEvent(new CustomEvent('navigateToWallet'));
        break;
      case 'add-to-wallet':
        // Trigger add to wallet
        window.dispatchEvent(new CustomEvent('addToWallet', {
          detail: { ticketId: event.notification.tag.split('-')[1] }
        }));
        break;
      default:
        // Default action - open app
        if (clients.openWindow) {
          clients.openWindow('/');
        }
        break;
    }
  },

  // Initialize notifications
  async init() {
    await this.requestPermission();
    await this.registerServiceWorker();
    
    // Listen for notification clicks
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'notification-click') {
          this.handleNotificationClick(event.data);
        }
      });
    }
  },

  // Show toast notification (in-app)
  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transform translate-x-full transition-transform duration-300 ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    }`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    // Animate out and remove
    setTimeout(() => {
      toast.style.transform = 'translateX(full)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
};

// Listen for custom toast events
window.addEventListener('showToast', (event) => {
  const { message, type, duration } = event.detail;
  window.NotificationManager.showToast(message, type, duration);
});

// Initialize on load
window.addEventListener('load', () => {
  window.NotificationManager.init();
});

console.log('Enhanced Notification Manager loaded');