"use client";

import React from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Section from "@/components/section";
import InputField from "@/components/input";
import Button from "@/components/button";
import UploadedFilesModal from "@/components/modals/nominator-documents";
import PerformanceEvaluationForm_NonSupervisory from "@/components/table/committee-scoring-non-supervisory";
import { getReviewContext } from "@/app/admin/committee/actions";
import { useState, useEffect } from "react";

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

  const [loading, setLoading] = useState<boolean>(true);
  const [reviewContext, setReviewContext] = useState<any | null>(null);

  useEffect(() => {
    if (!nomineeId) {
      setReviewContext(null);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const ctx = await getReviewContext(nomineeId);
        if (ctx) {
          setReviewContext(ctx);
          console.log("Non-supervisory: Review Context fetched:", ctx);
        } else setReviewContext(null);
      } catch (err) {
        console.error("Failed to fetch review context:", err);
        setReviewContext(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [nomineeId]);

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {loading ? (
        <div className="flex items-center justify-center p-4 flex-col gap-2">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-[var(--maroon)] rounded-full animate-spin"></div>
          <span className="text-[var(--dark-grey)]">Loading...</span>
        </div>
      ) : (
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
                <UploadedFilesModal
                  onClose={() => setShowModal(false)}
                  attachments={
                    (reviewContext as any)?.nomination?.attachments || []
                  }
                />
              )}
            </div>

            {reviewContext ? (
              <PerformanceEvaluationForm_NonSupervisory
                reviewContext={reviewContext}
              />
            ) : (
              <div className="p-4 text-center text-[var(--dark-grey)]">
                No review found for this nominee.
              </div>
            )}
          </Section>
        </>
      )}
    </Section>
  );
}
