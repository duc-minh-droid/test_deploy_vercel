import Stripe from 'stripe';
import { env } from './env';

// Server-side Stripe instance with security configuration
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
  // Security: Enable request timeout
  timeout: 30000, // 30 seconds
  // Security: Set maximum retries
  maxNetworkRetries: 3,
  // Security: Enable telemetry for monitoring
  telemetry: env.IS_PRODUCTION,
});

// Stripe configuration constants
export const STRIPE_CONFIG = {
  // Currency configuration
  DEFAULT_CURRENCY: 'usd' as const,
  
  // Supported currencies for international support
  SUPPORTED_CURRENCIES: ['usd', 'eur', 'gbp', 'cad', 'aud'] as const,
  
  // Payment method types
  PAYMENT_METHODS: [
    'card',
    'apple_pay',
    'google_pay',
    'link',
    'us_bank_account',
  ] as const,
  
  // Subscription intervals
  INTERVALS: ['month', 'year'] as const,
  
  // Webhook events we handle
  WEBHOOK_EVENTS: [
    'checkout.session.completed',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'customer.created',
    'customer.updated',
  ] as const,
} as const;

// Type definitions for better TypeScript support
export type SupportedCurrency = typeof STRIPE_CONFIG.SUPPORTED_CURRENCIES[number];
export type PaymentMethod = typeof STRIPE_CONFIG.PAYMENT_METHODS[number];
export type SubscriptionInterval = typeof STRIPE_CONFIG.INTERVALS[number];
export type WebhookEvent = typeof STRIPE_CONFIG.WEBHOOK_EVENTS[number];

// Helper function to format currency amounts
export function formatCurrency(amount: number, currency: string = STRIPE_CONFIG.DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100); // Stripe amounts are in cents
}

// Helper function to get currency symbol
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    usd: '$',
    eur: '€',
    gbp: '£',
    cad: 'C$',
    aud: 'A$',
  };
  return symbols[currency.toLowerCase()] || currency.toUpperCase();
}