"use client";
import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  action: "approve" | "reject" | "delete" | "submitNomination" | "disqualify";
  onCancelAction: () => void;
  onConfirmAction: () => void;
  // Optional overrides for custom usages
  titleOverride?: string;
  descriptionOverride?: string;
  // If provided, modal will auto-confirm after this many seconds and call `onConfirmAction`
  autoCloseSeconds?: number;
  // Optional label override for the confirm button
  confirmLabel?: string;
  // If true, do not render the Cancel button (useful for forced redirects)
  hideCancel?: boolean;
}

// ConfirmModal component
export default function ConfirmModal({
  action,
  onCancelAction,
  onConfirmAction,
  titleOverride,
  descriptionOverride,
  autoCloseSeconds,
  confirmLabel,
  hideCancel = false,
}: ConfirmModalProps) {
  // Decide color based on action

  const colorClass =
    action === "approve" || action === "submitNomination"
      ? "text-[var(--forest-green)]"
      : action === "reject" || action === "delete" || action === "disqualify"
      ? "text-[var(--maroon)]"
      : "";

  const title =
    action === "approve"
      ? "Approve Registration"
      : action === "reject"
      ? "Reject Registration"
      : action === "delete"
      ? "Delete Nomination"
      : action === "disqualify"
      ? "Disqualify Nomination"
      : action === "submitNomination"
      ? "Submit Nomination"
      : "";

  const description =
    action === "approve"
      ? "Are you sure you want to approve the user's registration? This action cannot be undone."
      : action === "reject"
      ? "Are you sure you want to reject the user's registration? This action cannot be undone."
      : action === "delete"
      ? "Are you sure you want to permanently delete this nomination? This action cannot be undone."
      : action === "disqualify"
      ? "Are you sure you want to disqualify this nomination? All scores will be submitted as 0."
      : action === "submitNomination"
      ? "Are you sure you want to submit? You cannot edit after submission."
      : "";

  const buttonLabel =
    action === "approve"
      ? "Approve"
      : action === "reject"
      ? "Reject"
      : action === "delete"
      ? "Delete"
      : action === "disqualify"
      ? "Disqualify"
      : action === "submitNomination"
      ? "Submit"
      : "";

  const buttonColorClass =
    action === "approve" || action === "submitNomination"
      ? "bg-[var(--forest-green)] hover:bg-green-700"
      : "bg-[var(--maroon)] hover:bg-red-700";
  // allow title/description overrides (for custom modal uses like 'access blocked')
  const displayedTitle = titleOverride ?? title;
  const displayedDescription = descriptionOverride ?? description;

  const [counter, setCounter] = useState<number | null>(
    autoCloseSeconds ? autoCloseSeconds : null
  );

  useEffect(() => {
    if (!autoCloseSeconds) return undefined;
    if (counter === null) return undefined;

    if (counter <= 0) {
      // auto-confirm
      onConfirmAction();
      return undefined;
    }

    const t = setTimeout(
      () => setCounter((c) => (c !== null ? c - 1 : c)),
      1000
    );
    return () => clearTimeout(t);
  }, [counter, autoCloseSeconds, onConfirmAction]);

  const displayedConfirmLabel = confirmLabel ?? buttonLabel;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[200]">
      <div className="bg-white rounded-xl shadow-xl w-[442px] max-w-[90%] text-center relative p-6 flex flex-col justify-between">
        <button
          onClick={onCancelAction}
          className="absolute top-4 right-4 text-gray-800 text-2xl"
        >
          ×
        </button>
        <AlertTriangle
          size={50}
          className={`mx-auto mt-4 mb-4 ${colorClass}`}
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {displayedTitle}
        </h2>
        <p className="text-lg text-gray-700 mb-6 px-6">
          {displayedDescription}
          {counter !== null && counter > 0 ? (
            <span className="block mt-3 text-sm text-gray-500">
              Redirecting in {counter} second{counter > 1 ? "s" : ""}...
            </span>
          ) : null}
        </p>
        <div className="flex justify-center gap-6 mb-4">
          {!hideCancel && (
            <button
              onClick={onCancelAction}
              className="px-6 py-2 rounded-sm border-2 border-gray-700 text-gray-800 font-bold hover:bg-gray-100 text-base"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirmAction}
            className={`px-6 py-2 rounded-md text-white text-base ${buttonColorClass}`}
          >
            {displayedConfirmLabel}
            {counter !== null && counter > 0 ? ` (${counter})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
