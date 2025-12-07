"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ProgressCard({
  variant = "countdown", // "countdown" | "progress"
  title = "Nomination Process",
  durationDays = 10,
  progress = 0,
  startDate,
  endDate,
  status: propStatus,
}) {
  const [internalStatus, setInternalStatus] = useState("NOT_STARTED");
  const [timeLeft, setTimeLeft] = useState({});

  // Use the passed prop if available, otherwise use internal state
  const currentStatus = propStatus || internalStatus;

  // Countdown logic
  useEffect(() => {
    if (variant !== "countdown") return;

    if (!startDate || !endDate) {
      if (!propStatus) setInternalStatus("UNSCHEDULED");
      setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const updateTimer = () => {
      const now = new Date();

      if (now < start) {
        if (!propStatus) setInternalStatus("NOT_STARTED");
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      const diff = end - now;

      if (diff <= 0) {
        if (!propStatus) setInternalStatus("CLOSED");
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, mins, secs });

      if (!propStatus) {
        if (days <= 1) setInternalStatus("ENDING SOON");
        else setInternalStatus("OPEN");
      }
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startDate, endDate, variant, propStatus]);

  // Progress logic
  useEffect(() => {
    if (variant !== "progress") return;
    
    if (propStatus) return;

    if (progress <= 0) setInternalStatus("NOT_STARTED");
    else if (progress >= 100) setInternalStatus("CLOSED");
    else if (progress >= 90) setInternalStatus("ALMOST DONE");
    else setInternalStatus("OPEN");
  }, [progress, variant, propStatus]);

  // Color mapping
  const statusColors = {
    "UNSCHEDULED": "#9ca3af",
    "NOT_STARTED": "#9ca3af",
    "OPEN": "#15803d",
    "ENDING SOON": "#eab308",
    "ALMOST DONE": "#eab308",
    "CLOSED": "#701a2f",
  };

  const color = statusColors[currentStatus] || statusColors["NOT_STARTED"];
  
  const isInactive = currentStatus === "NOT_STARTED" || currentStatus === "UNSCHEDULED";
  
  const textColor =
    currentStatus === "CLOSED"
      ? "text-[#701a2f]"
      : isInactive
      ? "text-[var(--dark-grey)]"
      : "text-green-800";

  // Calculate Progress Value for the Ring
  let progressValue = 0;
  
  if (currentStatus === "CLOSED") {
      progressValue = 100;
  } else if (variant === "progress") {
      progressValue = progress;
  } else { 
      // Countdown Logic: Calculate Time Elapsed
      // durationDays is the TOTAL period length
      // timeLeft.days is the remaining days
      
      const daysRemaining = timeLeft.days ?? 0;
      // We calculate elapsed days. Note: timeLeft includes partial days via hours/mins, 
      // but for the visual circle, days precision is usually enough or we'd need timestamps.
      const elapsed = durationDays - daysRemaining;
      
      // Prevent division by zero and negative values
      if (durationDays > 0) {
        progressValue = (elapsed / durationDays) * 100;
      }
      
      // Clamp 0-100
      progressValue = Math.min(Math.max(progressValue, 0), 100);
  }

  const displayDays = timeLeft.days ?? 0;
  const displayHours = timeLeft.hours ?? 0;
  const displayMins = timeLeft.mins ?? 0;
  const displaySecs = timeLeft.secs ?? 0;

  return (
    <motion.div
      className="flex items-center gap-4 border-[var(--outline-grey)] border-1 rounded-2xl p-6 bg-white max-w-[450px] w-full"
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
              ? currentStatus === "CLOSED" ? 0 : displayDays
              : `${progressValue.toFixed(0)}%`}
          </div>
          <div className="text-xs">
            {isInactive
              ? "Not started"
              : currentStatus === "CLOSED"
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
          {isInactive
            ? "0 days 0 hours 0 mins 0 sec left"
            : currentStatus === "CLOSED"
            ? `${title.includes("Evaluation") ? "Evaluation" : "Nomination"} has ended`
            : variant === "countdown"
            ? `${displayDays} days ${displayHours} hours ${displayMins} mins ${displaySecs} sec left`
            : `${progressValue.toFixed(0)}% complete`}
        </p>

        <div className="mt-2 text-sm text-gray-500">
          Status:{" "}
          <span
            className={`px-3 py-1 rounded-full border font-semibold ${
              currentStatus === "CLOSED"
                ? "text-[var(--maroon)] border-[var(--maroon)]"
                : isInactive
                ? "text-[var(--dark-grey)] border-[var(--dark-grey)]"
                : "text-[var(--forest-green)] border-[var(--forest-green)]"
            }`}
          >
            {/* Replace underscores with spaces for display */}
            • {currentStatus.replace(/_/g, " ")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}