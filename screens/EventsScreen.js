function EventsScreen({ onBook }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [language, setLanguage] = React.useState(window.I18n.currentLanguage);

  React.useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(window.I18n.currentLanguage);
    };
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const getAllEvents = () => [
    {
      id: '1',
      title: language === 'sv' ? 'Konsert i Gamla Stan' : 
            language === 'en' ? 'Concert at Gamla Stan' : 'Концерт в Старом городе',
      date: '2025-01-15',
      location: 'Gamla Stan, Stockholm',
      price: 450,
      available: 150,
      category: 'music',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      title: language === 'sv' ? 'Teknisk konferens' :
            language === 'en' ? 'Technology Conference' : 'Технологическая конференция',
      date: '2025-01-20',
      location: 'Waterfront Congress Centre, Stockholm',
      price: 0,
      available: 300,
      category: 'business',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop'
    },
    {
      id: '3',
      title: language === 'sv' ? 'Matfestival' :
            language === 'en' ? 'Food Festival' : 'Фестиваль еды',
      date: '2025-01-25',
      location: 'Östermalms Saluhall, Stockholm',
      price: 280,
      available: 200,
      category: 'food',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop'
    },
    {
      id: '4',
      title: language === 'sv' ? 'Konstutställning' :
            language === 'en' ? 'Art Exhibition' : 'Художественная выставка',
      date: '2025-01-25',
      location: 'Moderna Museet, Stockholm',
      price: 180,
      available: 80,
      category: 'art',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    },
    {
      id: '5',
      title: language === 'sv' ? 'Komedishow' :
            language === 'en' ? 'Comedy Show' : 'Комедийное шоу',
      date: '2025-01-30',
      location: 'Södra Teatern, Stockholm',
      price: 320,
      available: 120,
      category: 'entertainment',
      image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=300&fit=crop'
    },
    {
      id: '6',
      title: language === 'sv' ? 'Jazzfestival' :
            language === 'en' ? 'Jazz Festival' : 'Джазовый фестиваль',
      date: '2025-02-05',
      location: 'Fasching, Stockholm',
      price: 380,
      available: 90,
      category: 'music',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
    },
    {
      id: '7',
      title: language === 'sv' ? 'Startup-mässa' :
            language === 'en' ? 'Startup Fair' : 'Выставка стартапов',
      date: '2025-02-10',
      location: 'Stockholm Waterfront, Stockholm',
      price: 0,
      available: 250,
      category: 'business',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop'
    },
    {
      id: '8',
      title: language === 'sv' ? 'Filmfestival' :
            language === 'en' ? 'Film Festival' : 'Кинофестиваль',
      date: '2025-02-15',
      location: 'Cinemateket, Stockholm',
      price: 150,
      available: 180,
      category: 'entertainment',
      image: 'https://images.unsplash.com/photo-1489599735188-900f9d9b3b5c?w=400&h=300&fit=crop'
    },
    {
      id: '9',
      title: language === 'sv' ? 'Designutställning' :
            language === 'en' ? 'Design Exhibition' : 'Выставка дизайна',
      date: '2025-02-20',
      location: 'Svenskt Tenn, Stockholm',
      price: 220,
      available: 60,
      category: 'art',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    },
    {
      id: '10',
      title: language === 'sv' ? 'Vinterfestival' :
            language === 'en' ? 'Winter Festival' : 'Зимний фестиваль',
      date: '2025-02-25',
      location: 'Skansen, Stockholm',
      price: 195,
      available: 300,
      category: 'entertainment',
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'
    }
  ];

  const categories = [
    { id: 'all', name: window.I18n.t('all'), icon: 'icon-grid' },
    { id: 'music', name: window.I18n.t('music'), icon: 'icon-music' },
    { id: 'business', name: window.I18n.t('business'), icon: 'icon-briefcase' },
    { id: 'art', name: window.I18n.t('art'), icon: 'icon-palette' },
    { id: 'entertainment', name: window.I18n.t('entertainment'), icon: 'icon-smile' },
    { id: 'food', name: 'Mat', icon: 'icon-utensils' }
  ];

  const filteredEvents = getAllEvents().filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" data-name="events-screen" data-file="screens/EventsScreen.js">
      {/* Header */}
      <div className="text-center mb-8 slide-up">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{window.I18n.t('events')}</h1>
        <p className="text-gray-600 text-lg">Upptäck fantastiska evenemang i Stockholm</p>
      </div>

      {/* Search */}
      <div className="mb-6 fade-in">
        <div className="relative">
          <input
            type="text"
            placeholder={window.I18n.t('searchEvents')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 icon-search text-gray-400"></div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8 fade-in">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">{window.I18n.t('categories')}</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl min-w-[80px] transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <div className={`${category.icon} text-2xl`}></div>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="fade-in">
        <div className="grid gap-4">
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onBook={onBook}
            />
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="icon-search text-4xl text-gray-400 mb-4"></div>
          <p className="text-gray-500">Inga evenemang hittades</p>
        </div>
      )}
    </div>
  );
}
