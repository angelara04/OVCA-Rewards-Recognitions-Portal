"use client";

import React, { useState } from "react";
import Card from "@/components/card";
import Button from "@/components/button";
import ProgressCard from "@/components/progressCard";
import Section from "@/components/section";
import ActionModal from "@/components/actionModal";
import AlertBanner from "@/components/alertBanner";
import { MoveRight } from "lucide-react";

export default function Page() {
  // ✅ State to control modal
  const [isModalOpen, setIsModalOpen] = useState(true);

  const [showAlert, setShowAlert] = useState(true);
  // ✅ Handle confirm action
  const handleConfirm = () => {
    console.log("Action confirmed!");
    setIsModalOpen(false); // close modal after confirming
  };

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Title */}
      <div className="flex flex-row justify-between items-center w-full my-2">
        <span className="font-bold text-3xl">HR Dashboard</span>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsModalOpen(true)} // ✅ Open modal when clicked
        >
          <div className="px-5 py-1">Review Registrations</div>
        </Button>
      </div>

      <span className="text-lg w-full mb-5">
        Manage the Gawad Tsanselor system and oversee all nomination processes
      </span>

      {/* Cards section */}
      <div className="w-full flex flex-col gap-2 sm:flex-row mb-5">
        <Card description="Nominations" number={10} />
        <Card description="Active Committee Members" number={5} />
        <Card description="Pending Registrations" number={20} />
        <Card description="Total Registered" number={20} />
      </div>

      {/* Portal Status and Manage Settings */}
      <Section width="w-full" alignment="p-10">
        <div className="flex flex-row justify-between">
          <span className="font-bold text-2xl">Portal Status</span>
          {/* Manage Setting Button */}
          <div className="flex flex-row gap-2 rounded-2xl p-2 transition-all duration-200 ease-out hover:scale-103 hover:-translate-y-0 hover:cursor-pointer  motion-safe:transform">
            <span className="text-[14px] text-[var(--forest-green)]">
              Manage Settings
            </span>
            <MoveRight className="text-[var(--forest-green)]" />
          </div>
        </div>

        {/* Progress Cards */}
        <div className="flex flex-row justify-center gap-4">
          <ProgressCard
            variant="countdown"
            title="Nomination Process"
            durationDays={10}
            endDate={new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)}
          />
          <ProgressCard
            variant="progress"
            title="Committee Evaluation"
            progress={100}
            durationDays={10}
          />
        </div>
      </Section>

      {/* ✅ Action Modal  Sample Use*/}
      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        variant="warning" // can be "reject" or "warning"
      />

      {showAlert && (
        <AlertBanner
          title="Alert: Portal Settings > Error Dates"
          message="Invalid date input. Please ensure both start and end dates are entered correctly."
          variant="error" // or "warning", "success"
          onClose={() => setShowAlert(false)}
          duration={7000} // 5 seconds
        />
      )}
    </Section>
  );
}
