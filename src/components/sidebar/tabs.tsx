"use client";
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { useRouter, usePathname } from "next/navigation";

interface TabsProps {
  info: string[];
  role: "hr" | "committee" | "nominator";
}

export default function Tabs({ info, role }: TabsProps) {
  const [active, setActive] = useState(0);
  const router = useRouter();
  const pathname = usePathname(); // ✅ Detects current route

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

  // ✅ Automatically detect which tab is active based on path
  useEffect(() => {
    const base = baseMap[role] ?? "/";
    const currentIndex = info.findIndex((label) => {
      const slug = toSlug(label);
      const fullPath = `${base}/${slug}`;
      return pathname === fullPath;
    });

    // Only update if found
    if (currentIndex !== -1) setActive(currentIndex);
  }, [pathname, role, info]);

  return (
    <div className="flex w-full flex-col gap-2">
      {info.map((label, index) => (
        <button
          key={index}
          onClick={() => {
            const base = baseMap[role] ?? "/";
            const slug = toSlug(label);
            router.push(`${base}/${slug}`);
            setActive(index); // still updates instantly on click
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
