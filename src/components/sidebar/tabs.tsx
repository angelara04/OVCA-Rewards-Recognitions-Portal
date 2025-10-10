"use client";
import React, { useState } from "react";
import clsx from "clsx";

interface TabsProps {
  info: string[];
}

export default function Tabs({ info }: TabsProps) {
  const [active, setActive] = useState(0); // default → 1st tab active

  return (
    <div className="flex w-full flex-col gap-2">
      {info.map((label, index) => (
        <button
          key={index}
          onClick={() => setActive(index)}
          className={clsx(
            "flex-1 py-3 text-center rounded-lg border transition-colors font-medium",
            active === index
              ? "bg-[var(--maroon)] text-white"
              : "bg-transparent text-[var(--maroon)] hover:bg-[var(--maroon)] hover:text-white"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
