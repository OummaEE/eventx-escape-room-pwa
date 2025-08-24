// Apple Wallet Manager for .pkpass generation
window.WalletManager = {
  async createTicket(booking) {
    try {
      // Generate QR code data
      const qrData = JSON.stringify({
        bookingId: booking.id,
        eventId: booking.eventId,
        eventTitle: booking.eventTitle,
        timestamp: Date.now()
      });

      // Create ticket object
      const ticket = {
        id: booking.id,
        type: 'event',
        title: booking.eventTitle,
        date: booking.eventDate,
        location: booking.eventLocation,
        qrCode: qrData,
        barcode: this.generateBarcode(booking.id),
        createdAt: new Date().toISOString()
      };

      return ticket;
    } catch (error) {
      console.error('Error creating wallet ticket:', error);
      return null;
    }
  },

  generateBarcode(bookingId) {
    // Simple barcode generation
    return `EVX${bookingId.padStart(10, '0')}`;
  },

  async addToWallet(ticket) {
    try {
      // Check if device supports Apple Wallet
      if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
        // Generate .pkpass file data
        const passData = this.generatePassData(ticket);
        
        // Create download link
        const blob = new Blob([JSON.stringify(passData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${ticket.title}-ticket.pkpass`;
        a.click();
        
        URL.revokeObjectURL(url);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to wallet:', error);
      return false;
    }
  },

  generatePassData(ticket) {
    return {
      formatVersion: 1,
      passTypeIdentifier: 'pass.com.eventx.ticket',
      serialNumber: ticket.id,
      teamIdentifier: 'EVENTX',
      organizationName: 'EventX',
      description: ticket.title,
      logoText: 'EventX',
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(99, 102, 241)',
      eventTicket: {
        primaryFields: [
          {
            key: 'event',
            label: 'Мероприятие',
            value: ticket.title
          }
        ],
        secondaryFields: [
          {
            key: 'date',
            label: 'Дата',
            value: ticket.date
          },
          {
            key: 'location',
            label: 'Место',
            value: ticket.location
          }
        ]
      },
      barcode: {
        message: ticket.qrCode,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1'
      }
    };
  }
};
