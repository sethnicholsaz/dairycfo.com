import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

// Sponsor pricing — flat fee per newsletter issue
export const SPONSOR_PRICE_CENTS = 50000 // $500 per issue (update in .env to override)
