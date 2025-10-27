import type Stripe from 'stripe';

// Extend Stripe types with commonly used properties
export interface StripeCustomer extends Stripe.Customer {
  // Add any custom customer properties here
}

export interface StripePaymentIntent extends Stripe.PaymentIntent {
  // Add any custom payment intent properties here
}

export interface StripeSubscription extends Stripe.Subscription {
  // Add any custom subscription properties here
}

// Common payment-related types
export interface PaymentIntentCreateParams {
  amount: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionCreateParams {
  mode: 'payment' | 'subscription';
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
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  allowPromotionCodes?: boolean;
}

// Webhook event types with their data
export interface WebhookEventMap {
  'payment_intent.succeeded': Stripe.PaymentIntent;
  'payment_intent.payment_failed': Stripe.PaymentIntent;
  'checkout.session.completed': Stripe.Checkout.Session;
  'customer.created': Stripe.Customer;
  'customer.updated': Stripe.Customer;
  'customer.subscription.created': Stripe.Subscription;
  'customer.subscription.updated': Stripe.Subscription;
  'customer.subscription.deleted': Stripe.Subscription;
  'invoice.payment_succeeded': Stripe.Invoice;
  'invoice.payment_failed': Stripe.Invoice;
}

// API Response types
export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface CheckoutSessionResponse {
  sessionId?: string;
  url?: string;
}

export interface WebhookResponse {
  received: boolean;
}

// Error types
export interface StripeError {
  error: string;
}

// Component prop types
export interface PaymentFormProps {
  amount: number;
  currency: string;
  onSuccess?: (paymentIntent: Stripe.PaymentIntent) => void;
  onError?: (error: string) => void;
  showAddress?: boolean;
  submitButtonText?: string;
  className?: string;
}

export interface CheckoutButtonProps {
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

export interface StripeProviderProps {
  children: React.ReactNode;
  options?: {
    clientSecret?: string;
    amount?: number;
    currency?: string;
  };
}

// Utility types
export type CurrencyCode = 'usd' | 'eur' | 'gbp' | 'cad' | 'aud';
export type PaymentMethodType = 'card' | 'apple_pay' | 'google_pay' | 'link' | 'us_bank_account';
export type SubscriptionInterval = 'month' | 'year';

// Database types (for future extension)
export interface CustomerData {
  stripeCustomerId: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentData {
  stripePaymentIntentId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
}

export interface SubscriptionData {
  stripeSubscriptionId: string;
  customerId: string;
  priceId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}