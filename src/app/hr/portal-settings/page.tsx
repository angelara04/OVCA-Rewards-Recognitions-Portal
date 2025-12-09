'use client';
import React, { useEffect, useState } from "react";
import Button from "@/components/button";
import { Power, X, TriangleAlert } from "lucide-react";
import Section from "@/components/section";
import Input from "@/components/input";
import PortalStatusBadge from "@/components/portal-status-badge";
import AlertBanner from "@/components/alertBanner";
import {
  getPortalData,
  saveAllSettings,
  resetEntireCycle, 
  type PeriodSetting,
} from "@/app/admin/settings/actions";

// --- Types ---
type AdminStatus = "UNSCHEDULED" | "PUBLISHED" | "OPEN" | "CLOSED";

// --- Custom Modal (unchanged) ---
const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#575757a3] backdrop-blur-xs z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-[var(--dark-grey)] hover:text-black">
          <X size={20} />
        </button>
        <div className="text-center">
          <div className="mb-4 inline-flex p-2">
             <TriangleAlert size={80} className="text-[var(--maroon)]" />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">Reset Confirmation</h3>
          <p className="text-sm text-[var(--dark-grey)]">
            This action will <strong>permanently delete all data</strong> related to the nominee’s submissions and committee evaluations. Do you wish to continue?
          </p>
        </div>
        <div className="flex justify-center gap-5 mt-6">
          <Button size="sm" variant="secondary" onClick={onClose}>
            <div className="px-6 py-1">Cancel</div>
          </Button>
          <Button size="sm" variant="reset" onClick={onConfirm}> 
            <div className="px-6 py-1">Delete</div>
          </Button>
        </div>
      </div>
    </div>
  );
};

const toDateTimeInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const localIso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  return localIso;
};

