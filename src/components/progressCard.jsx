"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function ProgressCard({
  variant = "countdown", // "countdown" | "progress"
  title = "Nomination Process",
  durationDays = 10,
  progress = 0,
  startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // for demo
  endDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
}) {
  const [timeLeft, setTimeLeft] = useState({});
  const [status, setStatus] = useState("NOT STARTED");

  // Countdown logic
  useEffect(() => {
    if (variant !== "countdown") return;

    const now = new Date();
    if (now < startDate) {
      setStatus("NOT STARTED");
      setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      if (now < startDate) {
        setStatus("NOT STARTED");
        return;
      }
      const diff = endDate - now;
      if (diff <= 0) {
        clearInterval(interval);
        setStatus("CLOSED");
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, mins, secs });

      if (days <= 1) setStatus("ENDING SOON");
      else setStatus("OPEN");
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate, endDate, variant]);

  // Progress logic
  useEffect(() => {
    if (variant !== "progress") return;
    if (progress <= 0) setStatus("NOT STARTED");
    else if (progress >= 100) setStatus("CLOSED");
    else if (progress >= 90) setStatus("ALMOST DONE");
    else setStatus("OPEN");
  }, [progress, variant]);

  // Color mapping
  const statusColors = {
    "NOT STARTED": "#d1d5db",
    OPEN: "#15803d",
    "ENDING SOON": "#eab308",
    "ALMOST DONE": "#eab308",
    CLOSED: "#701a2f",
  };

  const color = statusColors[status];
  const textColor =
    status === "CLOSED"
      ? "text-[#701a2f]"
      : status === "NOT STARTED"
      ? "text-gray-500"
      : "text-green-800";

  const progressValue =
    variant === "progress"
      ? progress
      : Math.max(
          0,
          (timeLeft.days / durationDays) * 100 > 100
            ? 100
            : (timeLeft.days / durationDays) * 100
        );

  return (
    <motion.div
      className="flex items-center gap-4 border-[var(--outline-grey)] border-1 rounded-2xl p-6  bg-white max-w-[450px] w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Circular indicator */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="absolute inset-0" viewBox="0 0 36 36">
          <path
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <motion.path
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${progressValue}, 100`}
            strokeLinecap="round"
            initial={{ strokeDasharray: "0, 100" }}
            animate={{ strokeDasharray: `${progressValue}, 100` }}
            transition={{ duration: 1 }}
          />
        </svg>

        <div className={`text-center font-semibold ${textColor}`}>
          <div className="text-2xl">
            {variant === "countdown"
              ? timeLeft.days ?? 0
              : `${progress.toFixed(0)}%`}
          </div>
          <div className="text-xs">
            {status === "NOT STARTED"
              ? "Not started"
              : status === "CLOSED"
              ? "Closed"
              : variant === "countdown"
              ? "days left"
              : ""}
          </div>
        </div>
      </div>

      {/* Text info */}
      <div>
        <h2 className="font-bold text-xl">{title}</h2>
        <p className="text-gray-700 text-sm mt-1">
          {status === "NOT STARTED"
            ? "0 days 0 hours 0 mins 0 sec left"
            : status === "CLOSED"
            ? `${
                title.includes("Evaluation") ? "Evaluation" : "Nomination"
              } has ended`
            : variant === "countdown"
            ? `${timeLeft.days ?? 0} days ${timeLeft.hours ?? 0} hours ${
                timeLeft.mins ?? 0
              } mins ${timeLeft.secs ?? 0} sec left`
            : `${progress.toFixed(0)}% complete`}
        </p>

        <div className="mt-2 text-sm text-gray-500">
          Status:{" "}
          <span
            className={`px-3 py-1 rounded-full border font-semibold ${
              status === "CLOSED"
                ? "text-[#701a2f] border-[#701a2f]"
                : status === "NOT STARTED"
                ? "text-gray-500 border-gray-400"
                : "text-green-700 border-green-700"
            }`}
          >
            • {status}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
