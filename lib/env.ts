/**
 * Environment configuration with strict validation
 * This ensures all required environment variables are present and valid
 */

// Environment variable validation schema
// Note: patterns are intentionally permissive to accommodate real Stripe test keys
const requiredEnvVars = {
  STRIPE_SECRET_KEY: {
    required: true,
    // Accept typical sk_test_/sk_live_ prefixes with at least 8 chars after
    pattern: /^sk_(test|live)_[A-Za-z0-9-_]{8,}$/, 
    description: 'Stripe Secret Key (sk_test_... or sk_live_...)'
  },
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    required: true,
    pattern: /^pk_(test|live)_[A-Za-z0-9-_]{8,}$/, 
    description: 'Stripe Publishable Key (pk_test_... or pk_live_...)'
  },
  STRIPE_WEBHOOK_SECRET: {
    // Webhook secret is required in production, optional in development
    required: false,
    pattern: /^whsec_.+$/,
    description: 'Stripe Webhook Secret (whsec_...)'
  },
  NEXT_PUBLIC_APP_URL: {
    required: true,
    pattern: /^https?:\/\/.+$/,
    description: 'Application URL (http://localhost:3000 or https://yourdomain.com)'
  }
} as const;

/**
 * Validates all required environment variables
 * Throws detailed errors if any are missing or invalid
 */
export function validateEnvironment(): void {
  const errors: string[] = [];

  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];

    // Skip missing webhook secret in non-production environments
    if (!value) {
      if (key === 'STRIPE_WEBHOOK_SECRET' && process.env.NODE_ENV !== 'production') {
        // warn but don't treat as fatal in dev
        console.warn(`⚠️ Optional env var missing (dev): ${key} - ${config.description}`);
        continue;
      }

      errors.push(`❌ Missing required environment variable: ${key} - ${config.description}`);
      continue;
    }

    // Validate pattern if present
    try {
      // If webhook secret looks like the placeholder (contains 'your' or 'placeholder') and we're in dev, skip
      if (key === 'STRIPE_WEBHOOK_SECRET' && process.env.NODE_ENV !== 'production') {
        const lc = value.toLowerCase();
        if (lc.includes('your') || lc.includes('placeholder') || lc === 'whsec_') {
          console.warn(`⚠️ Ignoring placeholder STRIPE_WEBHOOK_SECRET in development.`);
          continue;
        }
      }

      if (config.pattern && !config.pattern.test(value)) {
        errors.push(`❌ Invalid format for ${key} - Expected: ${config.description}`);
      }
    } catch (e) {
      errors.push(`❌ Validation pattern error for ${key}`);
    }
  }

  // Check for environment mismatch (test keys in production)
  if (process.env.NODE_ENV === 'production') {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (secretKey?.startsWith('sk_test_')) {
      errors.push('❌ SECURITY WARNING: Using test Stripe keys in production environment!');
    }

    if (publishableKey?.startsWith('pk_test_')) {
      errors.push('❌ SECURITY WARNING: Using test Stripe publishable key in production environment!');
    }

    if (!process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')) {
      errors.push('❌ SECURITY WARNING: Production environment must use HTTPS!');
    }
  }

  if (errors.length > 0) {
    console.error('\n🔒 STRIPE KIT SECURITY VALIDATION FAILED:\n');
    errors.forEach(error => console.error(error));
    console.error('\n📝 Please check your .env.local file and ensure all required variables are set correctly.\n');
    // In development, surface the errors as a warning to avoid breaking dev server
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Continuing in development mode despite environment validation errors.');
    } else {
      throw new Error(`Environment validation failed: ${errors.length} error(s) found`);
    }
  }

  // Success message
  const environment = process.env.NODE_ENV || 'development';
  const keyType = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'LIVE' : 'TEST';
}

/**
 * Get validated environment variables with proper typing
 */
export const env = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

// Validate environment on module load
validateEnvironment();