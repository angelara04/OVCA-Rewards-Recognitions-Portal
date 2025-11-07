"use client";

import React, { useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Section from "@/components/section";
import InputField from "@/components/input";
import Button from "@/components/button";
import UploadedFilesModal from "@/components/modals/nominator-documents";
import PerformanceEvaluationForm_NonSupervisory from "@/components/table/committee-scoring-non-supervisory";

export default function NonSupervisoryPage() {
  const searchParams = useSearchParams();
  const { id } = useParams();
  const router = useRouter();

  // ✅ Read nominee info from query string
  const nomineeName = searchParams.get("nomineename") || "";
  const nomineeId = searchParams.get("nomineeid") || "";

  const [supervisorName, setSupervisorName] = useState("");
  const [supervisorUnit, setSupervisorUnit] = useState("");
  const [showModal, setShowModal] = useState(false);

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

      {/* Main Section */}
      <Section
        width="w-full"
        height="h-auto"
        alignment="p-10 bg-[var(--category-grey)] gap-[24px]"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[20px] font-bold">
            Non-Teaching Personnel (Non-Supervisory Level)
          </h1>
        </div>

        {/* ✅ Nominee info from URL */}
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

        {/* ✅ Supervisor details (manual input) */}
        <InputField
          id="supervisor-name"
          label="Name of Supervisor"
          placeholder="Enter Supervisor Name"
          value={supervisorName}
          onChange={setSupervisorName}
        />

        <InputField
          id="supervisor-unit"
          label="Unit"
          placeholder="Enter Supervisor Unit"
          value={supervisorUnit}
          onChange={setSupervisorUnit}
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

        <PerformanceEvaluationForm_NonSupervisory />
      </Section>
    </Section>
  );
}
