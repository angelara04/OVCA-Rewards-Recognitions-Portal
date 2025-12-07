"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Section from "@/components/section";
import InputField from "@/components/input";
import CheckboxGroup from "@/components/checkbox";
import Button from "@/components/button";
import PerformanceEvaluationForm from "@/components/table/committee-scoring";
import UploadedFilesModal from "@/components/modals/nominator-documents";
import { getReviewContext, saveCommitteeReview, disqualifyNomination } from "@/app/admin/committee/actions"; 
import { TriangleAlert, X, CheckCircle } from "lucide-react";


const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-8 py-5 rounded-lg shadow-lg text-white transition-all duration-300 transform translate-y-0 ${
      type === "success" ? "bg-[#155724]" : "bg-[var(--maroon)]"
    }`}>
      {type === "success" ? <CheckCircle size={20} /> : <TriangleAlert size={20} />}
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80"><X size={16} /></button>
    </div>
  );
};

// --- CONFIRMATION MODAL COMPONENT ---
const SubmitConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isSubmitting 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  isSubmitting: boolean; 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose} 
          disabled={isSubmitting}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center text-center p-4">
          <div className="mb-6">
             <TriangleAlert className="h-10 w-10 text-[#155724]" />
          </div>
          <h3 className="mb-4 text-xl font-bold text-[#1e293b]">Submit Nomination</h3>
          <p className="mb-6 text-sm text-[#475569] w-70">
            Are you sure you want to submit? You cannot edit after submission.
          </p>
          <div className="flex w-60 gap-3">
            <Button 
              size="md" 
              variant="secondary" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="flex-1 justify-center bg-white text-[var(--dark-green)] border-[var(--dark-green)] border-2"
            >
              Cancel
            </Button>
            <Button 
              size="md" 
              variant="primary"
              onClick={onConfirm} 
              disabled={isSubmitting} 
              className="flex-1 justify-center border-none text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}



export default function JuniorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const nomineeName = searchParams.get("nomineename") || "";
  const nomineeId = searchParams.get("nomineeid") || "";

  const [showModal, setShowModal] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewContext, setReviewContext] = useState<any | null>(null);
  
  // STATE
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [processingAction, setProcessingAction] = useState<"draft" | "submit" | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [ipcr, setIpcr] = useState({ y2022: "", y2023: "", y2024: "" });
  const [comments, setComments] = useState("");

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

const [disqualifying, setDisqualifying] = useState(false);

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
          if (ctx.existingReview) {
            setComments(ctx.existingReview.comments || "");
            if (ctx.existingReview.scores_json) {
              const { meta_ipcr_breakdown, ...savedScores } = ctx.existingReview.scores_json;
              setScores(savedScores);
              if (meta_ipcr_breakdown) {
                setIpcr({
                  y2022: meta_ipcr_breakdown.y2022 !== undefined ? String(meta_ipcr_breakdown.y2022) : "",
                  y2023: meta_ipcr_breakdown.y2023 !== undefined ? String(meta_ipcr_breakdown.y2023) : "",
                  y2024: meta_ipcr_breakdown.y2024 !== undefined ? String(meta_ipcr_breakdown.y2024) : ""
                });
              }
            }
          }
        } else {
          setReviewContext(null);
        }
      } catch (err) {
        console.error("Failed to fetch review context:", err);
        setReviewContext(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [nomineeId]);

  const options = [
    { label: "Industrial and Allied Professionals (SG 1 - 8)", value: "Industrial and Allied Professionals (SG 1 - 8)" },
    { label: "Junior Professionals (SG 1 - 8)", value: "Junior Professionals (SG 1 - 8)" },
  ];

  useEffect(() => {
    const categoryParam = searchParams.get("category") || "";
    if (categoryParam) {
      if (categoryParam === "Industrial and Allied Professionals (SG 1 - 8)" || categoryParam === "Junior Professionals (SG 1 - 8)") {
        setSelectedValues([categoryParam]);
      }
    }
  }, [searchParams]);

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) setSelectedValues((prev) => [...prev, value]);
    else setSelectedValues((prev) => prev.filter((v) => v !== value));
  };

  const processSubmission = async (actionType: "draft" | "submit") => {
    if (!nomineeId) return;
    setProcessingAction(actionType);

    const val1 = parseFloat(ipcr.y2022) || 0;
    const val2 = parseFloat(ipcr.y2023) || 0;
    const val3 = parseFloat(ipcr.y2024) || 0;
    const calculatedAvg = parseFloat(((val1 + val2 + val3) / 3).toFixed(2));

    let scoresPayload = { ...scores };
    if (reviewContext?.rubric?.criteria) {
      const ipcrCriterion = reviewContext.rubric.criteria.find(
        (c: any) => c.label.toLowerCase().includes("ipcr")
      );
      if (ipcrCriterion) {
        scoresPayload[ipcrCriterion.id] = calculatedAvg;
      }
    }

    const formData = new FormData();
    formData.append("nomination_id", nomineeId);
    formData.append("action", actionType);
    formData.append("comments", comments);
    formData.append("y2022", ipcr.y2022);
    formData.append("y2023", ipcr.y2023);
    formData.append("y2024", ipcr.y2024);

    Object.entries(scoresPayload).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    try {
      const res = await saveCommitteeReview(formData);
      if (res.success) {
        if (actionType === "submit") {
          showToast("Successfully Saved Scoring", "success");
          setTimeout(() => {
            router.push("/committee"); 
          }, 1500);
        } else {
          showToast("Draft saved successfully", "success");
        }
      } else {
        showToast(res.message || "Error", "error");
      }
    } catch (error) {
      console.error("Submission error:", error);
      showToast("An unexpected error occurred.", "error");
    } finally {
      if (actionType !== "submit") setProcessingAction(null);
      setShowSubmitConfirmation(false);
    }
  };

  const handleActionClick = (actionType: "draft" | "submit") => {
    if (actionType === "draft") {
      processSubmission("draft");
    } else {
      const isIpcrInvalid = !ipcr.y2022 || ipcr.y2022.trim() === "" || !ipcr.y2023 || ipcr.y2023.trim() === "" || !ipcr.y2024 || ipcr.y2024.trim() === "";
      if (isIpcrInvalid) {
        showToast("Please fill in all IPCR Rating fields before submitting.", "error");
        return;
      }
      
      let tempScores = { ...scores };
      const val1 = parseFloat(ipcr.y2022) || 0;
      const val2 = parseFloat(ipcr.y2023) || 0;
      const val3 = parseFloat(ipcr.y2024) || 0;
      const calculatedAvg = parseFloat(((val1 + val2 + val3) / 3).toFixed(2));

      if (reviewContext?.rubric?.criteria) {
        const ipcrCriterion = reviewContext.rubric.criteria.find((c: any) => c.label.toLowerCase().includes("ipcr"));
        if (ipcrCriterion) tempScores[ipcrCriterion.id] = calculatedAvg;

        for (const criterion of reviewContext.rubric.criteria) {
          if (tempScores[criterion.id] === undefined) {
            showToast(`Please provide a score for: ${criterion.label}`, "error");
            return;
          }
        }
      }
      setShowSubmitConfirmation(true);
    }
  }
  const [showDisqualifyConfirm, setShowDisqualifyConfirm] = useState(false);
  const isCompleted = (reviewContext as any)?.isLocked || (reviewContext as any)?.existingReview?.status === "completed";
   const handleDisqualifyConfirm = async () => {
  if (!nomineeId) return;

  setShowDisqualifyConfirm(false);
  setDisqualifying(true);

  try {
    const res = await disqualifyNomination(nomineeId);
    if (res.success) {
      showToast("Nomination disqualified successfully!", "success");
      router.refresh(); // refresh the page
    } else {
      showToast(res.message || "Failed to disqualify nomination.", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Unexpected error occurred.", "error");
  } finally {
    setDisqualifying(false);
  }
};

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center justify-center p-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <SubmitConfirmationModal 
        isOpen={showSubmitConfirmation}
        onClose={() => setShowSubmitConfirmation(false)}
        onConfirm={() => processSubmission("submit")}
        isSubmitting={processingAction === "submit"}
      />

      {loading ? (
        <div className="flex items-center justify-center p-4 flex-col gap-2">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-[var(--maroon)] rounded-full animate-spin"></div>
          <span className="text-[var(--dark-grey)]">Loading...</span>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
            <div>
              <h1 className="text-[28px] font-bold text-[var(--black)]">Nominee Evaluation</h1>
              <p className="text-base text-[var(--dark-grey)]">Official scoring forms for the 2025 UPMin Gawad Tsansellor...</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => router.push("/committee/committee-scoring")}>
              <div className="px-5 py-1">Go Back</div>
            </Button>
          </div>

          <Section width="w-full" height="h-auto" alignment="p-10 bg-[var(--category-grey)] gap-[24px]">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-[20px] font-bold">Non-Teaching Personnel (Junior and Industrial Level)</h1>
            </div>

            <InputField id="nominee-name" label="Name of Nominee" placeholder="Enter Nominee Name" value={nomineeName} />
            <InputField id="nominee-id" label="Nominee ID" placeholder="Nominee ID" value={nomineeId} />

            <CheckboxGroup
              label="Category"
              name="category"
              options={options}
              values={selectedValues}
              onChange={handleCheckboxChange}
              disabled={isCompleted}
            />

            <div className="py-6 flex flex-col gap-2">
              <h1 className="text-[20px] font-bold">Nominee’s Submitted Requirements and Documents</h1>
              <span className="text-[15px]">Nominee’s Submitted Requirements and Documents</span>
              <Button size="sm" variant="primary" onClick={() => setShowModal(true)} className="py-2">View Documents</Button>
              {showModal && (
                <UploadedFilesModal
                  onCloseAction={() => setShowModal(false)}
                  attachments={(reviewContext as any)?.nomination?.attachments || []}
                  nominationId={nomineeId} 
                  showToast={showToast} 
                />
              )}

            </div>

            <PerformanceEvaluationForm 
              reviewContext={reviewContext} 
              scores={scores}
              setScores={setScores}
              ipcr={ipcr}
              setIpcr={setIpcr}
              comments={comments}
              setComments={setComments}
              isLocked={isCompleted}
            />

            {!isCompleted && reviewContext && (
              <div className="flex justify-end gap-3 mt-8 pb-4">

                <Button size="sm" variant="secondary" onClick={() => handleActionClick("draft")} disabled={!!processingAction}>
                  <div className="px-6 py-2">{processingAction === "draft" ? "Saving..." : "Save as Draft"}</div>
                </Button>
                <Button size="sm" variant="primary" onClick={() => handleActionClick("submit")} disabled={!!processingAction}>
                  <div className="px-6 py-2">{processingAction === "submit" ? "Submitting..." : "Submit Evaluation"}</div>
                </Button>
              </div>
            )}
          </Section>
        </>
      )}
    </Section>
  );
}