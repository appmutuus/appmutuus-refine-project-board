import { useEffect, useState } from 'react';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';

interface JobPaymentFormProps {
  jobId: string;
  applicantId: string;
}

const InnerForm = ({ jobId, applicantId }: JobPaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/payment/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, applicant_id: applicantId }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch(() => setError('Unable to create payment'));
  }, [jobId, applicantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    const card = elements.getElement(CardElement);
    if (!card) return;
    const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });
    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return <p>Payment successful!</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      {error && <p>{error}</p>}
      <button type="submit" disabled={!stripe}>Pay</button>
    </form>
  );
};

export default function JobPaymentForm(props: JobPaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <InnerForm {...props} />
    </Elements>
  );
}
