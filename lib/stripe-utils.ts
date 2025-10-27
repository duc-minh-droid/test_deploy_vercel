import { stripe, STRIPE_CONFIG, type SupportedCurrency, type PaymentMethod } from './stripe';
import type Stripe from 'stripe';

// Customer utilities
export class StripeCustomerUtils {
  /**
   * Create or retrieve a customer by email
   */
  static async createOrRetrieveCustomer(params: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    const { email, name, metadata } = params;
    
    // First, try to find existing customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer if none exists
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        ...metadata,
        created_at: new Date().toISOString(),
      },
    });
  }

  /**
   * Update customer information
   */
  static async updateCustomer(
    customerId: string,
    params: Stripe.CustomerUpdateParams
  ): Promise<Stripe.Customer> {
    return await stripe.customers.update(customerId, params);
  }

  /**
   * Delete a customer
   */
  static async deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
    return await stripe.customers.del(customerId);
  }
}

// Payment utilities
export class StripePaymentUtils {
  /**
   * Create a one-time payment intent
   */
  static async createPaymentIntent(params: {
    amount: number;
    currency?: SupportedCurrency;
    customerId?: string;
    metadata?: Record<string, string>;
    description?: string;
    paymentMethods?: PaymentMethod[];
  }): Promise<Stripe.PaymentIntent> {
    const {
      amount,
      currency = STRIPE_CONFIG.DEFAULT_CURRENCY,
      customerId,
      metadata,
      description,
      paymentMethods = STRIPE_CONFIG.PAYMENT_METHODS,
    } = params;

    console.log('Creating payment intent with params:', {
      amount,
      currency,
      customerId,
      description,
      paymentMethods,
    });

    try {
      const paymentIntentData = {
        amount,
        currency,
        customer: customerId,
        description,
        metadata: {
          ...metadata,
          created_at: new Date().toISOString(),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      };

      console.log('Stripe payment intent data:', paymentIntentData);

      return await stripe.paymentIntents.create(paymentIntentData);
    } catch (error) {
      console.error('Error in createPaymentIntent:', error);
      throw error;
    }
  }

  /**
   * Create a Checkout session for one-time payments
   */
  static async createCheckoutSession(params: {
    priceData: {
      currency: SupportedCurrency;
      productData: {
        name: string;
        description?: string;
        images?: string[];
      };
      unitAmount: number;
    };
    quantity?: number;
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
    allowPromotionCodes?: boolean;
  }): Promise<Stripe.Checkout.Session> {
    const {
      priceData,
      quantity = 1,
      successUrl,
      cancelUrl,
      customerId,
      customerEmail,
      metadata,
      allowPromotionCodes = true,
    } = params;

    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: priceData.currency,
            product_data: {
              name: priceData.productData.name,
              description: priceData.productData.description,
              images: priceData.productData.images,
            },
            unit_amount: priceData.unitAmount,
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      metadata,
      allow_promotion_codes: allowPromotionCodes,
    });
  }
}

// Subscription utilities
export class StripeSubscriptionUtils {
  /**
   * Create a subscription product
   */
  static async createProduct(params: {
    name: string;
    description?: string;
    images?: string[];
    metadata?: Record<string, string>;
  }): Promise<Stripe.Product> {
    return await stripe.products.create({
      ...params,
      metadata: {
        ...params.metadata,
        created_at: new Date().toISOString(),
      },
    });
  }

  /**
   * Create a subscription price
   */
  static async createPrice(params: {
    productId: string;
    unitAmount: number;
    currency?: SupportedCurrency;
    interval: 'month' | 'year';
    intervalCount?: number;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Price> {
    const {
      productId,
      unitAmount,
      currency = STRIPE_CONFIG.DEFAULT_CURRENCY,
      interval,
      intervalCount = 1,
      metadata,
    } = params;

    return await stripe.prices.create({
      product: productId,
      unit_amount: unitAmount,
      currency,
      recurring: {
        interval,
        interval_count: intervalCount,
      },
      metadata: {
        ...metadata,
        created_at: new Date().toISOString(),
      },
    });
  }

  /**
   * Create a subscription Checkout session
   */
  static async createSubscriptionCheckout(params: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
    customerEmail?: string;
    trialDays?: number;
    metadata?: Record<string, string>;
    allowPromotionCodes?: boolean;
  }): Promise<Stripe.Checkout.Session> {
    const {
      priceId,
      successUrl,
      cancelUrl,
      customerId,
      customerEmail,
      trialDays,
      metadata,
      allowPromotionCodes = true,
    } = params;

    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      subscription_data: trialDays
        ? {
            trial_period_days: trialDays,
            metadata,
          }
        : { metadata },
      allow_promotion_codes: allowPromotionCodes,
      billing_address_collection: 'required',
    });
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });
  }

  /**
   * Resume a subscription
   */
  static async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }
}

// Webhook utilities
export class StripeWebhookUtils {
  /**
   * Verify webhook signature with enhanced security
   */
  static verifyWebhook(payload: string, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required');
    }

    // 🔒 Security: Additional validation
    if (!payload || !signature) {
      throw new Error('Missing payload or signature');
    }

    if (payload.length > 1048576) { // 1MB limit
      throw new Error('Payload too large');
    }

    if (!signature.startsWith('t=')) {
      throw new Error('Invalid signature format');
    }

    try {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      // Log but don't expose internal details
      console.error('Webhook verification failed:', error);
      throw new Error('Webhook signature verification failed');
    }
  }

  /**
   * Handle webhook events with type safety
   */
  static async handleWebhookEvent(
    event: Stripe.Event,
    handlers: Partial<Record<string, (data: any) => Promise<void> | void>>
  ): Promise<void> {
    const handler = handlers[event.type];
    if (handler) {
      await handler(event.data.object);
    }
  }
}