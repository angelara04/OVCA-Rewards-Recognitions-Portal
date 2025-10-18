"use client";

import React from "react";
import { useState } from "react";
import CommitteeScoring from "../page";
import Section from "@/components/section";
import InputField from "@/components/input";
import CheckboxGroup from "@/components/checkbox";
import PerformanceEvaluationForm_NonSupervisory from "@/components/table/committee-scoring-non-supervisory";
export default function page() {
  const [supervisorName, setsupervisorName] = React.useState(""); // State for supervisor name input
  const [supervisorUnit, setsupervisorUnit] = React.useState(""); // State for supervisor unit input

  return (
    <div>
      <CommitteeScoring>
        <Section
          width="w-full"
          height="h-auto"
          alignment="p-10 bg-[var(--category-grey)] gap-[24px]"
        >
          <h1 className="text-[19px] font-bold">
            {" "}
            Non-Teaching Personnel (Non-Supervisory Level){" "}
          </h1>

          <InputField
            id="supervisor-name"
            label="Name of Supervisor"
            placeholder="Enter Supervisor Name"
            value={supervisorName}
            onChange={setsupervisorName}
          />

          <InputField
            id="supervisor-unit"
            label="Unit"
            placeholder="Enter Supervisor Unit"
            value={supervisorUnit}
            onChange={setsupervisorUnit}
          />
          <PerformanceEvaluationForm_NonSupervisory />
        </Section>
      </CommitteeScoring>
    </div>
  );
}
