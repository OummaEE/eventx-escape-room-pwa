function PaymentModal({ amount, description, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = React.useState('apple-pay');
  const [loading, setLoading] = React.useState(false);
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiryDate, setExpiryDate] = React.useState('');
  const [cvv, setCvv] = React.useState('');

  const handlePayment = async () => {
    setLoading(true);
    try {
      const success = await PaymentManager.processPayment({
        amount: amount * 100, // Convert to kopecks
        currency: 'RUB',
        description
      });

      if (success) {
        onSuccess();
        onClose();
      } else {
        alert('Ошибка оплаты. Попробуйте снова.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Ошибка оплаты. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
           data-name="payment-modal" data-file="components/PaymentModal.js">
        <div className="card max-w-md w-full slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Оплата</h2>
            <button onClick={onClose} className="p-2">
              <div className="icon-x text-2xl text-[var(--text-secondary)]"></div>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-lg font-semibold">{description}</p>
            <p className="text-2xl font-bold text-[var(--primary-color)]">{amount}₽</p>
          </div>

          <div className="space-y-4">
            {PaymentManager.canUseApplePay() && (
              <button
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 ${
                  paymentMethod === 'apple-pay' 
                    ? 'border-[var(--primary-color)] bg-[var(--primary-color)] bg-opacity-10' 
                    : 'border-[var(--border-color)]'
                }`}
                onClick={() => setPaymentMethod('apple-pay')}
              >
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                  <div className="icon-smartphone text-white text-sm"></div>
                </div>
                <span className="font-medium">Apple Pay</span>
              </button>
            )}

            <button
              className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 ${
                paymentMethod === 'card' 
                  ? 'border-[var(--primary-color)] bg-[var(--primary-color)] bg-opacity-10' 
                  : 'border-[var(--border-color)]'
              }`}
              onClick={() => setPaymentMethod('card')}
            >
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <div className="icon-credit-card text-white text-sm"></div>
              </div>
              <span className="font-medium">Банковская карта</span>
            </button>
          </div>

          {paymentMethod === 'card' && (
            <div className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Номер карты"
                className="input-field"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="ММ/ГГ"
                  className="input-field flex-1"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className="input-field flex-1"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <button onClick={onClose} className="btn-secondary flex-1">
              Отмена
            </button>
            <button 
              onClick={handlePayment} 
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Обработка...' : 'Оплатить'}
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('PaymentModal component error:', error);
    return null;
  }
}