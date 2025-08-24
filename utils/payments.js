// Payment Manager for Apple Pay and Stripe integration
window.PaymentManager = {
  stripe: null,

  init() {
    if (window.Stripe) {
      this.stripe = Stripe('pk_test_your_stripe_public_key');
    }
  },

  async processPayment({ amount, currency, description }) {
    try {
      // Try Apple Pay first if available
      if (this.canUseApplePay()) {
        return await this.processApplePay({ amount, currency, description });
      }
      
      // Fallback to Stripe card payment
      return await this.processStripePayment({ amount, currency, description });
    } catch (error) {
      console.error('Payment processing error:', error);
      return false;
    }
  },

  canUseApplePay() {
    return window.ApplePaySession && 
           ApplePaySession.canMakePayments() &&
           ApplePaySession.canMakePaymentsWithActiveCard('merchant.com.eventx');
  },

  async processApplePay({ amount, currency, description }) {
    try {
      const request = {
        countryCode: 'RU',
        currencyCode: currency,
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: description,
          amount: (amount / 100).toFixed(2)
        }
      };

      const session = new ApplePaySession(3, request);
      
      return new Promise((resolve, reject) => {
        session.onvalidatemerchant = async (event) => {
          try {
            // Validate merchant with your server
            const merchantSession = await this.validateMerchant(event.validationURL);
            session.completeMerchantValidation(merchantSession);
          } catch (error) {
            session.abort();
            reject(error);
          }
        };

        session.onpaymentauthorized = async (event) => {
          try {
            // Process payment with your server
            const result = await this.processPaymentToken(event.payment.token);
            
            if (result.success) {
              session.completePayment(ApplePaySession.STATUS_SUCCESS);
              resolve(true);
            } else {
              session.completePayment(ApplePaySession.STATUS_FAILURE);
              reject(new Error('Payment failed'));
            }
          } catch (error) {
            session.completePayment(ApplePaySession.STATUS_FAILURE);
            reject(error);
          }
        };

        session.begin();
      });
    } catch (error) {
      console.error('Apple Pay error:', error);
      return false;
    }
  },

  async processStripePayment({ amount, currency, description }) {
    try {
      if (!this.stripe) {
        this.init();
      }

      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, description })
      });

      const { client_secret } = await response.json();

      // Confirm payment
      const { error } = await this.stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: this.stripe.elements().create('card'),
          billing_details: { name: 'Customer' }
        }
      });

      return !error;
    } catch (error) {
      console.error('Stripe payment error:', error);
      return false;
    }
  },

  async validateMerchant(validationURL) {
    // Mock validation - replace with actual server call
    return { merchantSession: 'mock_session' };
  },

  async processPaymentToken(token) {
    // Mock processing - replace with actual server call
    return { success: true };
  }
};

// Initialize payment manager
PaymentManager.init();