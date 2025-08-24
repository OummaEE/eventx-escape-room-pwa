function BookingsScreen({ bookings }) {
  const [filter, setFilter] = React.useState('upcoming');

  const getFilteredBookings = () => {
    const now = new Date();
    return bookings.filter(booking => {
      const eventDate = new Date(booking.eventDate);
      switch (filter) {
        case 'upcoming':
          return eventDate >= now;
        case 'past':
          return eventDate < now;
        default:
          return true;
      }
    });
  };

  try {
    return (
      <div className="min-h-screen bg-gray-50" 
           data-name="bookings-screen" data-file="screens/BookingsScreen.js">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Мои брони</h1>
            
            {/* Filters */}
            <div className="flex gap-2">
              {[
                { id: 'upcoming', label: 'Предстоящие' },
                { id: 'past', label: 'Прошедшие' }
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFilter(category.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    filter === category.id
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="px-6 py-6">
          {getFilteredBookings().length === 0 ? (
            <div className="text-center py-12">
              <div className="icon-bookmark text-6xl text-gray-300 mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Нет бронирований</h3>
              <p className="text-gray-500">
                {filter === 'upcoming' 
                  ? 'У вас пока нет предстоящих мероприятий' 
                  : 'У вас нет прошедших мероприятий'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredBookings().map((booking) => (
                <div key={booking.id} className="card slide-up">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        {booking.eventTitle}
                      </h3>
                      <p className="text-[var(--text-secondary)]">
                        Бронь #{booking.id.slice(-6)}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {booking.status === 'confirmed' ? 'Подтверждено' : 'Ожидание'}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <div className="icon-calendar text-lg text-[var(--primary-color)]"></div>
                      <span>{booking.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <div className="icon-map-pin text-lg text-[var(--primary-color)]"></div>
                      <span>{booking.eventLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <div className="icon-users text-lg text-[var(--primary-color)]"></div>
                      <span>{booking.tickets} билет(ов)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <div className="icon-ruble-sign text-lg text-[var(--primary-color)]"></div>
                      <span>{booking.totalPrice}₽</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="btn-secondary flex-1">
                      Подробности
                    </button>
                    <button className="btn-primary flex-1">
                      Показать билет
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('BookingsScreen component error:', error);
    return null;
  }
}