export default function Page() {
  // SAVED states
  const [nominationStartDate, setNominationStartDate] = useState<string>("");
  const [nominationEndDate, setNominationEndDate] = useState<string>("");
  const [scoringStartDate, setScoringStartDate] = useState<string>("");
  const [scoringEndDate, setScoringEndDate] = useState<string>("");

  // DRAFT states
  const [draftNominationStartDate, setDraftNominationStartDate] = useState<string>("");
  const [draftNominationEndDate, setDraftNominationEndDate] = useState<string>("");
  const [draftScoringStartDate, setDraftScoringStartDate] = useState<string>("");
  const [draftScoringEndDate, setDraftScoringEndDate] = useState<string>("");

  const [counts, setCounts] = useState({ nom: 0, review: 0 });

  // UI state
  const [alert, setAlert] = useState<{ title: string; message: string; variant: 'success'|'error'|'warning'; key: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const triggerAlert = (title: string, message: string, variant: 'success'|'error'|'warning') => {
    setAlert({ title, message, variant, key: Math.random() });
  };

  // --- LOGIC: Compute Status ---
  const computeStatus = (start: string, end: string, count: number): AdminStatus => {
    if (!start || !end) return "UNSCHEDULED";
    
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    // 1. Past End Date = CLOSED (Highest Priority)
    if (now > endDate) return "CLOSED";

    // 2. Future Start Date = PUBLISHED (Priority over OPEN)
    if (now < startDate) return "PUBLISHED";

    // 3. Active Window + Data exists = OPEN (Locked)
    if (count > 0) return "OPEN";

    // 4. Active Window + No Data = PUBLISHED (Editable)
    return "PUBLISHED";
  };

  const fetchAndRefreshData = async () => {
      try {
        const data = await getPortalData(); 
        const settings = data.settings;
        setCounts({ nom: data.nominationCount, review: data.reviewCount });

        setNominationStartDate(toDateTimeInput(settings?.["nomination_period"]?.start_at));
        setNominationEndDate(toDateTimeInput(settings?.["nomination_period"]?.end_at));
        setScoringStartDate(toDateTimeInput(settings?.["scoring_period"]?.start_at));
        setScoringEndDate(toDateTimeInput(settings?.["scoring_period"]?.end_at));

        if (loading) {
            setDraftNominationStartDate(toDateTimeInput(settings?.["nomination_period"]?.start_at));
            setDraftNominationEndDate(toDateTimeInput(settings?.["nomination_period"]?.end_at));
            setDraftScoringStartDate(toDateTimeInput(settings?.["scoring_period"]?.start_at));
            setDraftScoringEndDate(toDateTimeInput(settings?.["scoring_period"]?.end_at));
        }
      } catch (err) {
        triggerAlert("Error", "Failed to load portal settings.", "error");
      }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchAndRefreshData();
      setLoading(false);
    })();
  }, []);

  // --- Derived Statuses ---
  const nomStatus = computeStatus(nominationStartDate, nominationEndDate, counts.nom);
  const scoreStatus = computeStatus(scoringStartDate, scoringEndDate, counts.review);

  // --- LOCKED LOGIC ---
  const isNominationDisabled = nomStatus === "OPEN" || nomStatus === "CLOSED";
  const isScoringDisabled = scoreStatus === "OPEN" || scoreStatus === "CLOSED";

  const isInvalidInput =
    !draftNominationStartDate || !draftNominationEndDate || !draftScoringStartDate || !draftScoringEndDate;

  const hasDraftChanges =
    draftNominationStartDate !== nominationStartDate ||
    draftNominationEndDate !== nominationEndDate ||
    draftScoringStartDate !== scoringStartDate ||
    draftScoringEndDate !== scoringEndDate;

  const hasData = counts.nom > 0 || counts.review > 0;
  const isLeftButtonEnabled = nomStatus !== "UNSCHEDULED" || scoreStatus !== "UNSCHEDULED" || hasData;
  const leftButtonText = hasData ? "Reset" : "Clear";

  const canSave = !isInvalidInput && hasDraftChanges;

  // --- HANDLERS ---
  const handleDraftChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, currentDisabled: boolean) => {
    if (currentDisabled) {
      triggerAlert("Error", "Cannot edit dates while period is active with data or closed. Please reset first.", "error");
      return;
    }
    setter(value);
  };

  const handleSaveAllSettings = async () => {
    if (!canSave) {
      triggerAlert("Error", "Cannot save settings.", "error");
      return;
    }

    // --- VALIDATION LOGIC ---
    const nomStart = new Date(draftNominationStartDate);
    const nomEnd = new Date(draftNominationEndDate);
    const scoreStart = new Date(draftScoringStartDate);
    const scoreEnd = new Date(draftScoringEndDate);

    // 1. Basic Start < End
    if (nomStart >= nomEnd) {
        triggerAlert("Error", "Nomination Start must be before End date.", "error");
        return;
    }
    if (scoreStart >= scoreEnd) {
        triggerAlert("Error", "Scoring Start must be before End date.", "error");
        return;
    }

    // 2. Committee cannot start before Nomination Starts
    if (scoreStart < nomStart) {
        triggerAlert("Error", "Committee Scoring cannot start before Nomination Period begins.", "error");
        return;
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.append("nom_start", draftNominationStartDate);
      form.append("nom_end", draftNominationEndDate);
      form.append("score_start", draftScoringStartDate);
      form.append("score_end", draftScoringEndDate);

      const res = await saveAllSettings(form);
      if (res?.success) {
        await fetchAndRefreshData();
        triggerAlert("Success", "Portal Settings saved successfully", "success");
      } else {
        triggerAlert("Error", res?.message || "Failed to save settings.", "error");
      }
    } catch (err) {
      triggerAlert("Error", "Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetClick = () => {
    if (!isLeftButtonEnabled) return;
    if (leftButtonText === "Reset") {
      setIsModalOpen(true);
    } else {
      handleConfirmDelete("CLEAR_ONLY");
    }
  };

  const handleConfirmDelete = async (mode: "DESTRUCTIVE" | "CLEAR_ONLY" = "DESTRUCTIVE") => {
    setIsModalOpen(false);
    setSaving(true);
    try {
      
      const res = await resetEntireCycle();

      if (res.success) {
        await fetchAndRefreshData();
        
        setDraftNominationStartDate("");
        setDraftNominationEndDate("");
        setDraftScoringStartDate("");
        setDraftScoringEndDate("");
        setCounts({ nom: 0, review: 0 });
  
        triggerAlert(
            mode === "DESTRUCTIVE" ? "Warning" : "Success", 
            res.message, 
            mode === "DESTRUCTIVE" ? "warning" : "success"
        );
      } else {
        triggerAlert("Error", res.message, "error");
      }

    } catch (err) {
      console.error("Reset error:", err);
      triggerAlert("Error", "Failed to reset portal.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[var(--maroon)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--dark-grey)] text-sm font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      
      {alert && (
        <AlertBanner
          key={alert.key}
          title={alert.variant === 'success' ? 'Success' : alert.variant === 'error' ? 'Error' : 'Warning'}
          message={alert.message}
          variant={alert.variant}
          onClose={() => setAlert(null)}
        />
      )}
      
      <DeleteConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => handleConfirmDelete("DESTRUCTIVE")}
      />

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
        <h2 className="text-xl font-bold text-black mb-6">
          <Power
            size={23}
            className="inline-flex mb-1 mr-1 text-[var(--maroon)]"
          />{" "}
          Nomination Period Control
        </h2>

        <div className="w-full rounded-sm min-h-[10vh] py-4 px-4 mb-6 relative pr-24 bg-[var(--settings-grey)]">
          <div className="mb-2">
            <h3 className="text-md font-semibold text-black">
              Nomination Submission
            </h3>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <PortalStatusBadge
              variant="period"
              status={nomStatus}
            />
          </div>
          <p className="text-sm text-[var(--dark-grey)]">
            Allow employees to submit nominations
            {counts.nom > 0 && <span className="ml-2 font-mono text-xs bg-gray-200 px-2 py-0.5 rounded">({counts.nom} active)</span>}
          </p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="nomination_start_datetime"
              label="Start Date & Time"
              placeholder="Select start date & time"
              value={draftNominationStartDate}
              disabled={isNominationDisabled}
              onChange={(v) => handleDraftChange(setDraftNominationStartDate, v, isNominationDisabled)}
              width="w-full"
              type="datetime-local"
            />
            <Input
              id="nomination_end_datetime"
              label="End Date & Time"
              placeholder="Select end date & time"
              value={draftNominationEndDate}
              disabled={isNominationDisabled}
              onChange={(v) => handleDraftChange(setDraftNominationEndDate, v, isNominationDisabled)}
              width="w-full"
              type="datetime-local"
            />
          </div>
        </form>
      </div>

      {/* Committee Scoring */}
      <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] rounded-sm shadow-sm mt-4 px-6 py-6 min-h-[35vh] flex flex-col relative content-area">
        <h2 className="text-xl font-bold text-black mb-6">
          <Power
            size={23}
            className="inline-flex mb-1 mr-1 text-[var(--maroon)]"
          />{" "}
          Committee Scoring Period
        </h2>

        <div className="w-full rounded-sm min-h-[10vh] py-4 px-4 mb-6 relative pr-24 bg-[var(--settings-grey)]">
          <div className="mb-2">
            <h3 className="text-md font-semibold text-black">
              Committee Review & Scoring
            </h3>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <PortalStatusBadge
              variant="period"
              status={scoreStatus}
            />
          </div>
          <p className="text-sm text-[var(--dark-grey)]">
            Committee members can score nominations
            {counts.review > 0 && <span className="ml-2 font-mono text-xs bg-gray-200 px-2 py-0.5 rounded">({counts.review} evaluations)</span>}
          </p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
            id="scoring_start_datetime"
            label="Start Date & Time"
            placeholder="Select start date & time"
            value={draftScoringStartDate}
            disabled={isScoringDisabled}
            onChange={(v) => handleDraftChange(setDraftScoringStartDate, v, isScoringDisabled)}
            width="w-full"
            type="datetime-local"
          />
          <Input
            id="scoring_end_datetime"
            label="End Date & Time"
            placeholder="Select end date & time"
            value={draftScoringEndDate}
            disabled={isScoringDisabled}
            onChange={(v) => handleDraftChange(setDraftScoringEndDate, v, isScoringDisabled)}
            width="w-full"
            type="datetime-local"
          />
          </div>
        </form>
      </div>

      <div className="w-full max-w-6xl">
        <div className="flex justify-end gap-3 mt-10 mb-2">
          
          <Button 
            size="sm" 
            variant={
                !isLeftButtonEnabled ? "disabled" : 
                leftButtonText === "Reset" ? "reset" : "secondary"
            }
            onClick={handleResetClick}
            disabled={!isLeftButtonEnabled} 
          >
            <div className="px-8 py-2">{leftButtonText}</div>
          </Button>

          <Button 
            size="sm" 
            variant={canSave ? "reset" : "disabled"}
            onClick={handleSaveAllSettings}
            disabled={!canSave}
          >
            <div className="px-4 py-2">{saving ? "Saving..." : "Save All Settings"}</div>
          </Button>
        </div>
      </div>
    </Section>
  );
}