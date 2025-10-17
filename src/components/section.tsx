import React from "react";

interface SectionProps {
  children: React.ReactNode;
  height?: string; // accepts Tailwind height classes like "h-64" or "min-h-screen
  width?: string; // accepts Tailwind width classes like "w-64" or "w-full"
  alignment?: string; // accepts Tailwind flex alignment classes like "justify-center items-center"
}

export default function Section({
  children,
  height = "h-auto",
  width = "w-auto",
  alignment = "justify-center items-center",
}: SectionProps) {
  return (
    <div
      className={`${width} ${height} rounded-2xl shadow-[0_0px_5px_2px_rgba(0,0,0,0.10)] p-2 flex flex-col flex-wrap gap-2 ${alignment}`}
    >
      {children}
    </div>
  );
}
