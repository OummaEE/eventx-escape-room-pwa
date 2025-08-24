class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center card">
            <div className="icon-alert-circle text-4xl text-red-500 mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{window.I18n.t('somethingWentWrong')}</h1>
            <p className="text-gray-600 mb-4">{window.I18n.t('unexpectedError')}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              {window.I18n.t('reload')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [currentScreen, setCurrentScreen] = React.useState('home');
  const [bookings, setBookings] = React.useState([]);
  const [tickets, setTickets] = React.useState([]);

  React.useEffect(() => {
    // Initialize notifications
    if (window.NotificationManager) {
      window.NotificationManager.requestPermission();
    }
    
    // Load saved data
    const savedBookings = StorageManager.getBookings();
    const savedTickets = StorageManager.getTickets();
    setBookings(savedBookings);
    setTickets(savedTickets);

    // Listen for navigation events
    const handleNavigateToEvents = () => setCurrentScreen('events');
    const handleNavigateToWallet = () => setCurrentScreen('wallet');
    
    window.addEventListener('navigateToEvents', handleNavigateToEvents);
    window.addEventListener('navigateToWallet', handleNavigateToWallet);

    return () => {
      window.removeEventListener('navigateToEvents', handleNavigateToEvents);
      window.removeEventListener('navigateToWallet', handleNavigateToWallet);
    };
  }, []);

  const addBooking = (booking) => {
    const newBookings = [...bookings, booking];
    setBookings(newBookings);
    StorageManager.saveBooking(booking);
    
    // Schedule notification and show confirmation
    if (window.NotificationManager) {
      window.NotificationManager.scheduleEventReminder(booking);
      window.NotificationManager.showBookingConfirmation(booking);
    }
  };

  const addTicket = (ticket) => {
    const newTickets = [...tickets, ticket];
    setTickets(newTickets);
    StorageManager.saveTicket(ticket);

    // Show payment success notification
    if (window.NotificationManager) {
      window.NotificationManager.showPaymentSuccess(ticket);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onBook={addBooking} />;
      case 'events':
        return <EventsScreen onBook={addBooking} />;
      case 'bookings':
        return <BookingsScreen bookings={bookings} />;
      case 'wallet':
        return <WalletScreen tickets={tickets} />;
      case 'photos':
        return <PhotosScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen onBook={addBooking} />;
    }
  };

  try {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-br from-slate-50 to-blue-50" data-name="app" data-file="app.js">
        <div className="fade-in">
          {renderScreen()}
        </div>
        <BottomNavigation 
          currentScreen={currentScreen} 
          onScreenChange={setCurrentScreen} 
        />
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);