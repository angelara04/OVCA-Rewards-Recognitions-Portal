"use client";
import React, { useState } from "react";
import Button from "@/components/button";
import { Power } from 'lucide-react';
import Section from "@/components/section";
import Input from "@/components/input";
import PortalStatusBadge from "@/components/portal-status-badge";

export default function Page() {
    const [nominationStartDate, setNominationStartDate] = useState("");
    const [nominationEndDate, setNominationEndDate] = useState("");
    const [scoringStartDate, setScoringStartDate] = useState("");
    const [scoringEndDate, setScoringEndDate] = useState("");

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">
            Portal Settings
          </h1>
          <p className="text-base text-[var(--dark-grey)]">
            Manage nomination and voting periods, and control portal access
          </p>
        </div>
        <Button size="sm" variant="secondary">
          <div className="px-5 py-1">Back to Dashboard</div>
        </Button>
      </div>

      {/* Nomination Period */}
      <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] rounded-sm shadow-sm -mt-[1px] px-6 py-6 min-h-[35vh] flex flex-col relative content-area">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          <Power size={23} className="inline-flex mb-1 mr-1 text-[var(--maroon)]"/> Nomination Period Control
        </h2>

        <div className="w-full bg-[var(--settings-grey)] rounded-sm min-h-[10vh] py-4 px-4 mb-6 relative pr-24">
          <div className="mb-2">
            <h3 className="text-md font-semibold text-gray-900">Nomination Submission</h3>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <PortalStatusBadge startDate="" endDate="" />
          </div>
          <p className="text-sm text-[var(--dark-grey)]">Allow employees to submit nominations</p>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="nomination_start_date"
              label="Start Date"
              placeholder="Select a Date"
              value={nominationStartDate}
              onChange={setNominationStartDate}
              width="w-full"
              type="date"
            />
            <Input
              id="nomination_end_date"
              label="End Date"
              placeholder="Select a Date"
              value={nominationEndDate}
              onChange={setNominationEndDate}
              width="w-full"
              type="date"
            />
          </div>
        </form>
      </div>

      {/* Committee Scoring */}
      <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] rounded-sm shadow-sm mt-4 px-6 py-6 min-h-[35vh] flex flex-col relative content-area">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          <Power size={23} className="inline-flex mb-1 mr-1 text-[var(--maroon)]"/> Committee Scoring Period
        </h2>

        <div className="w-full bg-[var(--settings-grey)] rounded-sm min-h-[10vh] py-4 px-4 mb-6 relative pr-24">
          <div className="mb-2">
            <h3 className="text-md font-semibold text-gray-900">Committee Review & Scoring</h3>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <PortalStatusBadge startDate="" endDate="" />
          </div>
          <p className="text-sm text-[var(--dark-grey)]">Committee members can score nominations</p>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="scoring_start_date"
              label="Start Date"
              placeholder="Select a Date"
              value={scoringStartDate}
              onChange={setScoringStartDate}
              width="w-full"
              type="date"
            />
            <Input
              id="scoring_end_date"
              label="End Date"
              placeholder="Select a Date"
              value={scoringEndDate}
              onChange={setScoringEndDate}
              width="w-full"
              type="date"
            />
          </div>
        </form>
      </div>

      <div className="w-full">
      <div className="flex justify-end gap-3 mt-10 mb-2">
        <Button size="sm" variant="reset">
      <div className="px-8 py-2">Reset</div>
        </Button>
        <Button size="sm" variant="secondary">
      <div className="px-4 py-2">Save All Settings</div>
        </Button>
      </div>
      </div>
    </Section>
  );
}
