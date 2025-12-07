"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { X, TriangleAlert } from "lucide-react";

// 1 hour in milliseconds
// 5 minutes for testing: const TIMEOUT_DURATION = 5 * 60 * 1000;
const TIMEOUT_DURATION = 3600 * 1000; 
// Check interval (e.g., every 1 minute)
const CHECK_INTERVAL = 60 * 1000;

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'click',
  'scroll',
  'keydown',
  'touchstart'
];

export default function SessionTimeout() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  
  // Track last activity time in a ref to avoid re-renders
  const lastActivity = useRef(Date.now());
  
  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const handleExpiry = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    // Show the modal to inform the user
    setShowModal(true);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let cleanupListeners: () => void;

    const initSessionTracker = async () => {
      // Check if user is logged in before starting the tracker
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      // Function to reset the activity timer
      const updateActivity = () => {
        lastActivity.current = Date.now();
      };

      // Attach event listeners for user activity
      ACTIVITY_EVENTS.forEach((event) => {
        window.addEventListener(event, updateActivity);
      });

      // Cleanup function for listeners
      cleanupListeners = () => {
        ACTIVITY_EVENTS.forEach((event) => {
          window.removeEventListener(event, updateActivity);
        });
      };

      // Set up an interval to check for inactivity periodically
      intervalId = setInterval(() => {
        const now = Date.now();
        const timeElapsed = now - lastActivity.current;

        if (timeElapsed >= TIMEOUT_DURATION) {
          handleExpiry();
          // Clear interval after expiry to stop repeated calls
          clearInterval(intervalId);
          // Optional: Clean up listeners since we are logged out
          cleanupListeners(); 
        }
      }, CHECK_INTERVAL);
    };

    initSessionTracker();

    // Cleanup on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (cleanupListeners) cleanupListeners();
    };
  }, []);

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
            Your session has timed out due to inactivity. Please log in again to continue.
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