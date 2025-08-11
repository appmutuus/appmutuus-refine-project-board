import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';

interface CheckoutFormProps {
  amount: number; // amount in cents
  onSuccess?: () => void;
}

const CheckoutForm = ({ amount, onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || !amount) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const { clientSecret } = await response.json();
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });
      if (result.error) {
        setError(result.error.message || 'Zahlung fehlgeschlagen');
      } else if (result.paymentIntent?.status === 'succeeded') {
        onSuccess?.();
      }
    } catch (err: any) {
      setError('Zahlung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="p-2 bg-gray-700 rounded" />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading || amount <= 0}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Verarbeite...' : 'Bezahlen'}
      </button>
    </form>
  );
};

export default CheckoutForm;
