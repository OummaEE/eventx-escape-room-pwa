function EventsScreen({ onBook }) {
  const [events, setEvents] = React.useState([]);
  const [filter, setFilter] = React.useState('all');

  React.useEffect(() => {
    // Mock events data
    const mockEvents = [
      {
        id: '3',
        title: 'Фестиваль еды',
        date: '2025-01-25',
        location: 'ВДНХ, Москва',
        price: 1500,
        available: 200,
        category: 'food',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
        description: 'Гастрономическое путешествие по кухням мира'
      },
      {
        id: '4',
        title: 'Стартап Meetup',
        date: '2025-02-01',
        location: 'Технопарк Сколково',
        price: 0,
        available: 100,
        category: 'business',
        image: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400',
        description: 'Нетворкинг для предпринимателей и инвесторов'
      },
      {
        id: '5',
        title: 'Выставка современного искусства',
        date: '2025-02-10',
        location: 'Третьяковская галерея',
        price: 800,
        available: 80,
        category: 'art',
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
        description: 'Новые имена в современном искусстве'
      }
    ];
    setEvents(mockEvents);
  }, []);

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.category === filter);

  try {
    return (
      <div className="min-h-screen bg-gray-50" 
           data-name="events-screen" data-file="screens/EventsScreen.js">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Мероприятия</h1>
            
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'all', label: 'Все' },
                { id: 'business', label: 'Бизнес' },
                { id: 'art', label: 'Искусство' },
                { id: 'food', label: 'Еда' },
                { id: 'music', label: 'Музыка' }
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFilter(category.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-all ${
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

        {/* Events List */}
        <div className="px-6 py-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="icon-calendar text-6xl text-gray-300 mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Мероприятий не найдено</h3>
              <p className="text-gray-500">Попробуйте изменить фильтры</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onBook={onBook}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('EventsScreen component error:', error);
    return null;
  }
}