import React from "react";

export default function Role({ role }: { role: string }) {
  const roleStyle =
    role === "hr"
      ? "bg-[var(--maroon)] text-[var(--white)] "
      : role === "committee"
      ? "bg-[var(--light-green)] text-[var(--dark-green)]"
      : role === "nominator"
      ? "bg-[var(--light-blue)] text-[var(--dark-blue)]"
      : "";

  const displayRole =
    role === "hr"
      ? "HR SuperAdmin"
      : role === "committee"
      ? "Committee"
      : role === "nominator"
      ? "Nominator"
      : "";

  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium ${roleStyle}`}>
      {displayRole}
    </div>
  );
}
