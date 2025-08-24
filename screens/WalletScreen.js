function WalletScreen({ tickets }) {
  const [selectedTicket, setSelectedTicket] = React.useState(null);

  const handleAddToWallet = async (ticket) => {
    try {
      const success = await WalletManager.addToWallet(ticket);
      if (success) {
        if (window.NotificationManager) {
          window.NotificationManager.showNotification(
            'Билет добавлен в Wallet',
            `Билет "${ticket.title}" сохранён в Apple Wallet`
          );
        }
      } else {
        alert('Не удалось добавить билет в Wallet');
      }
    } catch (error) {
      console.error('Error adding to wallet:', error);
      alert('Ошибка при добавлении в Wallet');
    }
  };

  try {
    return (
      <div className="min-h-screen bg-gray-50" 
           data-name="wallet-screen" data-file="screens/WalletScreen.js">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Мои билеты</h1>
            <p className="text-[var(--text-secondary)]">Все ваши билеты в одном месте</p>
          </div>
        </div>

        {/* Tickets List */}
        <div className="px-6 py-6">
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="icon-wallet text-6xl text-gray-300 mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Нет билетов</h3>
              <p className="text-gray-500">Забронируйте мероприятие, чтобы получить билет</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="card slide-up">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        {ticket.title}
                      </h3>
                      <p className="text-[var(--text-secondary)]">
                        Билет #{ticket.barcode}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="icon-qr-code text-2xl text-gray-600"></div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <div className="icon-calendar text-lg text-[var(--primary-color)]"></div>
                      <span>{ticket.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <div className="icon-map-pin text-lg text-[var(--primary-color)]"></div>
                      <span>{ticket.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      className="btn-secondary flex-1"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      QR-код
                    </button>
                    <button 
                      className="btn-primary flex-1"
                      onClick={() => handleAddToWallet(ticket)}
                    >
                      В Wallet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QR Code Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-sm w-full text-center slide-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">QR-код билета</h2>
                <button onClick={() => setSelectedTicket(null)} className="p-2">
                  <div className="icon-x text-2xl text-[var(--text-secondary)]"></div>
                </button>
              </div>
              
              <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <div className="icon-qr-code text-6xl text-gray-400"></div>
              </div>
              
              <h3 className="font-semibold mb-2">{selectedTicket.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">
                Покажите этот QR-код на входе
              </p>
              
              <button 
                onClick={() => setSelectedTicket(null)}
                className="btn-primary w-full"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('WalletScreen component error:', error);
    return null;
  }
}