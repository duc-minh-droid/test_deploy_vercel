 'use client';

import { useState } from 'react';
import { CheckoutButton } from '@/components/stripe/CheckoutButton';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Shield, Sparkles, CreditCard } from 'lucide-react';

export default function Home() {

  const products = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      description: 'Perfect for getting started',
      features: ['Basic features', 'Email support', 'Up to 1,000 requests'],
      popular: false,
      items: [{
        name: 'Starter Plan',
        description: 'Basic features for getting started',
        amount: 2900,
        currency: 'usd',
        quantity: 1,
      }]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      description: 'For growing businesses',
      features: ['All starter features', 'Priority support', 'Up to 10,000 requests', 'Advanced analytics'],
      popular: true,
      items: [{
        name: 'Pro Plan',
        description: 'Advanced features for growing businesses',
        amount: 9900,
        currency: 'usd',
        quantity: 1,
      }]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      description: 'For large organizations',
      features: ['All pro features', 'Dedicated support', 'Unlimited requests', 'Custom integrations'],
      popular: false,
      items: [{
        name: 'Enterprise Plan',
        description: 'Full-featured plan for enterprises',
        amount: 29900,
        currency: 'usd',
        quantity: 1,
      }]
    }
  ];

  const subscriptions = [
    {
      id: 'monthly',
      name: 'Monthly Pro',
      price: 19,
      period: 'month',
      description: 'Billed monthly',
      items: [{
        name: 'Monthly Pro Subscription',
        description: 'Pro features billed monthly',
        amount: 1900,
        currency: 'usd',
        quantity: 1,
      }]
    },
    {
      id: 'yearly',
      name: 'Yearly Pro',
      price: 190,
      period: 'year',
      description: 'Save 16% with yearly billing',
      savings: '2 months free',
      items: [{
        name: 'Yearly Pro Subscription',
        description: 'Pro features billed yearly (2 months free)',
        amount: 19000,
        currency: 'usd',
        quantity: 1,
      }]
    }
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Powered by Stripe
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Simple. Secure. Payments.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Accept payments effortlessly with our modern, developer-friendly platform.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              PCI Compliant
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Instant Setup
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Global Cards
            </div>
          </div>
        </div>
      </section>

      {/* One-time Products */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">One-time Purchase</h2>
            <p className="text-muted-foreground">Choose the plan that fits your needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className={`relative ${product.popular ? 'border-primary' : ''}`}>
                {product.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${product.price}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <CheckoutButton
                    items={product.items}
                    buttonText={`Get ${product.name}`}
                    className="w-full"
                    onError={(error) => console.error('Checkout error:', error)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subscriptions */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Subscription Plans</h2>
            <p className="text-muted-foreground">Recurring payments made simple</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {subscriptions.map((sub) => (
              <Card key={sub.id} className={sub.savings ? 'border-primary' : ''}>
                <CardHeader className="text-center">
                  {sub.savings && (
                    <Badge className="mb-2 w-fit mx-auto">
                      {sub.savings}
                    </Badge>
                  )}
                  <CardTitle className="text-2xl">{sub.name}</CardTitle>
                  <CardDescription>{sub.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${sub.price}</span>
                    <span className="text-muted-foreground">/{sub.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CheckoutButton
                    items={sub.items}
                    buttonText={`Subscribe ${sub.period}ly`}
                    className="w-full"
                    onError={(error) => console.error('Subscription error:', error)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Section (replaces Custom Payment) */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Support Our Work</h2>
          <p className="text-muted-foreground mb-6">
            Donations help keep this project maintained and improved.
          </p>

          {/* Preset donation amounts + custom amount */}
          <DonationForm />
        </div>
      </section>

      
    </div>
  );
}

function DonationForm() {
  const [custom, setCustom] = useState<string>('');
  const presets = [500, 1500, 5000]; // $5, $15, $50

  const parseAmount = (val: string | number) => {
    if (typeof val === 'number') return val;
    const n = Number(val.replace(/[^0-9\.]/g, ''));
    if (isNaN(n) || n <= 0) return 0;
    return Math.round(n * 100);
  };

  const customAmount = parseAmount(custom);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 justify-center">
        {presets.map((p) => (
          <CheckoutButton
            key={p}
            items={[{ name: 'Donation', description: 'Thanks for your support', amount: p, currency: 'usd', quantity: 1 }]}
            buttonText={`$${(p/100).toFixed(2)}`}
            className="px-4 py-2"
            onError={(e) => console.error('Donation error:', e)}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        <input
          aria-label="Custom donation amount"
          placeholder="Custom amount (e.g. 12.50)"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="w-40 px-3 py-2 rounded-lg border bg-transparent text-sm"
        />
        <CheckoutButton
          items={[{ name: 'Donation', description: 'Custom donation', amount: customAmount, currency: 'usd', quantity: 1 }]}
          buttonText={customAmount > 0 ? `Donate $${(customAmount/100).toFixed(2)}` : 'Donate'}
          className="px-4 py-2"
          onError={(e) => console.error('Donation error:', e)}
        />
      </div>
      <p className="text-xs text-muted-foreground">All donations are securely processed by Stripe.</p>
    </div>
  );
}
