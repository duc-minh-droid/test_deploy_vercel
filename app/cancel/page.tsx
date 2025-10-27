'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XCircle, ArrowLeft, MessageCircle, CreditCard, HelpCircle, RefreshCw } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Suspense } from 'react';

function CancelContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const productName = searchParams.get('product') || 'your purchase';

  const helpOptions = [
    {
      icon: CreditCard,
      title: 'Payment Issues',
      description: 'Having trouble with your payment method?',
      action: 'Try Different Card',
      href: '/?retry=payment'
    },
    {
      icon: HelpCircle,
      title: 'Have Questions',
      description: 'Need help choosing the right plan?',
      action: 'Chat with Us',
      href: 'mailto:support@stripekit.com'
    },
    {
      icon: RefreshCw,
      title: 'Technical Issues',
      description: 'Experiencing technical difficulties?',
      action: 'Report Issue',
      href: 'mailto:support@stripekit.com?subject=Technical Issue'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">StripeKit</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Cancel Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-orange-500" />
          </div>

          <Badge className="mb-4" variant="secondary">
            Payment Cancelled
          </Badge>

          <h1 className="text-4xl font-bold mb-4">
            No worries, we're here to help
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            Your payment for {productName} was cancelled. No charges were made to your account. 
            Let's see how we can assist you.
          </p>

          {/* Reason Display */}
          {reason && (
            <Card className="mb-8 bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cancellation Reason</span>
                  <span className="font-medium capitalize">{reason.replace('_', ' ')}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Options */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">How can we help?</h2>
            
            <div className="grid gap-4">
              {helpOptions.map((option, index) => (
                <Card key={index} className="group hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <option.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold mb-1">{option.title}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={option.href}>
                          {option.action}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Again
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" asChild>
              <Link href="mailto:support@stripekit.com">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>

          {/* Alternative Offers */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0">
            <CardHeader>
              <CardTitle className="text-center">Still Interested?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We'd love to have you join our community. Here are some other ways to get started:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/?plan=starter">
                    Try Starter Plan
                  </Link>
                </Button>
                
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/demo">
                    Watch Demo
                  </Link>
                </Button>
                
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/pricing">
                    View All Plans
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer Message */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Have feedback about this experience? We'd love to hear from you.
            </p>
            <Button variant="link" size="sm" asChild>
              <Link href="mailto:feedback@stripekit.com">
                Share Feedback
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <CancelContent />
    </Suspense>
  );
}