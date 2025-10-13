"use client";
import React, { useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

interface TabsProps {
  info: string[];
  role: "hr" | "committee" | "nominator";
}

export default function Tabs({ info, role }: TabsProps) {
  const [active, setActive] = useState(0); // default → 1st tab active
  const router = useRouter();

  const baseMap: Record<TabsProps["role"], string> = {
    hr: "/hr",
    committee: "/committee",
    nominator: "/nominators",
  };

  const toSlug = (label: string) =>
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return (
    <div className="flex w-full flex-col gap-2">
      {info.map((label, index) => (
        <button
          key={index}
          onClick={() => {
            setActive(index);
            const base = baseMap[role] ?? "/";
            const slug = toSlug(label);
            router.push(`${base}/${slug}`);
          }}
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
