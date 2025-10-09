import React from "react";

interface SectionProps {
  children: React.ReactNode;
}

export default function Section({ children }: SectionProps) {
  return (
    <div className="w-auto h-auto rounded-2xl bg-white shadow-[0_0px_10px_2px_rgba(0,0,0,0.10)] p-2 flex flex-col flex-wrap gap-2 justify-center items-center">
      {children}
    </div>
  );
}
