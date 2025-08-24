// Storage Manager for localStorage and IndexedDB
window.StorageManager = {
  // LocalStorage methods for simple data
  saveBooking(booking) {
    try {
      const bookings = this.getBookings();
      bookings.push(booking);
      localStorage.setItem('eventx_bookings', JSON.stringify(bookings));
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  },

  getBookings() {
    try {
      const bookings = localStorage.getItem('eventx_bookings');
      return bookings ? JSON.parse(bookings) : [];
    } catch (error) {
      console.error('Error getting bookings:', error);
      return [];
    }
  },

  saveTicket(ticket) {
    try {
      const tickets = this.getTickets();
      tickets.push(ticket);
      localStorage.setItem('eventx_tickets', JSON.stringify(tickets));
    } catch (error) {
      console.error('Error saving ticket:', error);
    }
  },

  getTickets() {
    try {
      const tickets = localStorage.getItem('eventx_tickets');
      return tickets ? JSON.parse(tickets) : [];
    } catch (error) {
      console.error('Error getting tickets:', error);
      return [];
    }
  },

  saveUserProfile(profile) {
    try {
      localStorage.setItem('eventx_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  },

  getUserProfile() {
    try {
      const profile = localStorage.getItem('eventx_profile');
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  // IndexedDB methods for complex data
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EventXDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('offline_data')) {
          db.createObjectStore('offline_data', { keyPath: 'key' });
        }
      };
    });
  },

  async saveToIndexedDB(storeName, data) {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
    }
  },

  async getFromIndexedDB(storeName, key) {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting from IndexedDB:', error);
      return null;
    }
  },

  clearAll() {
    try {
      localStorage.removeItem('eventx_bookings');
      localStorage.removeItem('eventx_tickets');
      localStorage.removeItem('eventx_profile');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};