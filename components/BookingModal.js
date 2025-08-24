function BookingModal({ event, onClose, onBook }) {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    tickets: 1
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const booking = {
        id: Date.now().toString(),
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        ...formData,
        totalPrice: event.price * formData.tickets,
        bookingDate: new Date().toISOString(),
        status: 'confirmed'
      };

      // Process payment if not free
      if (event.price > 0) {
        const paymentSuccess = await PaymentManager.processPayment({
          amount: booking.totalPrice,
          currency: 'RUB',
          description: `Билет на ${event.title}`
        });

        if (!paymentSuccess) {
          throw new Error('Payment failed');
        }
      }

      // Create wallet ticket
      const ticket = await WalletManager.createTicket(booking);
      
      onBook(booking);
      onClose();
      
      // Show success notification
      if (window.NotificationManager) {
        window.NotificationManager.showNotification(
          'Бронирование подтверждено!',
          `Ваш билет на ${event.title} готов`
        );
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Ошибка при бронировании. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
           data-name="booking-modal" data-file="components/BookingModal.js">
        <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{I18n.t('booking')}</h2>
            <button onClick={onClose} className="p-2">
              <div className="icon-x text-2xl text-[var(--text-secondary)]"></div>
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <p className="text-[var(--text-secondary)]">{event.date} • {event.location}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{I18n.t('name')}</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{I18n.t('email')}</label>
              <input
                type="email"
                required
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{I18n.t('phone')}</label>
              <input
                type="tel"
                required
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{I18n.t('ticketCount')}</label>
              <select
                className="input-field"
                value={formData.tickets}
                onChange={(e) => setFormData({...formData, tickets: parseInt(e.target.value)})}
              >
                {[1,2,3,4,5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>{I18n.t('total')}</span>
                <span>{event.price * formData.tickets}₽</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                {I18n.t('cancel')}
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? I18n.t('processing') : I18n.t('book')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  } catch (error) {
    console.error('BookingModal component error:', error);
    return null;
  }
}