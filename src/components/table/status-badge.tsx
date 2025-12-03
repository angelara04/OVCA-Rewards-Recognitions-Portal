interface StatusBadgeProps {
  status:
    | "In Progress"
    | "Completed"
    | "Not Started"
    | "Pending"
    | "Approved"
    | "Rejected"
    | "Qualified"
    | "Disqualified";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles = {
    "In Progress": "bg-[var(--light-purple)] text-[var(--dark-purple)]",
    Completed: "bg-[var(--light-green)] text-[var(--forest-green)]",
    "Not Started": "bg-[var(--light-red)] text-[var(--maroon)]",
    Pending: "bg-[var(--light-yellow)] text-yellow-800",
    Approved: "bg-[var(--light-green)] text-[var(--forest-green)]",
    Rejected: "bg-[var(--light-red)] text-[var(--maroon)]",
    Qualified: "bg-[var(--light-green)] text-[var(--forest-green)]",
    Disqualified: "bg-[var(--light-red)] text-[var(--maroon)]",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center whitespace-nowrap ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
