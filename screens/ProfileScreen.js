function ProfileScreen() {
  const [profile, setProfile] = React.useState({
    name: I18n.currentLanguage === 'ru' ? 'Пользователь' : 
          I18n.currentLanguage === 'en' ? 'User' : 'Användare',
    email: 'user@example.com',
    phone: '+7 (999) 123-45-67',
    notifications: true,
    darkMode: false
  });
  const [language, setLanguage] = React.useState(I18n.currentLanguage);

  React.useEffect(() => {
    const handleLanguageChange = () => setLanguage(I18n.currentLanguage);
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  React.useEffect(() => {
    const savedProfile = StorageManager.getUserProfile();
    if (savedProfile) {
      setProfile(savedProfile);
    }
  }, []);

  const handleSave = () => {
    StorageManager.saveUserProfile(profile);
    if (window.NotificationManager) {
      window.NotificationManager.showNotification(
        'Профиль сохранён',
        'Ваши настройки успешно обновлены'
      );
    }
  };

  const handleClearData = () => {
    if (confirm('Удалить все данные? Это действие нельзя отменить.')) {
      StorageManager.clearAll();
      window.location.reload();
    }
  };

  try {
    return (
      <div className="min-h-screen bg-gray-50" 
           data-name="profile-screen" data-file="screens/ProfileScreen.js">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="px-6 py-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
                <div className="icon-user text-2xl text-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{profile.name}</h1>
                <p className="text-[var(--text-secondary)]">{profile.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="px-6 py-6">
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">{I18n.t('personalInfo')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{I18n.t('name')}</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{I18n.t('email')}</label>
                <input
                  type="email"
                  className="input-field"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{I18n.t('phone')}</label>
                <input
                  type="tel"
                  className="input-field"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">{I18n.t('settings')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{I18n.t('pushNotifications')}</span>
                <button
                  className={`w-12 h-6 rounded-full transition-colors ${
                    profile.notifications ? 'bg-[var(--primary-color)]' : 'bg-gray-300'
                  }`}
                  onClick={() => setProfile({...profile, notifications: !profile.notifications})}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    profile.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{I18n.t('darkTheme')}</span>
                <button
                  className={`w-12 h-6 rounded-full transition-colors ${
                    profile.darkMode ? 'bg-[var(--primary-color)]' : 'bg-gray-300'
                  }`}
                  onClick={() => setProfile({...profile, darkMode: !profile.darkMode})}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    profile.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{I18n.t('language')}</span>
                <select
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                  value={I18n.currentLanguage}
                  onChange={(e) => I18n.setLanguage(e.target.value)}
                >
                  {I18n.getAvailableLanguages().map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button onClick={handleSave} className="btn-primary w-full">
              {I18n.t('saveChanges')}
            </button>
            <button onClick={handleClearData} className="btn-secondary w-full text-red-600">
              {I18n.t('clearAllData')}
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ProfileScreen component error:', error);
    return null;
  }
}