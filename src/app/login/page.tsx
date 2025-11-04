"use client"
import { signWithGoogle } from "./actions"
import Button from "@/components/button"
import Input from "@/components/input"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Branded image */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center"
      >
        <img src="../login-side-picture.png" className="w-full max-w-3xl"/>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-[420px]">
          {/* Header */}
          <div className="bg-[var(--maroon)] rounded-t-lg p-8 text-center">
            <div className="text-yellow-400 text-sm font-semibold tracking-wide mb-2">UP MINDANAO</div>
            <div className="text-yellow-300 text-3xl font-bold">GAWAD TSANSELOR</div>
          </div>

          {/* Form Container */}
          <div className="bg-white border border-gray-200 rounded-b-lg px-4 sm:p-10 shadow-lg">
            {/* Tab */}
            <div className="flex justify-center mb-8">
              <div className="text-center pb-3 border-b-2 border-[#8A1538] w-[40%]">
                <span className="text-[#8A1538] font-semibold text-lg">Login</span>
              </div>
            </div>

            <form className="flex flex-col gap-6">
              {/* Username Field */}
              <div className="flex flex-col gap-2">
                <Input
                  id="username"
                  label="Username"
                  type="text"
                  placeholder="Enter your username"
                  width="w-full"
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  width="w-full"
                />
              </div>

              {/* Login with Google Button */}
              <Button
                type="button"
                variant="reset"
                onClick={() => signWithGoogle()}
                className="w-full h-11 text-white font-semibold flex items-center justify-center gap-2 rounded-md"
              >
                <img src="../google-color.svg" alt="Google Logo" className="w-4 h-4 bg-white rounded-full" />
                Login with Google
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-6 text-center">
              <span className="text-gray-700 text-sm">
                Forgot your password?{" "}
                <span className="text-[#8A1538] font-semibold">
                  Contact your system administrator
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
