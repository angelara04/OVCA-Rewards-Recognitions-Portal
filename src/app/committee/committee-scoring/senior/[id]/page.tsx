"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Section from "@/components/section";
import InputField from "@/components/input";
import CheckboxGroup from "@/components/checkbox";
import Button from "@/components/button";
import PerformanceEvaluationForm from "@/components/table/committee-scoring";
import UploadedFilesModal from "@/components/modals/nominator-documents";
import { getReviewContext } from "@/app/admin/committee/actions";
export default function SeniorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const nomineeName = searchParams.get("nomineename") || "";
  const nomineeId = searchParams.get("nomineeid") || "";

  const [showModal, setShowModal] = useState(false);

  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  //REVIEW
  const [reviewContext, setReviewContext] = useState<any | null>(null);

  useEffect(() => {
    // Only run if nomineeId exists
    if (!nomineeId) {
      setReviewContext(null);
      setLoading(false);
      return;
    }

    // IIFE to allow async call in useEffect
    (async () => {
      setLoading(true);
      try {
        const ctx = await getReviewContext(nomineeId);

        // Only set if ctx is valid
        if (ctx) {
          setReviewContext(ctx);
          console.log("Review Context fetched:", ctx);
        } else {
          setReviewContext(null);
          console.warn("No review context returned for nomineeId:", nomineeId);
        }
      } catch (err) {
        console.error(
          "Failed to fetch review context for nomineeId:",
          nomineeId,
          err
        );
        setReviewContext(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [nomineeId]);
  useEffect(() => {
    if (reviewContext) {
      console.log("Nomination:", reviewContext.nomination);
      console.log("Rubric:", reviewContext.rubric);
      console.log("Existing Review:", reviewContext.existingReview);
      console.log("Is Locked:", reviewContext.isLocked);
    }
  }, [reviewContext]);

  const options = [
    {
      label: "Senior Professional (SG 9 and above, Non-Chief of Office)",
      value: "Non-Teaching Personnel (Senior Level)",
    },
  ];

  // Pre-select category if passed via query param `category` (slug)
  useEffect(() => {
    const categoryParam = searchParams.get("category") || "";
    if (!categoryParam) return;

    const allowed = options.map((o) => o.value);
    if (allowed.includes(categoryParam)) {
      setSelectedValues([categoryParam]);
    }

    // run on mount / when searchParams change
  }, [searchParams]);

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) setSelectedValues((prev) => [...prev, value]);
    else setSelectedValues((prev) => prev.filter((v) => v !== value));
  };

  return (
    <Section
      width="w-full"
      height="min-h-screen"
      alignment="items-center justify-center p-10"
    >
      {loading ? (
        // ---------------------- LOADING STATE ----------------------
        <div className="flex items-center justify-center p-4 flex-col gap-2">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-[var(--maroon)] rounded-full animate-spin"></div>
          <span className="text-[var(--dark-grey)]">Loading...</span>
        </div>
      ) : (
        // ---------------------- MAIN CONTENT ----------------------
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
            <div>
              <h1 className="text-[28px] font-bold text-[var(--black)]">
                Nominee Evaluation
              </h1>
              <p className="text-base text-[var(--dark-grey)]">
                Official scoring forms for the 2025 UPMin Gawad Tsansellor Para
                sa Pinakamahusay na Empleyadong Administratibo
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

          {/* Main Content Section */}
          <Section
            width="w-full"
            height="h-auto"
            alignment="p-10 bg-[var(--category-grey)] gap-[24px]"
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-[20px] font-bold">
                Non-Teaching Personnel (Senior Level)
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
              disabled={
                (reviewContext as any)?.status === "completed" ||
                (reviewContext as any)?.existingReview?.status === "completed"
              }
            />

            {/* Nominee’s Submitted Requirements */}
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
                <UploadedFilesModal
                  onClose={() => setShowModal(false)}
                  attachments={
                    (reviewContext as any)?.nomination?.attachments || []
                  }
                />
              )}
            </div>

            {/* Evaluation Form */}
            <PerformanceEvaluationForm reviewContext={reviewContext} />
          </Section>
        </>
      )}
    </Section>
  );
}
