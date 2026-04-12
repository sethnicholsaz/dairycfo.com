import { z } from "zod"

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, "NEXT_PUBLIC_SUPABASE_URL is required"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  // Auth / secrets
  SUBSCRIBER_JWT_SECRET: z.string().min(1, "SUBSCRIBER_JWT_SECRET is required"),
  ADMIN_SECRET: z.string().min(1, "ADMIN_SECRET is required"),
  CRON_SECRET: z.string().min(1, "CRON_SECRET is required"),
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  // Resend
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  RESEND_AUDIENCE_ID: z.string().min(1, "RESEND_AUDIENCE_ID is required"),
  RESEND_WEBHOOK_SECRET: z.string().min(1, "RESEND_WEBHOOK_SECRET is required"),
  // App
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL").optional(),
  // Optional
  USDA_AMS_API_KEY: z.string().optional(),
  BRAVE_API_KEY: z.string().optional(),
  SPONSOR_PRICE_CENTS: z.coerce.number().default(50000),
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
})

export const env = envSchema.parse(process.env)
