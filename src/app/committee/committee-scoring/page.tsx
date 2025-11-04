"use client";

import Button from "@/components/button";
import Section from "@/components/section";
import Dropdown from "@/components/dropdown";
import React from "react";
import { Category } from "@/app/store/category";

interface CommitteeScoringProps {
  children?: React.ReactNode; // ✅ define children as a prop
}

export default function CommitteeScoring({ children }: CommitteeScoringProps) {
  const { selectedCategory } = Category(); //get only the current category

  return (
    <Section
      width="w-full"
      height="min-h-screen"
      alignment="items-center p-10  "
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">
            Committee Scoring
          </h1>
          <p className="text-base text-[var(--dark-grey)]">
            Welcome to your nomination dashboard. Here you can create new
            nominations and track existing ones.
          </p>
        </div>
        <Button size="sm" variant="secondary">
          <div className="px-5 py-1">Back to Dashboard</div>
        </Button>
      </div>

      {/* Dropdown */}
      <Section width="w-full" height="h-auto" alignment="p-10 mb-4">
        <h2 className="font-bold text-2xl text-[var(--black)] mb-4">
          Select Nominee Category
        </h2>

        <span className="text-lg w-full mb-5">Nominee Category</span>
        <Dropdown
          displayText={selectedCategory}
          options={[
            {
              label: "Non-Teaching Personnel (Junior and Industrial Level)",
              href: "/committee/committee-scoring/junior",
            },
            {
              label: "Non-Teaching Personnel (Senior Level)",
              href: "/committee/committee-scoring/senior",
            },
            {
              label: "Non-Teaching Personnel (Non-Supervisory Level)",
              href: "/committee/committee-scoring/non-supervisory",
            },
          ]}
        />
      </Section>

      {/*  Render children here */}

      {children}
    </Section>
  );
}
