'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, Download, ArrowRight, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const amount = searchParams.get('amount');
  const productName = searchParams.get('product') || 'Your Purchase';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">StripeKit</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Success Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="flex">
                <Sparkles className="w-6 h-6 text-yellow-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <Sparkles className="w-4 h-4 text-blue-500 animate-bounce" style={{ animationDelay: '200ms' }} />
                <Sparkles className="w-5 h-5 text-purple-500 animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          </div>

          <Badge className="mb-4" variant="secondary">
            Payment Confirmed
          </Badge>

          <h1 className="text-4xl font-bold mb-4">
            Welcome aboard! 🎉
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            Thank you for choosing StripeKit. Your payment has been processed successfully and you're all set to get started.
          </p>

          {/* Order Details */}
          <Card className="mb-8 bg-muted/50">
            <CardHeader>
              <CardTitle className="text-left">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium">{productName}</span>
              </div>
              {amount && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">${(parseInt(amount) / 100).toFixed(2)}</span>
                </div>
              )}
              {sessionId && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-sm">{sessionId.slice(-8)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="default" className="bg-green-500">
                  Completed
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="grid gap-4 mb-8">
            <h2 className="text-2xl font-semibold mb-4">What's Next?</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-dashed hover:border-solid transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <Mail className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold mb-2">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground">
                    Receipt and access details sent to your inbox
                  </p>
                </CardContent>
              </Card>

              <Card className="border-dashed hover:border-solid transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <Download className="w-8 h-8 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold mb-2">Download Resources</h3>
                  <p className="text-sm text-muted-foreground">
                    Access your files and documentation
                  </p>
                </CardContent>
              </Card>

              <Card className="border-dashed hover:border-solid transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <ArrowRight className="w-8 h-8 mx-auto mb-3 text-purple-500" />
                  <h3 className="font-semibold mb-2">Get Started</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow our quick setup guide
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" asChild>
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Support */}
          <div className="mt-12 p-6 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">Need Help Getting Started?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our support team is here to help you every step of the way.
            </p>
            <Button variant="ghost" size="sm" asChild>
              <Link href="mailto:support@stripekit.com">
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}