import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })

export const metadata: Metadata = {
  title: "DairyCFO | The Dairy Industry Newsletter for Creameries",
  description:
    "Bridging the gap between dairy farms and creameries. Market data, farm operations insights, and industry intelligence — delivered straight to creamery professionals.",
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
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  )
}
