"use client"

import { useAuth } from "@/context/AuthContext"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({ children }: React.PropsWithChildren) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (user === null) {
      router.replace(
        `/auth/signin?redirect=${encodeURIComponent(pathname)}`
      )
    }
  }, [pathname, router, user])

  // Prevent hydration errors
  if (user === undefined) return null
  if (user === null) return null

  return <>{children}</>
}
