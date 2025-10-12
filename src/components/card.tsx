import React from "react";

interface CardProps {
  description: string;
  number: number;
}

export default function Card({ description, number }: CardProps) {
  return (
    <div className=" w-full h-[94px] flex flex-col justify-center items-center border border-gray-300 rounded-sm p-4 gap-2">
      <span className="text-sm text-var(--black)">{description}</span>
      <span className="font-bold text-5xl text-[var(--maroon)]">{number}</span>
    </div>
  );
}
