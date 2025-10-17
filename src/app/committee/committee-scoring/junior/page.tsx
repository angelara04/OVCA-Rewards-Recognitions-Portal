"use client";

import React from "react";
import { useState } from "react";
import CommitteeScoring from "../page";
import Section from "@/components/section";
import InputField from "@/components/input";
import CheckboxGroup from "@/components/checkbox";
import PerformanceEvaluationForm from "@/components/table/committee-scoring";
export default function page() {
  const [nomineeName, setNomineeName] = React.useState(""); // State for nominee name input
  const [selectedValues, setSelectedValues] = useState<string[]>([]); // State for checkbox values

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedValues([...selectedValues, value]);
    } else {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    }
  };

  const options = [
    {
      label: "Industrial and Allied Professionals (SG 1 - 8)",
      value: "industrial",
    },
    {
      label: "Junior Professionals (SG 1 - 8)",
      value: "junior",
    },
  ]; // Checkbox options

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
            Non-Teaching Personnel (Junior and Industrial Level){" "}
          </h1>

          <InputField
            id="nominee-name"
            label="Name of Nominee"
            placeholder="Enter Nominee Name"
            value={nomineeName}
            onChange={setNomineeName}
          />

          <CheckboxGroup
            label="Category"
            name="category"
            options={options}
            values={selectedValues}
            onChange={handleCheckboxChange}
          />

          <PerformanceEvaluationForm />
        </Section>
      </CommitteeScoring>
    </div>
  );
}
