import Link from "next/link"
import { Brand } from "@/components/brand"

export function SiteFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <Brand />
          <p className="mt-3 text-sm text-white/70">
            A unified scholarship management platform connecting students, administrators, and
            scholarship offices.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-accent">Students</span>
            <Link href="/register" className="text-white/70 hover:text-white">
              Register
            </Link>
            <Link href="/login" className="text-white/70 hover:text-white">
              Sign in
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-accent">Staff</span>
            <Link href="/admin/login" className="text-white/70 hover:text-white">
              Admin portal
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-accent">Legal</span>
            <span className="text-white/70">Privacy Policy</span>
            <span className="text-white/70">Terms of Service</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Iskolarly Scholarship Management System. All rights reserved.
      </div>
    </footer>
  )
}
