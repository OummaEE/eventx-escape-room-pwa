function PaymentModal({ isOpen, onClose, event, ticketCount, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = React.useState('apple-pay');
  const [cardData, setCardData] = React.useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState('');

  const totalAmount = event.price * ticketCount;
  const isApplePayAvailable = window.ApplePaySession && ApplePaySession.canMakePayments();

  const handleApplePay = async () => {
    if (!isApplePayAvailable) {
      setError('Apple Pay is not available on this device');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const paymentRequest = {
        countryCode: 'SE',
        currencyCode: 'SEK',
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: `${event.title} - ${ticketCount} biljetter`,
          amount: totalAmount.toString()
        }
      };

      const session = new ApplePaySession(3, paymentRequest);

      session.onvalidatemerchant = async (event) => {
        // In a real app, validate with your server
        const merchantSession = await fetch('/validate-merchant', {
          method: 'POST',
          body: JSON.stringify({ validationURL: event.validationURL })
        }).then(res => res.json());
        
        session.completeMerchantValidation(merchantSession);
      };

      session.onpaymentauthorized = async (event) => {
        // Process payment with your payment processor
        const result = await processPayment(event.payment);
        
        if (result.success) {
          session.completePayment(ApplePaySession.STATUS_SUCCESS);
          handlePaymentSuccess(result.transactionId);
        } else {
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          setError('Payment failed. Please try again.');
        }
      };

      session.begin();
    } catch (error) {
      console.error('Apple Pay error:', error);
      setError('Apple Pay payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
      setError('Please fill in all card details');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Simulate card payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, use Stripe or similar
      const result = await processCardPayment({
        amount: totalAmount,
        currency: 'sek',
        card: cardData,
        description: `${event.title} - ${ticketCount} tickets`
      });

      if (result.success) {
        handlePaymentSuccess(result.transactionId);
      } else {
        setError(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Card payment error:', error);
      setError('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const processPayment = async (paymentData) => {
    // Mock payment processing - replace with real payment processor
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: Math.random() > 0.1, // 90% success rate for demo
          transactionId: 'txn_' + Date.now()
        });
      }, 1500);
    });
  };

  const processCardPayment = async (paymentData) => {
    // Mock card payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: Math.random() > 0.1,
          transactionId: 'card_' + Date.now(),
          error: Math.random() > 0.9 ? 'Card declined' : null
        });
      }, 2000);
    });
  };

  const handlePaymentSuccess = (transactionId) => {
    const ticket = {
      id: 'ticket_' + Date.now(),
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      ticketCount: ticketCount,
      totalAmount: totalAmount,
      transactionId: transactionId,
      purchaseDate: new Date().toISOString(),
      status: 'confirmed'
    };

    onPaymentSuccess(ticket);
    onClose();

    // Show success notification
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: { 
        message: window.I18n.t('paymentSuccessful'), 
        type: 'success' 
      }
    }));
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{window.I18n.t('payment')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <div className="icon-x text-xl"></div>
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Ordersammanfattning</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{event.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{ticketCount} × {event.price} SEK</span>
              <span className="font-semibold">{totalAmount} SEK</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>{window.I18n.t('total')}</span>
              <span>{totalAmount} SEK</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Payment Methods */}
        <div className="space-y-4 mb-6">
          {isApplePayAvailable && (
            <div>
              <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="apple-pay"
                  checked={paymentMethod === 'apple-pay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-indigo-600"
                />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Pay</span>
                  </div>
                  <span className="font-medium">{window.I18n.t('applePay')}</span>
                </div>
              </label>
            </div>
          )}

          <div>
            <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-indigo-600"
              />
              <div className="flex items-center gap-3">
                <div className="icon-credit-card text-xl text-gray-600"></div>
                <span className="font-medium">{window.I18n.t('bankCard')}</span>
              </div>
            </label>
          </div>
        </div>

        {/* Card Form */}
        {paymentMethod === 'card' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {window.I18n.t('cardNumber')}
              </label>
              <input
                type="text"
                value={cardData.number}
                onChange={(e) => setCardData({
                  ...cardData,
                  number: formatCardNumber(e.target.value)
                })}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {window.I18n.t('expiryDate')}
                </label>
                <input
                  type="text"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({
                    ...cardData,
                    expiry: formatExpiry(e.target.value)
                  })}
                  placeholder="MM/ÅÅ"
                  maxLength="5"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {window.I18n.t('cvv')}
                </label>
                <input
                  type="text"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({
                    ...cardData,
                    cvv: e.target.value.replace(/\D/g, '')
                  })}
                  placeholder="123"
                  maxLength="4"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kortinnehavarens namn
              </label>
              <input
                type="text"
                value={cardData.name}
                onChange={(e) => setCardData({
                  ...cardData,
                  name: e.target.value
                })}
                placeholder="John Doe"
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* Payment Button */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
            disabled={processing}
          >
            {window.I18n.t('cancel')}
          </button>
          <button
            onClick={paymentMethod === 'apple-pay' ? handleApplePay : handleCardPayment}
            disabled={processing}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>{window.I18n.t('processing')}</span>
              </>
            ) : (
              <>
                <span>{window.I18n.t('pay')} {totalAmount} SEK</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}