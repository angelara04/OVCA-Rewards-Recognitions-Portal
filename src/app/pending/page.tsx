"use client"
import { useEffect, useState } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from "next/navigation"

export default function PendingPage() {
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  // Initialize Supabase client for client-side usage
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const performRedirect = async () => {
      if (countdown === 0) {
        // Sign the user out so they become Unauthenticated
        await supabase.auth.signOut()
        
        // Redirect to login page
        window.location.href = "/login" 
      }
    }
    performRedirect()
  }, [countdown, supabase])

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Registration Pending
      </h1>
      <p>Your registration request has been sent to the admin for approval.</p>
      <p>You’ll be redirected to the login page in {countdown} seconds.</p>
      <p style={{ fontSize: "0.9rem", marginTop: "2rem", color: "#555" }}>
        Once approved, you can log in again to access your account.
      </p>
    </div>
  )
}