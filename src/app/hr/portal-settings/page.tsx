'use client';
import React, { useEffect, useState } from "react";
import Button from "@/components/button";
import { Power, X, TriangleAlert } from "lucide-react";
import Section from "@/components/section";
import Input from "@/components/input";
import PortalStatusBadge from "@/components/portal-status-badge";
import AlertBanner from "@/components/alertBanner";
import {
  getPortalSettings,
  saveAllSettings,
  getPeriodStatus,
  clearPeriod,
  type PeriodStatus,
  type PeriodSetting,
} from "@/app/admin/settings/actions";

// --- Custom Modal Component (unchanged) ---
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
          <h3 className="text-xl font-bold text-black mb-2">Delete Confirmation</h3>
          <p className="text-sm text-[var(--dark-grey)]">
            This action will permanently delete all data related to the nominee’s submissions and committee evaluations. Do you wish to continue?
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

// Converts ISO to YYYY-MM-DDTHH:MM (for datetime-local input)
const toDateTimeInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

// Convert datetime-local input back to ISO
const toISOFromDateTimeInput = (val: string) => val ? new Date(val).toISOString() : "";


// Helper: convert date input value (YYYY-MM-DD) to ISO string (server expects ISO)
const toISOFromDateInput = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString();
};

export default function Page() {
  // SAVED states (from DB)
  const [nominationStartDate, setNominationStartDate] = useState<string>("");
  const [nominationEndDate, setNominationEndDate] = useState<string>("");
  const [scoringStartDate, setScoringStartDate] = useState<string>("");
  const [scoringEndDate, setScoringEndDate] = useState<string>("");

  // DRAFT states (what user edits)
  const [draftNominationStartDate, setDraftNominationStartDate] = useState<string>("");
  const [draftNominationEndDate, setDraftNominationEndDate] = useState<string>("");
  const [draftScoringStartDate, setDraftScoringStartDate] = useState<string>("");
  const [draftScoringEndDate, setDraftScoringEndDate] = useState<string>("");

  // Flags we still keep (you can wire these later to real counts if you want)
  const [hasNominationSubmissions, setHasNominationSubmissions] = useState<boolean>(false);
  const [hasScoringSubmissions, setHasScoringSubmissions] = useState<boolean>(false);

  // UI state
  const [alert, setAlert] = useState<{ title: string; message: string; variant: 'success'|'error'|'warning'; key: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Server-derived statuses (PeriodStatus from actions: "OPEN" | "CLOSED" | "UNSCHEDULED")
  const [nomServerStatus, setNomServerStatus] = useState<PeriodStatus | null>(null);
  const [scoreServerStatus, setScoreServerStatus] = useState<PeriodStatus | null>(null);

  // Helper to display alerts
  const triggerAlert = (title: string, message: string, variant: 'success'|'error'|'warning') => {
    setAlert({ title, message, variant, key: Math.random() });
  };
const computeStatus = (start: string, end: string) => {
  if (!start || !end) return "UNSCHEDULED";
  const now = new Date();
  const s = new Date(start);
  const e = new Date(end);
  if (now < s) return "UNSCHEDULED";
  if (now >= s && now <= e) return "OPEN";
  return "CLOSED"; // or "CLOSED" depending on logic
};
  // Load settings on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const settings: Record<string, PeriodSetting> = await getPortalSettings();
        setNominationStartDate(toDateTimeInput(settings?.["nomination_period"]?.start_at));
        setNominationEndDate(toDateTimeInput(settings?.["nomination_period"]?.end_at));
        setScoringStartDate(toDateTimeInput(settings?.["scoring_period"]?.start_at));
        setScoringEndDate(toDateTimeInput(settings?.["scoring_period"]?.end_at));

        setDraftNominationStartDate(toDateTimeInput(settings?.["nomination_period"]?.start_at));
        setDraftNominationEndDate(toDateTimeInput(settings?.["nomination_period"]?.end_at));
        setDraftScoringStartDate(toDateTimeInput(settings?.["scoring_period"]?.start_at));
        setDraftScoringEndDate(toDateTimeInput(settings?.["scoring_period"]?.end_at));

        // fetch statuses
        const nStatus = await getPeriodStatus("nomination_period");
        const sStatus = await getPeriodStatus("scoring_period");
        setNomServerStatus(nStatus);
        setScoreServerStatus(sStatus);

        // NOTE: we don't know submission counts here (unless you add an endpoint). Keep flags false by default.
      } catch (err) {
        console.error("Failed to load portal settings:", err);
        triggerAlert("Error", "Failed to load portal settings.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Derived logic (keeps your original UI logic intact, but wired to server statuses)
  const isNominationDisabled = nomServerStatus === "OPEN" || nomServerStatus === "CLOSED";
  const isScoringDisabled = scoreServerStatus === "OPEN" || scoreServerStatus === "CLOSED";

  const isInvalidInput =
    !draftNominationStartDate || !draftNominationEndDate || !draftScoringStartDate || !draftScoringEndDate;

  const hasAnySubmissions = hasNominationSubmissions || hasScoringSubmissions;

  const canReset =
    hasAnySubmissions ||
    nomServerStatus === "OPEN" ||
    nomServerStatus === "CLOSED" ||
    scoreServerStatus === "OPEN" ||
    scoreServerStatus === "CLOSED";

  const canSave = !hasAnySubmissions && !isInvalidInput;

  const hasDraftChanges =
    draftNominationStartDate !== nominationStartDate ||
    draftNominationEndDate !== nominationEndDate ||
    draftScoringStartDate !== scoringStartDate ||
    draftScoringEndDate !== scoringEndDate;

  const isLeftButtonEnabled = canReset || hasDraftChanges;
  const leftButtonText = canReset ? "Reset" : "Clear";

  // Handlers
  const handleDraftChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, currentDisabled: boolean) => {
    if (currentDisabled) {
      triggerAlert("Error", "Cannot edit dates while period is active or recently closed.", "error");
      return;
    }
    setter(value);
  };

  const fetchAndRefreshStatuses = async () => {
    const nStatus = await getPeriodStatus("nomination_period");
    const sStatus = await getPeriodStatus("scoring_period");
    setNomServerStatus(nStatus);
    setScoreServerStatus(sStatus);
  };

  const handleSaveAllSettings = async () => {
    if (!canSave) {
      triggerAlert("Error", "Cannot save settings with current submissions status or invalid input.", "error");
      return;
    }

    // Basic client validations (keeps your existing rules)
    if (isInvalidInput) {
      triggerAlert("Error", "Invalid date input. Please ensure all start and end dates are entered correctly.", "error");
      return;
    }
    // Past date check
    const isPast = (d: string) => d && new Date(d) < new Date(new Date().setHours(0,0,0,0));
    if (isPast(draftNominationStartDate) || isPast(draftNominationEndDate) || isPast(draftScoringStartDate) || isPast(draftScoringEndDate)) {
      triggerAlert("Error", "Invalid date input. Dates cannot be set in the past.", "error");
      return;
    }
    // Start < End
    if (new Date(draftNominationStartDate) >= new Date(draftNominationEndDate) || new Date(draftScoringStartDate) >= new Date(draftScoringEndDate)) {
      triggerAlert("Error", "Invalid date range. Start date must be before end date.", "error");
      return;
    }

    setSaving(true);
    try {
      const form = new FormData();
      // pass the raw date inputs — your server action will convert with new Date(val).toISOString()
      form.append("nom_start", draftNominationStartDate);
      form.append("nom_end", draftNominationEndDate);
      form.append("score_start", draftScoringStartDate);
      form.append("score_end", draftScoringEndDate);

      const res = await saveAllSettings(form);
      if (res?.success) {
        // update saved states to drafts (persist UI)
        setNominationStartDate(draftNominationStartDate);
        setNominationEndDate(draftNominationEndDate);
        setScoringStartDate(draftScoringStartDate);
        setScoringEndDate(draftScoringEndDate);

        // refresh statuses from server
        await fetchAndRefreshStatuses();

        triggerAlert("Success", "Portal Settings was successfully saved", "success");
      } else {
        triggerAlert("Error", res?.message || "Failed to save settings.", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      triggerAlert("Error", "Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    // Non-destructive clear: remove saved values locally and call server to clear as well
    setSaving(true);
    try {
      await clearPeriod("nomination_period");
      await clearPeriod("scoring_period");
      setNominationStartDate("");
      setNominationEndDate("");
      setScoringStartDate("");
      setScoringEndDate("");
      setDraftNominationStartDate("");
      setDraftNominationEndDate("");
      setDraftScoringStartDate("");
      setDraftScoringEndDate("");
      // update statuses
      await fetchAndRefreshStatuses();
      triggerAlert("Success", "All dates cleared successfully.", "success");
    } catch (err) {
      console.error("Clear error:", err);
      triggerAlert("Error", "Failed to clear periods.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetClick = () => {
    if (!isLeftButtonEnabled) return;

    if (leftButtonText === "Reset") {
      // If we treat a reset as destructive when there are submissions, show modal
      if (hasAnySubmissions) {
        setIsModalOpen(true);
        return;
      }

      // If there are no submissions, proceed to clear server periods after confirmation modal
      setIsModalOpen(true);
    } else {
      // Clear drafts locally and on server (non-destructive clear)
      handleClear();
    }
  };

  const handleConfirmDelete = async () => {
    setIsModalOpen(false);
    // Delete action: clear both periods server-side (and simulate deletion of submissions)
    setSaving(true);
    try {
      await clearPeriod("nomination_period");
      await clearPeriod("scoring_period");
      setNominationStartDate("");
      setNominationEndDate("");
      setScoringStartDate("");
      setScoringEndDate("");
      setDraftNominationStartDate("");
      setDraftNominationEndDate("");
      setDraftScoringStartDate("");
      setDraftScoringEndDate("");
      // Optionally reset submission flags (you might want to only do this when real deletion is performed)
      setHasNominationSubmissions(false);
      setHasScoringSubmissions(false);

      await fetchAndRefreshStatuses();
      triggerAlert("Warning", "All submission data has been permanently deleted, and periods have been reset.", "warning");
    } catch (err) {
      console.error("Confirm delete error:", err);
      triggerAlert("Error", "Failed to perform reset.", "error");
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
        onConfirm={handleConfirmDelete}
      />

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
        <h2 className="text-xl font-bold text-black mb-6">
          <Power
            size={23}
            className="inline-flex mb-1 mr-1 text-[var(--maroon)]"
          />{" "}
          Nomination Period Control
        </h2>

        {/* Status Bar */}
        <div className="w-full rounded-sm min-h-[10vh] py-4 px-4 mb-6 relative pr-24 bg-[var(--settings-grey)]">
          <div className="mb-2">
            <h3 className="text-md font-semibold text-black">
              Nomination Submission
            </h3>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <PortalStatusBadge
              variant="period"
              status={computeStatus(nominationStartDate, nominationEndDate)}
            />
          </div>
          <p className="text-sm text-[var(--dark-grey)]">
            Allow employees to submit nominations
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

        {/* Status Bar */}
        <div className="w-full rounded-sm min-h-[10vh] py-4 px-4 mb-6 relative pr-24 bg-[var(--settings-grey)]">
          <div className="mb-2">
            <h3 className="text-md font-semibold text-black">
              Committee Review & Scoring
            </h3>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <PortalStatusBadge
              variant="period"
              status={computeStatus(scoringStartDate, scoringEndDate)}
            />
          </div>
          <p className="text-sm text-[var(--dark-grey)]">
            Committee members can score nominations
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

      <div className="w-full">
        <div className="flex justify-end gap-3 mt-10 mb-2">
          
          {/* LEFT BUTTON: Clear / Reset */}
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

          {/* RIGHT BUTTON: Save All Settings */}
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
