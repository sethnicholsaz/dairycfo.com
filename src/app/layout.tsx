import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "DairyCFO | The Dairy Industry Newsletter",
  description:
    "What's happening on the farm — explained for the professionals who serve the dairy industry. Market data, farm operations insights, and financial intelligence, delivered weekly.",
  openGraph: {
    title: "DairyCFO Newsletter",
    description: "The heartbeat of the dairy farm, delivered to your inbox.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  )
}
