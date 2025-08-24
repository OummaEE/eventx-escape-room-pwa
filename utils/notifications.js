// Notification Manager for push notifications
window.NotificationManager = {
  async requestPermission() {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  },

  async showNotification(title, body, options = {}) {
    try {
      if ('serviceWorker' in navigator && 'Notification' in window) {
        const registration = await navigator.serviceWorker.ready;
        
        return registration.showNotification(title, {
          body,
          icon: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=96&h=96&fit=crop&crop=center',
          badge: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=96&h=96&fit=crop&crop=center',
          vibrate: [200, 100, 200],
          data: {
            dateOfArrival: Date.now(),
            ...options.data
          },
          actions: [
            {
              action: 'view',
              title: 'Посмотреть',
              icon: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=96&h=96&fit=crop&crop=center'
            }
          ],
          ...options
        });
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  },

  scheduleReminder(booking) {
    try {
      const eventDate = new Date(booking.eventDate);
      const reminderTime = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
      const now = new Date();

      if (reminderTime > now) {
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        
        setTimeout(() => {
          this.showNotification(
            'Напоминание о мероприятии',
            `Завтра: ${booking.eventTitle} в ${booking.eventLocation}`,
            {
              data: { bookingId: booking.id, type: 'reminder' }
            }
          );
        }, timeUntilReminder);
      }
    } catch (error) {
      console.error('Error scheduling reminder:', error);
    }
  },

  async subscribeToPush() {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array('your-vapid-public-key')
        });

        // Send subscription to server
        console.log('Push subscription:', subscription);
        return subscription;
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
    }
  },

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
  }
};