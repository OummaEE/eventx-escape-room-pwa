function BottomNavigation({ currentScreen, onScreenChange }) {
  const navItems = [
    { id: 'home', icon: 'icon-home', label: window.I18n.t('home') },
    { id: 'events', icon: 'icon-calendar', label: window.I18n.t('events') },
    { id: 'bookings', icon: 'icon-bookmark', label: window.I18n.t('bookings') },
    { id: 'wallet', icon: 'icon-credit-card', label: window.I18n.t('wallet') },
    { id: 'photos', icon: 'icon-camera', label: window.I18n.t('photos') },
    { id: 'profile', icon: 'icon-user', label: window.I18n.t('profile') }
  ];

  return (
    <div className="bottom-nav bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onScreenChange(item.id)}
            className={`nav-item relative ${
              currentScreen === item.id ? 'active' : ''
            }`}
          >
            {/* Active indicator */}
            {currentScreen === item.id && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></div>
            )}
            
            {/* Icon with modern styling */}
            <div className={`${item.icon} text-xl mb-1 transition-all duration-300 ${
              currentScreen === item.id 
                ? 'text-indigo-600 scale-110' 
                : 'text-gray-500 hover:text-indigo-500'
            }`}></div>
            
            {/* Label with better typography */}
            <span className={`text-xs font-medium transition-all duration-300 ${
              currentScreen === item.id 
                ? 'text-indigo-600 font-semibold' 
                : 'text-gray-500'
            }`}>
              {item.label}
            </span>
            
            {/* Subtle background for active state */}
            {currentScreen === item.id && (
              <div className="absolute inset-0 bg-indigo-50 rounded-xl -z-10 scale-110"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
