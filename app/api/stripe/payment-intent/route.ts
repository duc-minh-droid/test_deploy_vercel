import { NextRequest, NextResponse } from 'next/server';
import { StripePaymentUtils, StripeCustomerUtils } from '@/lib/stripe-utils';
import { STRIPE_CONFIG, type SupportedCurrency } from '@/lib/stripe';
import { rateLimit, validateOrigin, sanitizeInput, validateAmount, logSecurityEvent } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // 🔒 Security: Rate limiting (more restrictive for payment intents)
    if (!rateLimit(request, 5, 60000)) { // 5 requests per minute
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { endpoint: '/api/stripe/payment-intent' }, request);
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        { status: 429 }
      );
    }

    // 🔒 Security: Origin validation
    if (!validateOrigin(request)) {
      logSecurityEvent('INVALID_ORIGIN', { 
        endpoint: '/api/stripe/payment-intent',
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer')
      }, request);
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }

    const rawBody = await request.json();
    const body = sanitizeInput(rawBody);
    const {
      amount,
      currency = STRIPE_CONFIG.DEFAULT_CURRENCY,
      customerEmail,
      customerName,
      description,
      metadata = {},
    } = body;

    // 🔒 Security: Enhanced validation
    if (!validateAmount(amount, currency)) {
      logSecurityEvent('INVALID_PAYMENT_AMOUNT', { amount, currency }, request);
      return NextResponse.json(
        { error: 'Invalid amount or currency' },
        { status: 400 }
      );
    }

    if (!STRIPE_CONFIG.SUPPORTED_CURRENCIES.includes(currency)) {
      logSecurityEvent('UNSUPPORTED_CURRENCY', { currency }, request);
      return NextResponse.json(
        { error: `Currency ${currency} is not supported` },
        { status: 400 }
      );
    }

    // 🔒 Security: Validate email format if provided
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      logSecurityEvent('INVALID_EMAIL', { email: customerEmail }, request);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 🔒 Security: Validate description length
    if (description && description.length > 1000) {
      logSecurityEvent('DESCRIPTION_TOO_LONG', { length: description.length }, request);
      return NextResponse.json(
        { error: 'Description too long' },
        { status: 400 }
      );
    }

    // Create or retrieve customer if email is provided
    let customerId: string | undefined;
    if (customerEmail) {
      const customer = await StripeCustomerUtils.createOrRetrieveCustomer({
        email: customerEmail,
        name: customerName,
        metadata: {
          source: 'payment_intent_api',
          ...metadata,
        },
      });
      customerId = customer.id;
    }

    // Create payment intent
    const paymentIntent = await StripePaymentUtils.createPaymentIntent({
      amount,
      currency: currency as SupportedCurrency,
      customerId,
      description,
      metadata: {
        source: 'api',
        ...metadata,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // If it's a Stripe error, log the specific details
    if (error && typeof error === 'object' && 'type' in error) {
      console.error('Stripe error details:', error);
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}