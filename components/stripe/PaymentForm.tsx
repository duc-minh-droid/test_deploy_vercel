'use client';

import React, { useState, FormEvent } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from '@stripe/react-stripe-js';

interface PaymentFormProps {
  amount: number;
  currency: string;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: string) => void;
  showAddress?: boolean;
  submitButtonText?: string;
  className?: string;
}

export function PaymentForm({
  amount,
  currency,
  onSuccess,
  onError,
  showAddress = true,
  submitButtonText = 'Pay Now',
  className = '',
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred');
        onError?.(error.message || 'An error occurred');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setErrorMessage(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900">
          Payment Amount: {formatAmount(amount, currency)}
        </h3>
      </div>

      <div className="space-y-4">
        <PaymentElement />
        
        {showAddress && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Billing Address
            </h4>
            <AddressElement options={{ mode: 'billing' }} />
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-colors
          ${
            !stripe || isLoading
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          submitButtonText
        )}
      </button>
    </form>
  );
}