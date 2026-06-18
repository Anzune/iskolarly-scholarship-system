import type React from "react"
import Link from "next/link"
import { Brand } from "@/components/brand"
import { Card, CardContent } from "@/components/ui/card"

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col bg-secondary">
      <header className="border-b border-white/10 px-6 py-4">
        <Brand />
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="mb-6 mt-1 text-sm text-muted-foreground">{subtitle}</p>
              {children}
            </CardContent>
          </Card>
          {footer ? <div className="mt-4 text-center text-sm text-white/70">{footer}</div> : null}
          <p className="mt-6 text-center text-xs text-white/50">
            <Link href="/" className="hover:text-white/80">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
