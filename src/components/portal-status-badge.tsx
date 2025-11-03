import React from "react";

//IMPORTANT MODIFICATION FOR FUNCTIONALITIES
//THIS CODE NEEDS TO BE MODIFIED
// Need to modify the Logic, Published if there is no submissions yet it can allow user to edit the Dates
// However if there are submissions already it should be Open and cannot be edited

interface PortalStatusBadgeProps {
  startDate?: string | null;
  endDate?: string | null;
  /** Optional override label when no date is set (defaults to "UNSCHEDULED") */
  unscheduledLabel?: string;
}

const PortalStatusBadge: React.FC<PortalStatusBadgeProps> = ({
  startDate,
  endDate,
  unscheduledLabel = "UNSCHEDULED",
}) => {
  const today = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  /* Default to UN SCHEDULED when no dates provided */
  let label = unscheduledLabel;
  // text color class (applies to text and dot via bg-current)
  let textColorClass = "text-[var(--dark-yellow)]";
  // border color class
  let borderColorClass = "border-[var(--dark-yellow)]";

  if (start && end) {
    if (today < start) {
      label = "PUBLISHED";
      textColorClass = "text-[var(--dark-purple)]";
      borderColorClass = "border-[var(--dark-purple)]";
    } else if (today >= start && today <= end) {
      label = "OPEN";
      textColorClass = "text-[var(--forest-green)]";
      borderColorClass = "border-[var(--forest-green)]";
    }
  }

  return (
    <div
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[var(--settings-grey)] border-2 ${borderColorClass} ${textColorClass} px-2 py-1 select-none`}
      role="status"
      aria-label={`Portal status: ${label}`}
    >
      {/* dot */}
      <span className="block w-2 h-2 rounded-full bg-current" aria-hidden />
      {/* label - keep uppercase small text */}
      <span className="text-xs font-semibold tracking-wide">{label}</span>
    </div>
  );
};

export default PortalStatusBadge;
