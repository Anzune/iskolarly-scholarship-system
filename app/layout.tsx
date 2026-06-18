import type React from "react"
import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque } from "next/font/google"
import "./globals.css"

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Iskolarly — Scholarship Management System",
  description:
    "Apply for, manage, and track scholarship programs. A unified platform for students, administrators, and scholarship offices.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#360d0e",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${bricolage.variable} bg-background`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
