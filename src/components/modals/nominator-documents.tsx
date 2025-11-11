"use client";

import React from "react";
import { X, Download, FileText } from "lucide-react";

interface FileItem {
  name: string;
  size: string;
}

const files: FileItem[] = [
  { name: "Certificate.png", size: "3.5 MB" },
  { name: "Certificate.png", size: "3.5 MB" },
  { name: "Certificate.png", size: "3.5 MB" },
  { name: "Certificate.png", size: "3.5 MB" },
  { name: "Certificate.png", size: "3.5 MB" },
  { name: "Certificate.png", size: "3.5 MB" },
  { name: "Certificate.png", size: "3.5 MB" },
];

export default function UploadedFilesModal({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40  flex justify-center items-center z-50">
      <div className="bg-white w-[90%] max-w-md max-h-[60vh] rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Uploaded Files</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto p-4 space-y-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex justify-between items-center border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-gray-600 w-5 h-5" />
                <div>
                  <p className="font-medium text-sm text-gray-800">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{file.size}</p>
                </div>
              </div>
              <button className="text-gray-600 hover:text-gray-800 transition">
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
