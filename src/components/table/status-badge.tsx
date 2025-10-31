// src/components/table/status-badge.tsx
import React from "react";

interface StatusProps {
  status: "pending" | "approved" | "rejected";
}

export default function Status({ status }: StatusProps) {
  const colorClass =
    status === "pending"
      ? "bg-[var(--light-yellow)] text-yellow-800"
      : status === "approved"
      ? "bg-[var(--light-green)] text-[var(--forest-green)]"
      : "bg-[var(--light-red)] text-[var(--maroon)]";

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div
      className={`w-25 px-3 py-1 rounded-md text-xs font-medium flex items-center justify-center ${colorClass}`}
    >
      {label}
    </div>
  );
}
