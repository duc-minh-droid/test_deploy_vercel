'use client';

import React, { useState } from 'react';
import { getStripe } from '@/lib/stripe-client';
import { Button } from '@/components/ui/button';

interface CheckoutButtonProps {
  items: Array<{
    name: string;
    description?: string;
    amount: number;
    currency: string;
    quantity?: number;
    images?: string[];
  }>;
  customerEmail?: string;
  customerName?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
  allowPromotionCodes?: boolean;
  buttonText?: string;
  className?: string;
  onError?: (error: string) => void;
}

export function CheckoutButton({
  items,
  customerEmail,
  customerName,
  successUrl,
  cancelUrl,
  metadata = {},
  allowPromotionCodes = true,
  buttonText = 'Checkout',
  className = '',
  onError,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // 🔒 Security: Client-side validation
  const validateItems = (items: CheckoutButtonProps['items']): boolean => {
    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 100) {
      return false;
    }

    return items.every(item => {
      // Validate required fields
      if (!item.name || typeof item.name !== 'string' || item.name.length > 200) {
        return false;
      }

      // Validate amount (client-side protection against tampering)
      if (typeof item.amount !== 'number' || item.amount < 50 || item.amount > 99999999) {
        return false;
      }

      // Validate currency
      if (!item.currency || typeof item.currency !== 'string' || item.currency.length !== 3) {
        return false;
      }

      // Validate quantity if provided
      if (item.quantity !== undefined && (item.quantity < 1 || item.quantity > 999 || !Number.isInteger(item.quantity))) {
        return false;
      }

      return true;
    });
  };

  const handleCheckout = async () => {
    // 🔒 Security: Validate items before processing
    if (!validateItems(items)) {
      const errorMsg = 'Invalid checkout items';
      const errorDetails = {
        itemCount: items?.length || 0,
        hasItems: Array.isArray(items),
        timestamp: new Date().toISOString()
      };
      console.error('Client-side validation failed:', errorDetails);
      onError?.(errorMsg);
      return;
    }

    // 🔒 Security: Prevent double submissions
    if (isLoading) return;

    setIsLoading(true);

    try {
      // 🔒 Security: Validate URLs
      let defaultSuccessUrl: string;
      let defaultCancelUrl: string;
      
      try {
        defaultSuccessUrl = successUrl || `${window.location.origin}/success`;
        defaultCancelUrl = cancelUrl || `${window.location.origin}/cancel`;
        
        // Validate URLs are from same origin (prevent redirect attacks)
        const successUrlObj = new URL(defaultSuccessUrl);
        const cancelUrlObj = new URL(defaultCancelUrl);
        const currentOrigin = window.location.origin;
        
        if (successUrlObj.origin !== currentOrigin || cancelUrlObj.origin !== currentOrigin) {
          throw new Error('URLs must be from the same origin');
        }
      } catch (urlError) {
        throw new Error('Invalid success or cancel URL');
      }

      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'payment',
          items,
          customerEmail,
          customerName,
          successUrl: defaultSuccessUrl,
          cancelUrl: defaultCancelUrl,
          metadata,
          allowPromotionCodes,
        }),
      });

      // Safely handle responses (some errors may return HTML pages)
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        // Try to parse JSON error first, otherwise fall back to text
        if (contentType.includes('application/json')) {
          const errorBody = await response.json().catch((e) => {
            console.error('Failed to parse JSON error body:', e);
            return null;
          });
          const errMsg = errorBody?.error || errorBody?.message || JSON.stringify(errorBody) || 'Failed to create checkout session';
          throw new Error(errMsg);
        } else {
          // Non-JSON response (often HTML error page) - log full text for debugging
          const text = await response.text().catch((e) => `Failed to read response text: ${e}`);
          console.error('Non-JSON response from /api/stripe/checkout:', text);
          throw new Error('Failed to create checkout session (non-JSON response)');
        }
      }

      // Successful response - prefer JSON, but be defensive
      let url: string | undefined;
      if (contentType.includes('application/json')) {
        const json = await response.json().catch((e) => {
          console.error('Failed to parse JSON success body:', e);
          return null;
        });
        url = json?.url;
      } else {
        // Unexpected content-type on success - read text and log
        const text = await response.text().catch(() => '');
        console.warn('Unexpected non-JSON success response from /api/stripe/checkout:', text);
        // Try to extract URL from text if present (rare)
        const match = text.match(/https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+/);
        url = match ? match[0] : undefined;
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      onError?.(message);
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.amount * (item.quantity || 1),
    0
  );

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          Processing...
        </div>
      ) : (
        `${buttonText} - ${formatAmount(totalAmount, items[0]?.currency || 'usd')}`
      )}
    </Button>
  );
}