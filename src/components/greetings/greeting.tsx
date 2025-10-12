"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Role from "./role";
import Button from "../button";

interface GreetingProps {
  Fname: string;
  role: string;
}

export default function Greeting({ Fname, role }: GreetingProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Optional: clear session or token
    // localStorage.removeItem("token");
    // sessionStorage.clear();

    // Redirect to login page
    router.push("/login");
  };

  return (
    <div className="flex flex-row justify-between px-5 py-5 items-center w-full h-[81px] shadow-[0_0px_10px_2px_rgba(0,0,0,0.10)] bg-[var(--white)]">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">Welcome, {Fname}</span>
        <Role role={role} />
      </div>

      <div>
        <Button size="md" variant="secondary" onClick={handleLogout}>
          <div className="px-5">Logout</div>
        </Button>
      </div>
    </div>
  );
}
