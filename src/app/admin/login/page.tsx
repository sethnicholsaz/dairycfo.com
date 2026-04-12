"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginForm() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? "/admin"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push(redirect)
      router.refresh()
    } else {
      setError("Incorrect password")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-200 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-green-800 rounded flex items-center justify-center mx-auto mb-3">
            <span className="text-gold-600 font-bold font-serif">D</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-green-800">DairyCFO Admin</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white border border-cream-400 rounded-xl p-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2d2a1e] uppercase tracking-wider mb-1">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2 border border-cream-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-800"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-800 text-cream-200 py-2.5 rounded-md text-sm font-semibold hover:bg-[#163d22] transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
