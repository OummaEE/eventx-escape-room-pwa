function HomeScreen({ onBook }) {
  const [featuredEvents, setFeaturedEvents] = React.useState([]);
  const [language, setLanguage] = React.useState(I18n.currentLanguage);

  React.useEffect(() => {
    const handleLanguageChange = () => setLanguage(I18n.currentLanguage);
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  React.useEffect(() => {
    // Mock featured events data with localized content
    const mockEvents = [
      {
        id: '1',
        title: language === 'ru' ? 'Концерт в Парке Горького' : 
              language === 'en' ? 'Concert at Gorky Park' : 'Konsert i Gorky Park',
        date: '2025-01-15',
        location: language === 'ru' ? 'Парк Горького, Москва' : 
                 language === 'en' ? 'Gorky Park, Moscow' : 'Gorky Park, Moskva',
        price: 2500,
        available: 150,
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        description: language === 'ru' ? 'Незабываемый вечер живой музыки под открытым небом' :
                    language === 'en' ? 'Unforgettable evening of live music under the open sky' :
                    'Oförglömlig kväll med livemusik under öppen himmel'
      },
      {
        id: '2',
        title: language === 'ru' ? 'Технологическая конференция' :
              language === 'en' ? 'Technology Conference' : 'Teknisk konferens',
        date: '2025-01-20',
        location: language === 'ru' ? 'Экспоцентр, Москва' :
                 language === 'en' ? 'Expocenter, Moscow' : 'Expocenter, Moskva',
        price: 0,
        available: 300,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
        description: language === 'ru' ? 'Будущее технологий: ИИ, блокчейн и машинное обучение' :
                    language === 'en' ? 'Future of technology: AI, blockchain and machine learning' :
                    'Framtiden för teknik: AI, blockchain och maskininlärning'
      }
    ];
    setFeaturedEvents(mockEvents);
  }, [language]);

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" 
           data-name="home-screen" data-file="screens/HomeScreen.js">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">{I18n.t('appName')}</h1>
                <p className="text-[var(--text-secondary)]">{I18n.t('findEvent')}</p>
              </div>
              <div className="w-12 h-12 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
                <div className="icon-bell text-xl text-white"></div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={I18n.t('searchEvents')}
                className="input-field pl-12"
              />
              <div className="icon-search absolute left-4 top-1/2 transform -translate-y-1/2 text-xl text-[var(--text-secondary)]"></div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 py-6">
          <h2 className="text-xl font-bold mb-4">{I18n.t('categories')}</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: 'music', label: I18n.t('music'), color: 'bg-purple-100 text-purple-600' },
              { icon: 'briefcase', label: I18n.t('business'), color: 'bg-blue-100 text-blue-600' },
              { icon: 'palette', label: I18n.t('art'), color: 'bg-pink-100 text-pink-600' },
              { icon: 'gamepad', label: I18n.t('entertainment'), color: 'bg-green-100 text-green-600' }
            ].map((category, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-2`}>
                  <div className={`icon-${category.icon} text-2xl`}></div>
                </div>
                <span className="text-sm font-medium">{category.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Events */}
        <div className="px-6 pb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{I18n.t('featured')}</h2>
            <span className="text-[var(--primary-color)] font-medium">{I18n.t('all')}</span>
          </div>
          
          <div className="space-y-4">
            {featuredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onBook={onBook}
              />
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('HomeScreen component error:', error);
    return null;
  }
}