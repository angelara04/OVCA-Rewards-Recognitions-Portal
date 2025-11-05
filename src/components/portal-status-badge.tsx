import React, { useEffect, useState } from 'react';

//IMPORTANT MODIFICATION FOR FUNCTIONALITIES
//THIS CODE NEEDS TO BE MODIFIED
// Need to modify the Logic, Published if there is no submissions yet it can allow user to edit the Dates
// However if there are submissions already it should be Open and cannot be edited

interface PortalStatusBadgeProps {
  variant: 'period' | 'report';
  startDate?: string | null;
  endDate?: string | null;
  hasSubmissions?: boolean; // for period variant
  totalMembers?: number; // for report variant
  submittedCount?: number; // for report variant
  onStateChange?: (state: string) => void;
  sizeClass?: string;
}

const PortalStatusBadge: React.FC<PortalStatusBadgeProps> = ({
  variant,
  startDate,
  endDate,
  hasSubmissions = false,
  totalMembers = 0,
  submittedCount = 0,
  onStateChange,
  sizeClass = 'w-32 h-8',
}) => {
  const today = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const [status, setStatus] = useState('');
  const [style, setStyle] = useState({
    border: '',
    text: '',
    bg: '',
  });

  useEffect(() => {
    let newStatus = '';
    let border = '';
    let text = '';
    let bg = '';

    if (variant === 'period') {
      // Period logic
      if (!start || !end) {
        newStatus = 'UNSCHEDULED';
        border = 'border-[var(--dark-yellow)]';
        text = 'text-[var(--dark-yellow)]';
        bg = 'bg-[var(--settings-grey)]';
      } else if (!hasSubmissions) {
        newStatus = 'PUBLISHED';
        border = 'border-[var(--dark-purple)]';
        text = 'text-[var(--dark-purple)]';
        bg = 'bg-[var(--settings-grey)]';
      } else {
        newStatus = 'OPEN';
        border = 'border-[var(--forest-green)]';
        text = 'text-[var(--forest-green)]';
        bg = 'bg-[var(--settings-grey)]';
      }
    } else if (variant === 'report') {
      // Report logic
      if (submittedCount === 0) {
        newStatus = 'NOT STARTED';
        border = 'border-[var(--maroon)]';
        text = 'text-[var(--maroon)]';
        bg = 'bg-[var(--light-red)]';
      } else if (submittedCount < totalMembers) {
        newStatus = 'ON GOING';
        border = 'border-[var(--dark-purple)]';
        text = 'text-[var(--dark-purple)]';
        bg = 'bg-[var(--light-purple)]';
      } else {
        newStatus = 'COMPLETED';
        border = 'border-[var(--forest-green)]';
        text = 'text-[var(--forest-green)]';
        bg = 'bg-[var(--light-green)]';
      }
    }

    setStatus(newStatus);
    setStyle({ border, text, bg });
    onStateChange && onStateChange(newStatus);
  }, [variant, startDate, endDate, hasSubmissions, totalMembers, submittedCount]);

  return (
    <div
      className={`inline-flex items-center justify-center gap-2 ${sizeClass} rounded-full ${style.bg} border-2 ${style.border} ${style.text} px-2 py-1 select-none`}
      role="status"
      aria-label={`Portal status: ${status}`}
    >
      <span className="block w-2 h-2 rounded-full bg-current" aria-hidden></span>
      <span className="text-xs font-semibold tracking-wide">{status}</span>
    </div>
  );
};

export default PortalStatusBadge;
