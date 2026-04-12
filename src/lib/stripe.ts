import Stripe from "stripe"
import { env } from "@/lib/env"

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
})

// Sponsor pricing — flat fee per newsletter issue
export const SPONSOR_PRICE_CENTS = 50000 // $500 per issue (update in .env to override)
