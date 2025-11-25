import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

interface PortalStatusBadgeProps {
  variant: 'period' | 'report';
  status?: 'UNSCHEDULED' | 'OPEN' | 'PUBLISHED' | 'CLOSED'; 
  totalMembers?: number; 
  submittedCount?: number; 
  sizeClass?: string;
}

const PortalStatusBadge: React.FC<PortalStatusBadgeProps> = ({
  variant,
  status: statusProp, 
  totalMembers = 0,
  submittedCount = 0,
  sizeClass = 'w-32 h-8',
}) => {
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
    let bg = 'bg-[var(--settings-grey)]'; // FIX 1: Set default background to GREY

    if (variant === 'period') {
      newStatus = statusProp || 'UNSCHEDULED';
      
      switch (newStatus) {
        case 'UNSCHEDULED':
          border = 'border-[var(--dark-yellow)]';
          text = 'text-[var(--dark-yellow)]';
          break;
        case 'OPEN':
          // FIX 2: Changed to dark green scheme
          border = 'border-[var(--forest-green)]'; 
          text = 'text-[var(--forest-green)]';
          break;
        case 'PUBLISHED':
          // PUBLISHED state is for submissions existing (disabled inputs)
          border = 'border-[var(--dark-purple)]'; 
          text = 'text-[var(--dark-purple)]';
          break;
        case 'CLOSED':
          border = 'border-[var(--maroon)]'; 
          text = 'text-[var(--maroon)]';
          break;
        default:
          border = 'border-[var(--dark-yellow)]';
          text = 'text-[var(--dark-yellow)]';
          break;
      }
    } else if (variant === 'report') {
      // Report logic remains unchanged
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
  }, [variant, statusProp, totalMembers, submittedCount]);

  return (
    <div
      className={clsx(
        `inline-flex items-center justify-center gap-2 ${sizeClass} rounded-full border-2 px-2 py-1 select-none`,
        style.bg,
        style.border,
        style.text
      )}
      role="status"
      aria-label={`Portal status: ${status}`}
    >
      <span className="block w-2 h-2 rounded-full bg-current" aria-hidden></span>
      <span className="text-xs font-semibold tracking-wide">{status}</span>
    </div>
  );
};

export default PortalStatusBadge;