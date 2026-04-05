import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY!)

export const FROM_EMAIL = "DairyCFO Newsletter <newsletter@dairycfo.com>"
export const REPLY_TO = "hello@dairycfo.com"
