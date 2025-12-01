"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { TriangleAlert } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr"

export default function UnauthorizedPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  // Default is null; button/redirect logic waits for role determination
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [buttonText, setButtonText] = useState("Return to Dashboard")
  const [loadingRole, setLoadingRole] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  // Fetch user role to determine redirect destination
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

          const role = profile?.role

          if (role === "nominator") {
            setRedirectUrl("/nominators/dashboard")
            setButtonText("Return to Nominator Dashboard")
          } else if (role === "committee") {
            setRedirectUrl("/committee/review-dashboard")
            setButtonText("Return to Committee Dashboard")
          } else if (role === "hr") {
            setRedirectUrl("/hr/hr-dashboard")
            setButtonText("Return to HR Dashboard")
          }
        }
      } catch (error) {
        console.error("Error fetching role:", error)
      } finally {
        setLoadingRole(false)
      }
    }

    fetchUserRole()
  }, [supabase])

  // Auto-redirect countdown (only starts if a redirectUrl is determined)
  useEffect(() => {
    if (!redirectUrl) return

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [redirectUrl])

  // Redirect when countdown hits 0
  useEffect(() => {
    if (countdown === 0 && redirectUrl) {
      router.push(redirectUrl)
    }
  }, [countdown, router, redirectUrl])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-6 flex justify-center">
            <div className="mb-4 inline-flex p-2">
             <TriangleAlert size={80} className="text-[var(--maroon)]" />
            </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Access Denied
        </h1>
        
        <p className="text-gray-600 mb-6">
          You do not have permission to view this page. Please contact your administrator if you believe this is an error.
        </p>

        {loadingRole ? (
          <div className="text-sm text-gray-500 min-h-[40px] flex items-center justify-center">
            <span className="animate-pulse">Checking permissions...</span>
          </div>
        ) : redirectUrl ? (
          <>
            <div className="text-sm text-gray-500 mb-8">
              Redirecting automatically in <span className="font-semibold text-gray-900">{countdown}</span> seconds...
            </div>

            <button
              onClick={() => router.push(redirectUrl)}
              className="w-full bg-[var(--maroon)] hover:bg-red-900 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {buttonText}
            </button>
          </>
        ) : (
          <div className="text-sm text-gray-500">
            No redirection available for your role. <br />
            <button 
              onClick={() => router.push('/login')}
              className="text-[var(--maroon)] hover:underline mt-2"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}