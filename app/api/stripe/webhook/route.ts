import { NextRequest, NextResponse } from 'next/server';
import { StripeWebhookUtils } from '@/lib/stripe-utils';
import { logSecurityEvent } from '@/lib/security';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // 🔒 Security: Webhook payload size limit (1MB for Stripe webhooks)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1048576) {
      logSecurityEvent('WEBHOOK_PAYLOAD_TOO_LARGE', { size: contentLength }, request);
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      logSecurityEvent('MISSING_WEBHOOK_SIGNATURE', {}, request);
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // 🔒 Security: Validate request is from Stripe's IP ranges (optional but recommended)
    const userAgent = request.headers.get('user-agent');
    if (!userAgent?.includes('Stripe')) {
      logSecurityEvent('SUSPICIOUS_WEBHOOK_USER_AGENT', { userAgent }, request);
      // Don't block, but log for monitoring
    }

    // 🔒 Security: Verify webhook signature (critical security check)
    let event: Stripe.Event;
    try {
      event = StripeWebhookUtils.verifyWebhook(body, signature);
      logSecurityEvent('WEBHOOK_VERIFIED', { eventType: event.type, eventId: event.id }, request);
    } catch (error) {
      logSecurityEvent('WEBHOOK_VERIFICATION_FAILED', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        signatureProvided: !!signature
      }, request);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Handle different webhook events
    await StripeWebhookUtils.handleWebhookEvent(event, {
      // Payment events
      'payment_intent.succeeded': async (paymentIntent: Stripe.PaymentIntent) => {
        console.log('💰 Payment succeeded:', paymentIntent.id);
        // Add your business logic here
        // e.g., update database, send confirmation email, etc.
      },

      'payment_intent.payment_failed': async (paymentIntent: Stripe.PaymentIntent) => {
        console.log('❌ Payment failed:', paymentIntent.id);
        // Add your business logic here
        // e.g., notify customer, log failure, etc.
      },

      // Checkout events
      'checkout.session.completed': async (session: Stripe.Checkout.Session) => {
        console.log('✅ Checkout completed:', session.id);
        
        if (session.mode === 'payment') {
          // Handle one-time payment
          console.log('One-time payment completed');
        } else if (session.mode === 'subscription') {
          // Handle subscription
          console.log('Subscription created');
        }
        
        // Add your business logic here
        // e.g., fulfill order, provision access, etc.
      },

      // Customer events
      'customer.created': async (customer: Stripe.Customer) => {
        console.log('👤 Customer created:', customer.id);
        // Add your business logic here
        // e.g., sync with your user database
      },

      'customer.updated': async (customer: Stripe.Customer) => {
        console.log('👤 Customer updated:', customer.id);
        // Add your business logic here
      },

      // Subscription events
      'customer.subscription.created': async (subscription: Stripe.Subscription) => {
        console.log('🔄 Subscription created:', subscription.id);
        // Add your business logic here
        // e.g., provision access, send welcome email
      },

      'customer.subscription.updated': async (subscription: Stripe.Subscription) => {
        console.log('🔄 Subscription updated:', subscription.id);
        // Add your business logic here
        // e.g., update access level, handle plan changes
      },

      'customer.subscription.deleted': async (subscription: Stripe.Subscription) => {
        console.log('🔄 Subscription cancelled:', subscription.id);
        // Add your business logic here
        // e.g., revoke access, send goodbye email
      },

      // Invoice events
      'invoice.payment_succeeded': async (invoice: Stripe.Invoice) => {
        console.log('📄 Invoice payment succeeded:', invoice.id);
        // Add your business logic here
        // e.g., send receipt, update billing status
      },

      'invoice.payment_failed': async (invoice: Stripe.Invoice) => {
        console.log('📄 Invoice payment failed:', invoice.id);
        // Add your business logic here
        // e.g., retry payment, notify customer
      },
    });

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}