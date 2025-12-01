"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { X, TriangleAlert } from "lucide-react";

// 1 hour in milliseconds
const TIMEOUT_DURATION = 3600 * 1000; 
// to test for 5 minutes use 5 * 60000

export default function SessionTimeout() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  
  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  useEffect(() => {
    const checkSessionTimeout = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If user is not logged in, do nothing
      if (!session?.user?.last_sign_in_at) return;

      const lastSignInTime = new Date(session.user.last_sign_in_at).getTime();
      const currentTime = Date.now();
      const timeElapsed = currentTime - lastSignInTime;
      const timeLeft = TIMEOUT_DURATION - timeElapsed;

      if (timeLeft <= 0) {
        // Time has already expired: Force logout immediately
        handleExpiry();
      } else {
        // Set a timer for the exact remaining time
        const timer = setTimeout(() => {
          handleExpiry();
        }, timeLeft);

        // Cleanup timer on component unmount
        return () => clearTimeout(timer);
      }
    };

    checkSessionTimeout();
  }, []);

  const handleExpiry = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    // Show the modal to inform the user
    setShowModal(true);
  };

  const handleRedirect = () => {
    setShowModal(false);
    // Redirect to login and refresh to clear any server-side cached data
    router.push("/login");
    router.refresh(); 
  };

  // Don't render anything if the modal isn't active
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-sm overflow-hidden rounded-lg bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <button
          onClick={handleRedirect}
          className="absolute right-4 top-4 text-[var(--outline-grey)] hover:text-[var(--dark-grey)] transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 p-3">
            <TriangleAlert className="h-20 w-20 text-[var(--maroon)]" />
          </div>
          
          <h2 className="mb-2 text-xl font-bold text-[var(--dark-grey)]">
            Session Expired
          </h2>
          
          <p className="mb-6 text-sm text-[var(--dark-grey)]">
            Your session has timed out due to inactivity (1 hour limit). Please log in again to continue.
          </p>

          <button
            onClick={handleRedirect}
            className="w-full rounded-md bg-[var(--maroon)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--maroon)] transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}