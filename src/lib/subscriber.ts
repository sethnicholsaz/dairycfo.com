import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { env } from "@/lib/env"

const COOKIE_NAME = "dcfo_subscriber"
const SECRET = new TextEncoder().encode(env.SUBSCRIBER_JWT_SECRET)

export async function createSubscriberToken(subscriberId: string, email: string) {
  return new SignJWT({ sub: subscriberId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(SECRET)
}

export async function verifySubscriberToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as { sub: string; email: string }
  } catch {
    return null
  }
}

export async function getSubscriberFromCookie() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySubscriberToken(token)
}

export async function setSubscriberCookie(subscriberId: string, email: string) {
  const token = await createSubscriberToken(subscriberId, email)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  })
  return token
}

export async function clearSubscriberCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export { COOKIE_NAME }
