"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Section from "@/components/section";
import InputField from "@/components/input";
import CheckboxGroup from "@/components/checkbox";
import Button from "@/components/button";
import PerformanceEvaluationForm from "@/components/table/committee-scoring";
import UploadedFilesModal from "@/components/modals/nominator-documents";

export default function JuniorPage() {
  const searchParams = useSearchParams();
  const { id } = useParams();
  const router = useRouter();

  const nomineeName = searchParams.get("nomineename") || "";
  const nomineeId = searchParams.get("nomineeid") || "";

  const [showModal, setShowModal] = useState(false);

  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // Pre-select category if passed via query param `category` (slug)
  useEffect(() => {
    const categoryParam = searchParams.get("category") || "";
    if (categoryParam) {
      // options values: 'industrial' or 'junior'
      if (categoryParam === "industrial" || categoryParam === "junior") {
        setSelectedValues([categoryParam]);
      }
    }
    // run on mount / when searchParams change
  }, [searchParams]);

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) setSelectedValues((prev) => [...prev, value]);
    else setSelectedValues((prev) => prev.filter((v) => v !== value));
  };

  const options = [
    {
      label: "Industrial and Allied Professionals (SG 1 - 8)",
      value: "industrial",
    },
    { label: "Junior Professionals (SG 1 - 8)", value: "junior" },
  ];

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">
            Nominee Evaluation
          </h1>
          <p className="text-base text-[var(--dark-grey)]">
            Official scoring forms for the 2025 UPMin Gawad Tsansellor Para sa
            Pinakamahusay na Empleyadong Administratibo
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => router.push("/committee/committee-scoring")}
        >
          <div className="px-5 py-1">Go Back</div>
        </Button>
      </div>
      <Section
        width="w-full"
        height="h-auto"
        alignment="p-10 bg-[var(--category-grey)] gap-[24px]"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[20px] font-bold">
            Non-Teaching Personnel (Junior and Industrial Level)
          </h1>
        </div>

        {/* Nominee Info */}
        <InputField
          id="nominee-name"
          label="Name of Nominee"
          placeholder="Enter Nominee Name"
          value={nomineeName}
        />

        <InputField
          id="nominee-id"
          label="Nominee ID"
          placeholder="Nominee ID"
          value={nomineeId}
        />

        <CheckboxGroup
          label="Category"
          name="category"
          options={options}
          values={selectedValues}
          onChange={handleCheckboxChange}
        />

        {/* Nominee's Submitted Requirements and Documents */}
        <div className="py-6 flex flex-col gap-2">
          <h1 className="text-[20px] font-bold">
            Nominee’s Submitted Requirements and Documents
          </h1>
          <span className="text-[15px]">
            Nominee’s Submitted Requirements and Documents
          </span>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowModal(true)}
            className="py-2"
          >
            View Documents
          </Button>
          {showModal && (
            <UploadedFilesModal onClose={() => setShowModal(false)} />
          )}
        </div>

        <PerformanceEvaluationForm />
      </Section>
    </Section>
  );
}
