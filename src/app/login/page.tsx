'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Button from "@/components/button";

export default function Index() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("login/register-success");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-8">
      <section className="w-full max-w-[566px] border-0 bg-white rounded-[10px] shadow-[0_0_11px_0_rgba(0,0,0,0.30)] overflow-hidden">
       {/* Header */}
        <div className="h-auto">
          <Header variant="login" />
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-3.5 text-center text-[20px] sm:text-[21px] tracking-[-0.208px] transition-colors ${
              activeTab === "login"
                ? "text-[#8A1538] border-b-[2px] border-[#8A1538] font-medium"
                : "text-black font-normal"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-3.5 text-center text-[20px] sm:text-[21px] tracking-[-0.208px] transition-colors ${
              activeTab === "register"
                ? "text-[#8A1538] border-b-[2px] border-[#8A1538] font-medium"
                : "text-black font-normal"
            }`}
          >
            Register
          </button>
        </div>

        {activeTab === "login" && (
          <div className="px-6 sm:px-12 py-10 sm:py-12">
            <form onSubmit={handleLogin}>
              <div className="mb-8">
                <label className="block text-black text-[20px] font-medium tracking-[-0.2px] mb-3">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full h-[46px] px-4 rounded-[5px] border border-[#C3C3C3] bg-[#F5F5F5] text-black placeholder:text-[#A3A1A1] text-[15px] focus:outline-none focus:border-maroon-light transition-colors"
                />
              </div>

              <div className="mb-10">
                <label className="block text-black text-[20px] font-medium tracking-[-0.2px] mb-3">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full h-[46px] px-4 rounded-[5px] border border-[#C3C3C3] bg-[#F5F5F5] text-black placeholder:text-[#A3A1A1] text-[15px] focus:outline-none focus:border-maroon-light transition-colors"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-[48px] bg-[var(--maroon)] hover:bg-[#710A29] text-white text-[17px] font-semibold rounded-[5px] transition-colors"
              >
                Login
              </Button>
            </form>
          </div>
        )}

        {activeTab === "register" && (
          <div className="px-6 sm:px-12 py-10 sm:py-12">
            <form onSubmit={handleRegister}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-4 mb-6">
                <div>
                  <label className="block text-black text-[20px] font-medium tracking-[-0.2px] mb-3">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    className="w-full h-[46px] px-4 rounded-[5px] border border-[#C3C3C3] bg-[#F5F5F5] text-black placeholder:text-[#A3A1A1] text-[15px] focus:outline-none focus:border-maroon-light transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-black text-[20px] font-medium tracking-[-0.2px] mb-3">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    className="w-full h-[46px] px-4 rounded-[5px] border border-[#C3C3C3] bg-[#F5F5F5] text-black placeholder:text-[#A3A1A1] text-[15px] focus:outline-none focus:border-maroon-light transition-colors"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-black text-[20px] font-medium tracking-[-0.2px] mb-3">
                  UP Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your UP email address"
                  className="w-full h-[46px] px-4 rounded-[5px] border border-[#C3C3C3] bg-[#F5F5F5] text-black placeholder:text-[#A3A1A1] text-[15px] focus:outline-none focus:border-maroon-light transition-colors"
                />
              </div>

              <div className="mb-10">
                <label className="block text-black text-[20px] font-medium tracking-[-0.2px] mb-3">
                  Role
                </label>
                <div className="relative">
                  <select className="w-full h-[46px] px-4 rounded-[5px] border border-[#C3C3C3] bg-[#F5F5F5] text-[#A3A1A1] text-[15px] focus:outline-none focus:border-maroon-light transition-colors appearance-none">
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                    <option value="faculty">Faculty</option>
                  </select>
                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-7 pointer-events-none"
                    width="28"
                    height="14"
                    viewBox="0 0 28 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_190_1281)">
                      <path
                        d="M20.323 2.86065L21.5596 4.09849L14.8198 10.8407C14.7118 10.9493 14.5834 11.0356 14.4419 11.0944C14.3005 11.1533 14.1488 11.1836 13.9956 11.1836C13.8423 11.1836 13.6906 11.1533 13.5492 11.0944C13.4077 11.0356 13.2793 10.9493 13.1713 10.8407L6.42798 4.09849L7.66465 2.86182L13.9938 9.18982L20.323 2.86065Z"
                        fill="black"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_190_1281">
                        <rect width="14" height="28" fill="white" transform="translate(28) rotate(90)" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-[48px] bg-[var(--maroon)] hover:bg-[#710A29] text-white text-[17px] font-semibold rounded-[5px] transition-colors"
              >
                Register
              </Button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}