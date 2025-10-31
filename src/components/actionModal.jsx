import React from "react";
import { TriangleAlert, X } from "lucide-react";

const titles = {
  approve: "Approve Registration",
  reject: "Reject Registration",
  warning: "Unsaved Data",
};

const descriptions = {
  approve:
    "Are you sure you want to approve this user’s registration? This action cannot be undone.",
  reject:
    "Are you sure you want to reject this user’s registration? This action cannot be undone.",
  warning:
    "You have unsaved changes. Would you like to save them as a draft before leaving?",
};

const colors = {
  approve: {
    iconBg: "var(--light-green)", // from globals.css
    iconColor: "var(--forest-green)", // from globals.css
    button: "bg-[var(--forest-green)] hover:bg-[var(--forest-green)]", // uses CSS variable
  },
  reject: {
    iconBg: "var(--light-red)",
    iconColor: "var(--maroon)",
    button: "bg-[var(--maroon)] hover:bg-[var(--maroon)]",
  },
  warning: {
    iconBg: "var(--light-yellow)",
    iconColor: "var(--dark-yellow)",
    button: "bg-[var(--dark-yellow)] hover:bg-[var(--dark-yellow)]",
  },
};

const ActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  variant = "approve", // "approve", "reject", or "warning"
}) => {
  if (!isOpen) return null;

  const { iconBg, iconColor, button } = colors[variant];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div
          className="mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-4"
          style={{ backgroundColor: iconBg }}
        >
          <TriangleAlert color={iconColor} size={36} />
        </div>

        {/* Title and Description */}
        <h2 className="text-xl font-semibold text-center mb-2">
          {titles[variant]}
        </h2>
        <p className="text-center text-gray-600 mb-6">
          {descriptions[variant]}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition ${button}`}
          >
            {variant === "approve"
              ? "Approve"
              : variant === "reject"
              ? "Reject"
              : "Save Draft"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
