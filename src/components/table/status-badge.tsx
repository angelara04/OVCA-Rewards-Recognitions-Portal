interface StatusBadgeProps {
  status: "In Progress" | "Complete" | "Not Started" | "Pending" | "Approved" | "Rejected";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles = {
    "In Progress": "bg-[var(--light-purple)] text-[var(--dark-purple)]",
    Complete: "bg-[var(--light-green)] text-[var(--forest-green)]",
    "Not Started": "bg-[var(--light-red)] text-[var(--maroon)]",
    Pending: "bg-[var(--light-yellow)] text-yellow-800",
    Approved: "bg-[var(--light-green)] text-[var(--forest-green)]",
    Rejected: "bg-[var(--light-red)] text-[var(--maroon)]",
  }


  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>{status}</span>
  );
}
