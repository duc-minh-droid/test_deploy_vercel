'use client';

import React, { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe, STRIPE_CLIENT_CONFIG } from '@/lib/stripe-client';

interface StripeProviderProps {
  children: ReactNode;
  options?: {
    clientSecret?: string;
    amount?: number;
    currency?: string;
  };
}

export function StripeProvider({ children, options }: StripeProviderProps) {
  const stripePromise = getStripe();

  const elementsOptions = {
    ...STRIPE_CLIENT_CONFIG.elementsOptions,
    clientSecret: options?.clientSecret,
    amount: options?.amount,
    currency: options?.currency,
    appearance: STRIPE_CLIENT_CONFIG.appearance,
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions as any}>
      {children}
    </Elements>
  );
}