interface StatusBadgeProps {
  status: "In Progress" | "Complete" | "Not Started"
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles = {
    "In Progress": "bg-purple-100 text-purple-700",
    Complete: "bg-green-100 text-green-700",
    "Not Started": "bg-red-100 text-red-700",
  }

  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}>{status}</span>
}
