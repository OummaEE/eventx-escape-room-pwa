function WalletScreen({ tickets }) {
  const [selectedTicket, setSelectedTicket] = React.useState(null);
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [qrCodeData, setQrCodeData] = React.useState(null);

  const handleShowQR = (ticket) => {
    const qrData = window.QRGenerator.generateTicketQR(ticket);
    setQrCodeData(qrData);
    setSelectedTicket(ticket);
    setShowQRModal(true);
  };

  const handleAddToAppleWallet = async (ticket) => {
    try {
      if (window.PassKit) {
        const passData = window.QRGenerator.generateAppleWalletPass(ticket);
        await window.PassKit.addPass(passData);
        
        // Show success notification
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: { message: window.I18n.t('addedToWallet'), type: 'success' }
        }));
      } else {
        // Fallback: download pass file
        const passData = window.QRGenerator.generateAppleWalletPass(ticket);
        const blob = new Blob([JSON.stringify(passData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `eventx-ticket-${ticket.id}.pkpass`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error adding to Apple Wallet:', error);
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { message: 'Could not add to Apple Wallet', type: 'error' }
      }));
    }
  };

  const QRModal = () => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 text-center">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">{window.I18n.t('qrCodeTitle')}</h3>
          <button
            onClick={() => setShowQRModal(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <div className="icon-x text-xl"></div>
          </button>
        </div>

        {selectedTicket && (
          <>
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-1">{selectedTicket.eventTitle}</h4>
              <p className="text-gray-600 text-sm">{new Date(selectedTicket.eventDate).toLocaleDateString('sv-SE')}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              {qrCodeData && (
                <img
                  src={qrCodeData}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                />
              )}
            </div>

            <p className="text-gray-600 text-sm mb-6">{window.I18n.t('showQrAtEntrance')}</p>

            <div className="flex gap-3">
              <button
                onClick={() => handleAddToAppleWallet(selectedTicket)}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <div className="icon-smartphone text-sm"></div>
                <span>{window.I18n.t('addToWallet')}</span>
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 btn-secondary"
              >
                {window.I18n.t('close')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const TicketCard = ({ ticket }) => {
    const eventDate = new Date(ticket.eventDate);
    const isUpcoming = eventDate > new Date();

    return (
      <div className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-gray-900 text-lg">{ticket.eventTitle}</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                isUpcoming 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {isUpcoming ? 'Kommande' : 'Tidigare'}
              </div>
            </div>
            <p className="text-gray-600 mb-1">{ticket.eventLocation}</p>
            <p className="text-gray-500 text-sm">
              {eventDate.toLocaleDateString('sv-SE')} • {eventDate.toLocaleTimeString('sv-SE', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{window.I18n.t('ticketNumber')}</p>
            <p className="font-mono font-semibold text-gray-900">#{ticket.id}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex gap-3">
            <button
              onClick={() => handleShowQR(ticket)}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <div className="icon-qr-code text-sm"></div>
              <span>{window.I18n.t('qrCode')}</span>
            </button>
            <button
              onClick={() => handleAddToAppleWallet(ticket)}
              className="btn-secondary flex items-center justify-center gap-2 px-4"
            >
              <div className="icon-smartphone text-sm"></div>
              <span className="hidden sm:inline">Wallet</span>
            </button>
          </div>
        </div>

        {/* Ticket design elements */}
        <div className="absolute top-4 right-4 opacity-10">
          <div className="icon-ticket text-4xl text-indigo-600"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4" data-name="wallet-screen" data-file="screens/WalletScreen.js">
      {/* Header */}
      <div className="text-center mb-8 slide-up">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{window.I18n.t('myTickets')}</h1>
        <p className="text-gray-600 text-lg">{window.I18n.t('allTicketsInOne')}</p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16">
          <div className="icon-credit-card text-6xl text-gray-400 mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">{window.I18n.t('noTickets')}</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">{window.I18n.t('bookEventForTicket')}</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigateToEvents'))}
            className="btn-primary"
          >
            Bläddra bland evenemang
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card text-center">
              <div className="icon-ticket text-2xl text-indigo-600 mb-2"></div>
              <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              <p className="text-gray-600 text-sm">Totalt biljetter</p>
            </div>
            <div className="card text-center">
              <div className="icon-calendar text-2xl text-green-600 mb-2"></div>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(t => new Date(t.eventDate) > new Date()).length}
              </p>
              <p className="text-gray-600 text-sm">Kommande</p>
            </div>
          </div>

          {/* Tickets */}
          <div className="space-y-4">
            {tickets
              .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
              .map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && <QRModal />}
    </div>
  );
}