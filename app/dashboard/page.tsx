'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  User, 
  CreditCard, 
  Download, 
  Settings, 
  BarChart3, 
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const user = {
    name: "Alex Johnson",
    email: "alex@example.com",
    plan: "Pro Plan",
    status: "Active",
    joinDate: "Oct 2025"
  };

  const stats = [
    {
      title: "API Requests",
      value: "2,847",
      limit: "10,000",
      icon: BarChart3,
      color: "text-blue-500"
    },
    {
      title: "Storage Used",
      value: "1.2 GB",
      limit: "5 GB",
      icon: FileText,
      color: "text-green-500"
    },
    {
      title: "Days Left",
      value: "23",
      limit: "30",
      icon: Calendar,
      color: "text-purple-500"
    }
  ];

  const recentActivity = [
    {
      action: "API Key Generated",
      time: "2 hours ago",
      status: "success"
    },
    {
      action: "Payment Processed",
      time: "1 day ago",
      status: "success"
    },
    {
      action: "Profile Updated",
      time: "3 days ago",
      status: "info"
    }
  ];

  const quickActions = [
    {
      title: "API Documentation",
      description: "View integration guides",
      icon: FileText,
      href: "/docs",
      external: true
    },
    {
      title: "Download SDK",
      description: "Get our development tools",
      icon: Download,
      href: "/downloads"
    },
    {
      title: "Account Settings",
      description: "Manage your account",
      icon: Settings,
      href: "/settings"
    },
    {
      title: "Billing & Usage",
      description: "View billing details",
      icon: CreditCard,
      href: "/billing"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">StripeKit</h1>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Welcome back, {user.name.split(' ')[0]}
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Welcome Section */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* User Info */}
            <Card className="lg:w-1/3">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <Badge>{user.plan}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">{user.status}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member since</span>
                  <span className="text-sm">{user.joinDate}</span>
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="lg:w-2/3 grid sm:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <span className="text-xs text-muted-foreground">
                        / {stat.limit}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-3">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: '35%' }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <div key={index} className="group cursor-pointer">
                        <Card className="hover:shadow-md transition-all border-dashed hover:border-solid">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <action.icon className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-sm">{action.title}</h3>
                                  {action.external && <ArrowUpRight className="w-3 h-3 text-muted-foreground" />}
                                </div>
                                <p className="text-xs text-muted-foreground">{action.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 pb-3 border-b last:border-0">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Getting Started */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0">
            <CardHeader>
              <CardTitle>🚀 Ready to get started?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Follow these simple steps to integrate StripeKit into your application.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="sm" asChild>
                  <Link href="/docs/quickstart">
                    Quick Start Guide
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/examples">
                    View Examples
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="mailto:support@stripekit.com">
                    Get Help
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}