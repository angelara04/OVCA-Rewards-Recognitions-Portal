"use client";

import React, { useState } from "react";
import { X, FileText, TriangleAlert } from "lucide-react";
import Button from "@/components/button";
import ConfirmModal from "@/components/confirm-modal";
import { disqualifyNomination } from "@/app/admin/committee/actions";
import { useRouter } from "next/navigation";

type Attachment = {
  id: string;
  file_name: string;
  drive_file_id: string;
  file_type?: string;
  file_size?: number;
  attachment_type?: string;
};

function formatBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

export default function UploadedFilesModal({
  onCloseAction,
  attachments = [],
  nominationId,
  showToast,
}: {
  onCloseAction: () => void;
  attachments?: Attachment[];
  nominationId: string;
  showToast?: (message: string, type: "success" | "error") => void;
}) {
  const [disqualifying, setDisqualifying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDisqualifyConfirm = async () => {
    if (!nominationId) return;

    setShowConfirm(false);
    setDisqualifying(true);
    try {
      const res = await disqualifyNomination(nominationId);
      if (res.success) {
        showToast?.("Nomination disqualified successfully!", "success");
        router.refresh();
        onCloseAction();
      } else {
        showToast?.(res.message || "Failed to disqualify nomination.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast?.("Unexpected error occurred.", "error");
    } finally {
      setDisqualifying(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
        <div className="bg-white w-[90%] max-w-md max-h-[60vh] rounded-2xl shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Uploaded Files</h2>
            <button onClick={onCloseAction} className="text-gray-500 hover:text-gray-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable list */}
          <div className="overflow-y-auto p-4 space-y-2 flex-1">
            {attachments.length === 0 ? (
              <div className="text-center text-sm text-[var(--dark-grey)]">
                No attachments available.
              </div>
            ) : (
              attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex justify-between items-center border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-[var(--black)] w-5 h-5" />
                    <div>
                      <p className="font-medium text-sm text-gray-800">{att.file_name}</p>
                      <p className="text-xs text-gray-500">
                        {att.attachment_type || "attachment"} • {formatBytes(att.file_size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <a href={`https://drive.google.com/file/d/${att.drive_file_id}/view`} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm" className="px-4">View</Button>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Disqualify Button */}
          <div className="p-4 border-t border-gray-200 flex justify-end">
            <Button
              variant="reset"
              onClick={() => setShowConfirm(true)}
              disabled={disqualifying}
              className="p-6 flex-1 justify-center py-2"
            >
              {disqualifying ? "Processing..." : "Disqualify Nominee - Missing Required Documents"}
            </Button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          action="disqualify"
          onCancelAction={() => setShowConfirm(false)}
          onConfirmAction={handleDisqualifyConfirm}
        />
      )}
    </>
  );
}
