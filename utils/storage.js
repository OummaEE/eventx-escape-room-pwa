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

  // Get attended events with photos
  getAttendedEvents() {
    try {
      const attendedEvents = localStorage.getItem('eventx_attended_events');
      if (attendedEvents) {
        return JSON.parse(attendedEvents);
      } else {
        // Return sample data for demo purposes
        const sampleEvents = [
          {
            id: 'attended_1',
            title: 'Konsert i Gamla Stan',
            date: '2024-12-15',
            location: 'Gamla Stan, Stockholm',
            photos: [
              {
                url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
                caption: 'Fantastisk konsert!'
              },
              {
                url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
                caption: 'Publiken var fantastisk'
              },
              {
                url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=400&fit=crop',
                caption: 'Scenen var magisk'
              }
            ]
          },
          {
            id: 'attended_2',
            title: 'Konstutställning',
            date: '2024-11-20',
            location: 'Moderna Museet, Stockholm',
            photos: [
              {
                url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
                caption: 'Vacker konst'
              },
              {
                url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
                caption: 'Inspirerande utställning'
              }
            ]
          },
          {
            id: 'attended_3',
            title: 'Matfestival',
            date: '2024-10-10',
            location: 'Östermalms Saluhall, Stockholm',
            photos: [
              {
                url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
                caption: 'Läcker mat'
              },
              {
                url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
                caption: 'Så många smaker'
              },
              {
                url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
                caption: 'Perfekt presentation'
              },
              {
                url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop',
                caption: 'Fantastiska desserter'
              }
            ]
          }
        ];
        
        // Save sample data for future use
        this.saveAttendedEvents(sampleEvents);
        return sampleEvents;
      }
    } catch (error) {
      console.error('Error getting attended events:', error);
      return [];
    }
  },

  saveAttendedEvents(events) {
    try {
      localStorage.setItem('eventx_attended_events', JSON.stringify(events));
    } catch (error) {
      console.error('Error saving attended events:', error);
    }
  },

  addAttendedEvent(event) {
    try {
      const attendedEvents = this.getAttendedEvents();
      attendedEvents.push(event);
      this.saveAttendedEvents(attendedEvents);
    } catch (error) {
      console.error('Error adding attended event:', error);
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