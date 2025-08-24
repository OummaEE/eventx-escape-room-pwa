function BottomNavigation({ currentScreen, onScreenChange }) {
  const [language, setLanguage] = React.useState(I18n.currentLanguage);
  
  React.useEffect(() => {
    const handleLanguageChange = () => setLanguage(I18n.currentLanguage);
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  try {
    const navItems = [
      { id: 'home', icon: 'home', label: I18n.t('home') },
      { id: 'events', icon: 'calendar', label: I18n.t('events') },
      { id: 'bookings', icon: 'bookmark', label: I18n.t('bookings') },
      { id: 'wallet', icon: 'wallet', label: I18n.t('wallet') },
      { id: 'profile', icon: 'user', label: I18n.t('profile') }
    ];

    return (
      <nav className="bottom-nav" data-name="bottom-navigation" data-file="components/BottomNavigation.js">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentScreen === item.id ? 'active' : ''}`}
            onClick={() => onScreenChange(item.id)}
          >
            <div className={`icon-${item.icon} text-xl`}></div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    );
  } catch (error) {
    console.error('BottomNavigation component error:', error);
    return null;
  }
}