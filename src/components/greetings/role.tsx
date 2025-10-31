import React from "react";

export default function Role({ role }: { role: string }) {
  const key = role?.toLowerCase?.() ?? "";

  const roleStyle =
    key === "hr"
      ? "bg-[var(--maroon)] text-[var(--white)]"
      : key === "committee"
      ? "bg-[var(--light-green)] text-[var(--forest-green)]"
      : key === "nominator"
      ? "bg-[var(--light-blue)] text-[var(--dark-blue)]"
      : "bg-[var(--category-grey)] text-[var(--dark-grey)]";

  const displayRole =
    key === "hr" ? "HR SuperAdmin" : key === "committee" ? "Committee" : key === "nominator" ? "Nominator" : role;

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium ${roleStyle}`}>
      {displayRole}
    </div>
  );
}
