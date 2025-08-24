// QR Code Generator utility for ticket entry
window.QRGenerator = {
  // Generate QR code data URL for ticket
  generateTicketQR(ticketData) {
    const qrData = {
      ticketId: ticketData.id,
      eventId: ticketData.eventId,
      userId: ticketData.userId || 'guest',
      timestamp: Date.now(),
      checksum: this.generateChecksum(ticketData)
    };

    return this.createQRCodeDataURL(JSON.stringify(qrData));
  },

  // Generate checksum for security
  generateChecksum(ticketData) {
    const data = `${ticketData.id}-${ticketData.eventId}-${ticketData.userId || 'guest'}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  },

  // Create QR code data URL using a simple QR code generation
  createQRCodeDataURL(data) {
    // Using QR.js library approach - simplified version
    const size = 200;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;

    // Simple pattern generation (in real app, use proper QR library)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#FFFFFF';
    const cellSize = size / 25;
    
    // Create a simple pattern based on data hash
    const hash = this.simpleHash(data);
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        const index = i * 25 + j;
        if ((hash + index) % 3 === 0) {
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }
    }

    // Add corner markers
    this.drawCornerMarker(ctx, 0, 0, cellSize);
    this.drawCornerMarker(ctx, 22 * cellSize, 0, cellSize);
    this.drawCornerMarker(ctx, 0, 22 * cellSize, cellSize);

    return canvas.toDataURL('image/png');
  },

  // Simple hash function
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  },

  // Draw QR code corner markers
  drawCornerMarker(ctx, x, y, cellSize) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, cellSize * 3, cellSize * 3);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + cellSize, y + cellSize, cellSize, cellSize);
  },

  // Validate QR code data
  validateTicketQR(qrData) {
    try {
      const data = JSON.parse(qrData);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      // Check if QR code is not too old
      if (now - data.timestamp > maxAge) {
        return { valid: false, reason: 'QR code expired' };
      }

      // Validate required fields
      if (!data.ticketId || !data.eventId || !data.checksum) {
        return { valid: false, reason: 'Invalid QR code format' };
      }

      return { valid: true, data };
    } catch (error) {
      return { valid: false, reason: 'Invalid QR code data' };
    }
  },

  // Generate Apple Wallet pass data
  generateAppleWalletPass(ticket) {
    return {
      formatVersion: 1,
      passTypeIdentifier: 'pass.com.eventx.ticket',
      serialNumber: ticket.id,
      teamIdentifier: 'EVENTX',
      organizationName: 'EventX',
      description: `Ticket for ${ticket.eventTitle}`,
      logoText: 'EventX',
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(99, 102, 241)',
      eventTicket: {
        primaryFields: [
          {
            key: 'event',
            label: 'EVENT',
            value: ticket.eventTitle
          }
        ],
        secondaryFields: [
          {
            key: 'date',
            label: 'DATE',
            value: new Date(ticket.eventDate).toLocaleDateString('sv-SE')
          },
          {
            key: 'time',
            label: 'TIME',
            value: new Date(ticket.eventDate).toLocaleTimeString('sv-SE', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          }
        ],
        auxiliaryFields: [
          {
            key: 'location',
            label: 'LOCATION',
            value: ticket.eventLocation
          },
          {
            key: 'ticket',
            label: 'TICKET',
            value: `#${ticket.id}`
          }
        ],
        backFields: [
          {
            key: 'terms',
            label: 'Terms and Conditions',
            value: 'This ticket is valid for one person only. Please arrive 30 minutes before the event starts.'
          }
        ]
      },
      barcode: {
        message: JSON.stringify({
          ticketId: ticket.id,
          eventId: ticket.eventId,
          checksum: this.generateChecksum(ticket)
        }),
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1'
      }
    };
  }
};

// Initialize QR Generator
console.log('QR Generator utility loaded');
