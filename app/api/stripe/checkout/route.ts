import { NextRequest, NextResponse } from 'next/server';
import { StripePaymentUtils, StripeCustomerUtils } from '@/lib/stripe-utils';
import { STRIPE_CONFIG, type SupportedCurrency } from '@/lib/stripe';
import { rateLimit, validateOrigin, sanitizeInput, validateAmount, logSecurityEvent } from '@/lib/security';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    // 🔒 Security: Rate limiting
    if (!rateLimit(request, 10, 60000)) { // 10 requests per minute
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { endpoint: '/api/stripe/checkout' }, request);
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        { status: 429 }
      );
    }

    // 🔒 Security: Origin validation (CSRF protection)
    if (!validateOrigin(request)) {
      logSecurityEvent('INVALID_ORIGIN', { 
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer')
      }, request);
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }

    // 🔒 Security: Request size limit
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10240) { // 10KB limit
      logSecurityEvent('REQUEST_TOO_LARGE', { size: contentLength }, request);
      return NextResponse.json(
        { error: 'Request payload too large' },
        { status: 413 }
      );
    }

    const rawBody = await request.json();
    const body = sanitizeInput(rawBody);
    
    const {
      mode = 'payment', // 'payment' or 'subscription'
      items,
      customerEmail,
      customerName,
      successUrl,
      cancelUrl,
      metadata = {},
      allowPromotionCodes = true,
    } = body;

    // 🔒 Security: Enhanced validation
    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 100) {
      logSecurityEvent('INVALID_ITEMS', { itemsCount: items?.length }, request);
      return NextResponse.json(
        { error: 'Invalid items array' },
        { status: 400 }
      );
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Success URL and Cancel URL are required' },
        { status: 400 }
      );
    }

    // 🔒 Security: Validate URLs
    try {
      new URL(successUrl);
      new URL(cancelUrl);
    } catch {
      logSecurityEvent('INVALID_URLS', { successUrl, cancelUrl }, request);
      return NextResponse.json(
        { error: 'Invalid success or cancel URL' },
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

    // Create or retrieve customer if email is provided
    let customerId: string | undefined;
    if (customerEmail) {
      const customer = await StripeCustomerUtils.createOrRetrieveCustomer({
        email: customerEmail,
        name: customerName,
        metadata: {
          source: 'checkout_api',
          ...metadata,
        },
      });
      customerId = customer.id;
    }

    // For one-time payments
    if (mode === 'payment') {
      // 🔒 Security: Validate all items
      for (const item of items) {
        if (!item.name || typeof item.name !== 'string' || item.name.length > 200) {
          logSecurityEvent('INVALID_ITEM_NAME', { item }, request);
          return NextResponse.json(
            { error: 'Invalid item name' },
            { status: 400 }
          );
        }

        if (!validateAmount(item.amount, item.currency)) {
          logSecurityEvent('INVALID_AMOUNT', { 
            amount: item.amount, 
            currency: item.currency 
          }, request);
          return NextResponse.json(
            { error: 'Invalid amount or currency' },
            { status: 400 }
          );
        }

        if (!STRIPE_CONFIG.SUPPORTED_CURRENCIES.includes(item.currency as any)) {
          logSecurityEvent('UNSUPPORTED_CURRENCY', { currency: item.currency }, request);
          return NextResponse.json(
            { error: `Currency ${item.currency} is not supported` },
            { status: 400 }
          );
        }

        // 🔒 Security: Validate quantity
        if (item.quantity && (item.quantity < 1 || item.quantity > 999 || !Number.isInteger(item.quantity))) {
          logSecurityEvent('INVALID_QUANTITY', { quantity: item.quantity }, request);
          return NextResponse.json(
            { error: 'Invalid quantity' },
            { status: 400 }
          );
        }
      }

      const item = items[0]; // For simplicity, handle single item

      const session = await StripePaymentUtils.createCheckoutSession({
        priceData: {
          currency: item.currency as SupportedCurrency,
          productData: {
            name: item.name,
            description: item.description,
            images: item.images,
          },
          unitAmount: item.amount,
        },
        quantity: item.quantity || 1,
        successUrl,
        cancelUrl,
        customerId,
        customerEmail: customerId ? undefined : customerEmail,
        metadata,
        allowPromotionCodes,
      });

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
      });
    }

    // For subscription mode, you would handle subscription logic here
    return NextResponse.json(
      { error: 'Subscription mode not implemented yet' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Checkout session creation error:', error);
    
    // More detailed error reporting
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error && 'type' in error 
      ? { type: (error as any).type, code: (error as any).code }
      : {};
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: errorMessage,
        ...errorDetails
      },
      { status: 500 }
    );
  }
}