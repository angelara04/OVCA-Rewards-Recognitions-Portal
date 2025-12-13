import React from "react";

interface NominationDescriptionProps {
  description?: string;
}

export default function NominationDescription({ description }: NominationDescriptionProps) {
  // If there is no description, don't render anything to keep the UI clean
  if (!description) return null;

  return (
    <div className="py-2 flex flex-col gap-2">
      <h1 className="text-[16px]">
        Outstanding Achievements of the Nominee
        <span className="text-[12px] italic text-[var(--dark-grey)]">
        {" "}(Submitted by Nominator)
      </span>
      </h1>
      
      {/* Read-only Text Display */}
      <div className="w-full bg-white border border-[var(--outline-grey)] rounded-lg p-4 text-sm text-[var(--black)] leading-relaxed whitespace-pre-wrap shadow-sm mb-3">
        {description}
      </div>
    </div>
  );
}