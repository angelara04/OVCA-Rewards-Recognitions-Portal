"use client";
import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  action: "approve" | "reject" | "delete" | "submitNomination";
  onCancelAction: () => void;
  onConfirmAction: () => void;
}

// ConfirmModal component
export default function ConfirmModal({
  action,
  onCancelAction,
  onConfirmAction,
}: ConfirmModalProps) {
  // Decide color based on action
  const colorClass =
    action === "approve" || action === "submitNomination"
      ? "text-[var(--forest-green)]"
      : action === "reject" || action === "delete"
      ? "text-[var(--maroon)]"
      : "";

  // Decide title based on action
  const title =
    action === "approve"
      ? "Approve Registration"
      : action === "reject"
      ? "Reject Registration"
      : action === "delete"
      ? "Delete Nomination"
      : action === "submitNomination"
      ? "Submit Nomination"
      : "";

  // Decide description based on action
  const description =
    action === "approve"
      ? "Are you sure you want to approve the user's registration? This action cannot be undone."
      : action === "reject"
      ? "Are you sure you want to reject the user's registration? This action cannot be undone."
      : action === "delete"
      ? "Are you sure you want to permanently delete this nomination? This action cannot be undone."
      : action === "submitNomination"
      ? "Are you sure you want to submit? You cannot edit after submission."
      : "";

  // Decide button label
  const buttonLabel =
    action === "approve"
      ? "Approve"
      : action === "reject"
      ? "Reject"
      : action === "delete"
      ? "Delete"
      : action === "submitNomination"
      ? "Submit"
      : "";

  // Decide button color
  const buttonColorClass =
    action === "approve" || action === "submitNomination"
      ? "bg-[var(--forest-green)] hover:bg-green-700"
      : "bg-[var(--maroon)] hover:bg-red-700";

  // Render modal
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-[100]">
      <div className="bg-white rounded-xl shadow-xl w-[442px] h-[343px] text-center relative p-6 flex flex-col justify-between">
        <button
          onClick={onCancelAction}
          className="absolute top-4 right-9 text-gray-800 text-3xl"
        >
          ×
        </button>
        <AlertTriangle
          size={50}
          className={`mx-auto mt-4 mb-4 ${colorClass}`}
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-lg text-gray-700 mb-6 px-6">{description}</p>
        <div className="flex justify-center space-x-10 mb-4">
          <button
            onClick={onCancelAction}
            className="w-32 px-8 py-1 rounded-sm border-2 border-gray-700 text-gray-800 font-bold hover:bg-gray-100 text-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmAction}
            className={`w-32 px-8 py-1 rounded-md text-white text-lg ${buttonColorClass}`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
