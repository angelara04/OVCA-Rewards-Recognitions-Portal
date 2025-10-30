"use client"
import { useEffect, useState } from "react"

export default function PendingPage() {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (countdown === 0) window.location.href = "/"
  }, [countdown])

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Registration Pending
      </h1>
      <p>Your registration request has been sent to the admin for approval.</p>
      <p>You’ll be redirected to the home page in {countdown} seconds.</p>
      <p style={{ fontSize: "0.9rem", marginTop: "2rem", color: "#555" }}>
        Once approved, you can log in again to access your account.
      </p>
    </div>
  )
}
