"use client";
import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  action: "approve" | "reject";
  onCancelAction: () => void;
  onConfirmAction: () => void;
}

export default function ConfirmModal({ action, onCancelAction, onConfirmAction }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-[100]">
      <div className="bg-white rounded-xl shadow-xl w-[442px] h-[343px] text-center relative p-6 flex flex-col justify-between">
        <button onClick={onCancelAction} className="absolute top-4 right-9 text-gray-800 text-3xl">
          ×
        </button>
        <AlertTriangle
          size={50}
          className={`mx-auto mt-4 mb-4 ${action === "approve" ? "text-[var(--forest-green)]" : "text-[var(--maroon)]"}`}
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {action === "approve" ? "Approved Registration" : "Rejected Registration"}
        </h2>
        <p className="text-lg text-gray-700 mb-6 px-6">
          {action === "approve"
            ? "Are you sure you want to approve the user's registration? This action cannot be undone."
            : "Are you sure you want to reject the user's registration? This action cannot be undone."}
        </p>
        <div className="flex justify-center space-x-10 mb-4">
          <button
            onClick={onCancelAction}
            className="w-32 px-8 py-1 rounded-sm border-2 border-gray-700 text-gray-800 font-bold hover:bg-gray-100 text-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmAction}
            className={`w-32 px-8 py-1 rounded-md text-white text-lg ${
              action === "approve" ? "bg-[var(--forest-green)] hover:bg-green-700" : "bg-[var(--maroon)] hover:bg-red-700"
            }`}
          >
            {action === "approve" ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
