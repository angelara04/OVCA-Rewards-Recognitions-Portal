"use client"
import { signWithGoogle, login } from "./actions" 
import Button from "@/components/button"
import Input from "@/components/input"
import { useSearchParams} from "next/navigation"
import { useEffect, useState } from "react"
import { TriangleAlert, X } from "lucide-react"

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  
  // Handle Error Params from Server Action Redirects
  useEffect(() => {
    const errorMsg = searchParams.get("error");
    if (errorMsg) {
      setError(errorMsg);
      // Clean up URL without refreshing
      window.history.replaceState(null, '', '/login');
    }
  }, [searchParams]);

  const handleLogin = async (formData: FormData) => {
    await login(formData);
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Left side - Branded image */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center overflow-hidden">
        <img src="../login-side-picture.png" alt="Branded side view" className="w-full h-full object-cover" />
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="bg-[var(--maroon)] rounded-t-lg p-8 text-center cursor-default">
            <div className="text-yellow-400 text-md font-semibold tracking-wide mb-2">UP MINDANAO</div>
            <span className="text-[var(--gold)] text-3xl font-regular">
              GAWAD{" "}
              <span className="text-[var(--gold)] font-semibold">TSANSELOR</span>
            </span>
          </div>

          {/* Form Container */}
          <div className="bg-white border border-gray-200 rounded-b-lg px-4 sm:p-10 shadow-lg">
            {/* Tab */}
            <div className="flex justify-center mb-6">
              <div className="text-center pb-3 border-b-2 border-[#8A1538] w-[40%]">
                <span className="text-[#8A1538] font-medium text-lg cursor-default">Login</span>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 rounded-md bg-[var(--light-red)] border border-[#f4aeae] flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <TriangleAlert className="w-5 h-5 text-[var(--maroon)] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-[var(--hover-maroon)]">Authentication Error</h3>
                  <p className="text-sm text-[var(--maroon)] mt-1">{error}</p>
                </div>
                <button 
                  onClick={() => setError("")}
                  className="text-[var(--maroon)] hover:text-[var(--hover-maroon)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <form className="flex flex-col gap-6" id="auth-form">
              {/* Username Field */}
              <div className="flex flex-col gap-2">
                <Input
                  id="username"
                  name="username" 
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  width="w-full" />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <Input
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  width="w-full"
                />
              </div>

              {/* --- ACTION BUTTON --- */}
              <div className="mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogin(new FormData(document.getElementById('auth-form') as HTMLFormElement));
                  }}
                  className="w-full h-11 text-white font-semibold flex items-center justify-center rounded-md"
                >
                  Sign In
                </Button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-[var(--outline-grey)]"></div>
                <span className="flex-shrink mx-4 text-[var(--dark-grey)] text-sm">OR</span>
                <div className="flex-grow border-t border-[var(--outline-grey)]"></div>
              </div>

              {/* Login with Google Button */}
              <Button
                type="button"
                variant="maroon"
                onClick={() => signWithGoogle()}
                className="w-full h-11 text-white font-semibold flex items-center justify-center gap-2 rounded-md"
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <img src="../google-color.svg" alt="Google Logo" className="w-4 h-4" />
                </div>
                Login with Google
              </Button>
            </form>

            <div className="mt-6 text-center cursor-default">
              <span className="text-[var(--dark-grey)] text-sm">
                Forgot your password?{" "}
                <span className="text-[var(--maroon)] font-semibold">Contact system administrator</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}