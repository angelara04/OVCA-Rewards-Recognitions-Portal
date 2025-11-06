"use client"

import { registerUser } from "./actions"
import Button from "@/components/button"
import Input from "@/components/input"

export default function RegistryPage() {
  return (
    <div className="h-screen flex bg-white">
      {/* Left side - Branded image */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center overflow-hidden">
        <img src="../login-side-picture.png" className="w-full h-full object-cover" />
      </div>

      {/* Right side - Register form */}
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
          <div className="bg-white border border-[var(--outline-grey)] rounded-b-lg p-8 sm:p-10 shadow-lg">
            {/* Tab */}
            <div className="flex justify-center mb-8">
              <div className="text-center pb-3 border-b-2 border-[var(--maroon)] w-[40%]">
                <span className="text-[var(--maroon)] font-medium text-lg cursor-default">Register</span>
              </div>
            </div>

            <form action={registerUser} className="flex flex-col gap-6">
              {/* Full Name Field */}
              <div className="flex flex-col gap-2">
                <Input 
                  id="name" 
                  label="Full Name" 
                  type="text" 
                  placeholder="Enter your full name" />
              </div>

              {/* Department Field */}
              <div className="flex flex-col gap-2">
                <Input 
                  id="department" 
                  label="Department" 
                  type="text" 
                  placeholder="Enter your department" />
              </div>

              {/* Register Button */}
              <Button 
                type="submit" 
                variant="reset" 
                className="w-full h-11 text-white font-semibold rounded-md mt-2">
                Register
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
