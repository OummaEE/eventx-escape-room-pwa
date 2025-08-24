function EventCard({ event, onBook }) {
  const [showBooking, setShowBooking] = React.useState(false);

  try {
    return (
      <>
        <div className="card hover:shadow-lg transition-all duration-300 cursor-pointer slide-up" 
             data-name="event-card" data-file="components/EventCard.js">
          <div className="relative mb-4">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-48 object-cover rounded-xl"
            />
            <div className="absolute top-4 right-4">
              <span className="bg-[var(--primary-color)] text-white px-3 py-1 rounded-full text-sm font-medium">
                {event.price === 0 ? I18n.t('free') : `${event.price}₽`}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{event.title}</h3>
            
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <div className="icon-calendar text-lg text-[var(--primary-color)]"></div>
              <span>{event.date}</span>
            </div>
            
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <div className="icon-map-pin text-lg text-[var(--primary-color)]"></div>
              <span>{event.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <div className="icon-users text-lg text-[var(--primary-color)]"></div>
              <span>{event.available} {I18n.t('availableSeats')}</span>
            </div>
            
            <p className="text-[var(--text-secondary)] text-sm line-clamp-2">
              {event.description}
            </p>
            
            <button 
              className="btn-primary w-full"
              onClick={() => setShowBooking(true)}
            >
              {I18n.t('book')}
            </button>
          </div>
        </div>
        
        {showBooking && (
          <BookingModal 
            event={event}
            onClose={() => setShowBooking(false)}
            onBook={onBook}
          />
        )}
      </>
    );
  } catch (error) {
    console.error('EventCard component error:', error);
    return null;
  }
}