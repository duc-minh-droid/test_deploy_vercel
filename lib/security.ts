/**
 * Security utilities for API protection
 */

import { NextRequest } from 'next/server';
import { env } from './env';

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiting (use external service in production)
 */
export function rateLimit(request: NextRequest, maxRequests = 10, windowMs = 60000): boolean {
  if (!env.IS_PRODUCTION) return true; // Skip in development

  const identifier = getClientIdentifier(request);
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }

  const current = rateLimitStore.get(identifier);
  
  if (!current || current.resetTime < now) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP behind proxies
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  const ip = forwarded?.split(',')[0]?.trim() || realIp || cfConnectingIp || 'unknown';
  
  return `${ip}:${request.nextUrl.pathname}`;
}

/**
 * Validate request origin for CSRF protection
 */
export function validateOrigin(request: NextRequest): boolean {
  if (!env.IS_PRODUCTION) return true; // Skip in development

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  if (!origin && !referer) return false;
  
  const allowedOrigins = [
    env.NEXT_PUBLIC_APP_URL,
    // Add other allowed origins here
  ];
  
  const requestOrigin = origin || new URL(referer!).origin;
  return allowedOrigins.includes(requestOrigin);
}

/**
 * Sanitize and validate input data
 */
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    // Basic XSS protection
    return data
      .replace(/[<>]/g, '') // Remove < and >
      .trim()
      .slice(0, 1000); // Limit length
  }
  
  if (typeof data === 'number') {
    // Validate number ranges
    if (!isFinite(data) || data < 0) return 0;
    return Math.min(data, Number.MAX_SAFE_INTEGER);
  }
  
  if (Array.isArray(data)) {
    return data.slice(0, 100).map(sanitizeInput); // Limit array size
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key.length > 100) continue; // Skip very long keys
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Validate amount for payments (security against manipulation)
 */
export function validateAmount(amount: number, currency: string = 'usd'): boolean {
  // Basic validation
  if (!Number.isInteger(amount) || amount < 50) return false; // Minimum $0.50
  if (amount > 99999999) return false; // Maximum $999,999.99
  
  // Currency-specific validation
  const currencyLimits: Record<string, { min: number; max: number }> = {
    usd: { min: 50, max: 99999999 }, // $0.50 to $999,999.99
    eur: { min: 50, max: 99999999 },
    gbp: { min: 30, max: 99999999 },
    cad: { min: 50, max: 99999999 },
    aud: { min: 50, max: 99999999 },
  };
  
  const limits = currencyLimits[currency.toLowerCase()];
  if (!limits) return false;
  
  return amount >= limits.min && amount <= limits.max;
}

/**
 * Log security events
 */
export function logSecurityEvent(event: string, details: any, request?: NextRequest): void {
  const timestamp = new Date().toISOString();
  const ip = request ? getClientIdentifier(request) : 'unknown';
  
  console.warn(`🚨 SECURITY EVENT [${timestamp}] [${ip}]: ${event}`, details);
  
  // In production, send to monitoring service
  if (env.IS_PRODUCTION) {
    // TODO: Send to your security monitoring service
    // e.g., Datadog, Sentry, CloudWatch, etc.
  }
}