import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

export function Brand({
  className,
  href = "/",
  tone = "light",
}: {
  className?: string
  href?: string
  tone?: "light" | "dark"
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <GraduationCap className="h-5 w-5" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "text-lg font-bold tracking-tight",
          tone === "light" ? "text-secondary-foreground" : "text-secondary",
        )}
      >
        Iskolarly
      </span>
    </Link>
  )
}
