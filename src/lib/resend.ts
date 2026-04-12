import { Resend } from "resend"
import { env } from "@/lib/env"

export const resend = new Resend(env.RESEND_API_KEY)

export const FROM_EMAIL = "DairyCFO Newsletter <newsletter@mail.dairycfo.com>"
export const REPLY_TO = "hello@mail.dairycfo.com"
export const AUDIENCE_ID = env.RESEND_AUDIENCE_ID

// Add or re-subscribe a contact in Resend audience
export async function upsertResendContact(email: string, firstName?: string | null) {
  const { error } = await resend.contacts.create({
    audienceId: AUDIENCE_ID,
    email,
    firstName: firstName ?? undefined,
    unsubscribed: false,
  })
  if (error) console.error("Resend contact upsert error:", error)
}

// Mark contact as unsubscribed in Resend
export async function unsubscribeResendContact(email: string) {
  const { error } = await resend.contacts.update({
    audienceId: AUDIENCE_ID,
    email,
    unsubscribed: true,
  })
  if (error) console.error("Resend contact unsubscribe error:", error)
}

// Send a welcome email to a new subscriber
export async function sendWelcomeEmail(email: string, firstName?: string | null) {
  const name = firstName ? `, ${firstName}` : ""
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    replyTo: REPLY_TO,
    subject: "Welcome to DairyCFO",
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f4ed;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ed;">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:#1c4a2a;padding:20px 28px;border-radius:8px 8px 0 0;">
          <span style="color:#f7f4ed;font-family:Georgia,serif;font-size:22px;font-weight:bold;">DairyCFO</span>
          <span style="display:block;color:#c8902a;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;">Newsletter</span>
        </td></tr>
        <tr><td style="background:#ffffff;padding:32px 28px;border-left:1px solid #d8d2be;border-right:1px solid #d8d2be;">
          <h2 style="font-family:Georgia,serif;color:#1c4a2a;margin:0 0 16px;">You're in${name}.</h2>
          <p style="color:#2d2a1e;line-height:1.7;margin:0 0 16px;">
            Welcome to DairyCFO — weekly market data and farm operations intelligence for dairy industry professionals.
          </p>
          <p style="color:#2d2a1e;line-height:1.7;margin:0 0 24px;">
            You now have access to the full newsletter archive. Every issue covers dairy market prices, farm economics, and the operational realities that drive what shows up at your facility.
          </p>
          <a href="https://dairycfo.com/newsletters"
             style="display:inline-block;background:#1c4a2a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;font-size:14px;">
            Read the archive →
          </a>
        </td></tr>
        <tr><td style="background:#1c2e1f;padding:20px 28px;border-radius:0 0 8px 8px;text-align:center;">
          <p style="color:#8ab89a;font-size:12px;margin:0;">
            DairyCFO · <a href="https://dairycfo.com/unsubscribe" style="color:#a8b8a0;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
  if (error) console.error("Welcome email error:", error)
}
