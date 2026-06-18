import * as React from "react"
import { cn } from "@/lib/utils"
import { formatStatus } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  on_hold: "bg-orange-100 text-orange-800",
  approved: "bg-green-100 text-green-800",
  verified: "bg-green-100 text-green-800",
  active: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  suspended: "bg-red-100 text-red-800",
  pending: "bg-amber-100 text-amber-800",
  inactive: "bg-muted text-muted-foreground",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {formatStatus(status)}
    </span>
  )
}

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}
