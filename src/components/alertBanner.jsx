"use client";

import React, { useEffect, useState } from "react";
import { TriangleAlert, CheckCircle2, X } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

const variants = {
  error: {
    bg: "bg-[var(--light-red)]",
    text: "text-[var(--maroon)]",
  },
  warning: {
    bg: "bg-[var(--light-yellow)]",
    text: "text-[var(--dark-yellow)]",
  },
  success: {
    bg: "bg-[var(--light-green)]",
    text: "text-[var(--forest-green)]",
  },
};

export default function AlertBanner({
  title = "Alert",
  message = "Something went wrong.",
  variant = "error", // "error" | "warning" | "success"
  duration = 5000, // default 5 seconds
  onClose,
}) {
  const [visible, setVisible] = useState(true);
  const style = variants[variant] || variants.error;

  // Auto close after given duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 500); // wait for fade-out
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Choose icon based on variant
  const Icon = variant === "success" ? CheckCircle2 : TriangleAlert;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className={clsx(
            "fixed top-[10px] left-1/2 transform -translate-x-1/2 z-50",
            "flex items-center justify-between gap-3 p-4 rounded-xl shadow-md border border-gray-200 w-[90%] max-w-3xl",
            style.bg
          )}
        >
          {/* Left side: icon + text */}
          <div className="flex items-start gap-3">
            <Icon className={clsx("w-6 h-6 mt-1", style.text)} />
            <div>
              <p className={clsx("font-semibold", style.text)}>{title}</p>
              <p className={clsx("text-sm", style.text)}>{message}</p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(() => onClose?.(), 400);
            }}
          >
            <X className={clsx("w-5 h-5", style.text)} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
