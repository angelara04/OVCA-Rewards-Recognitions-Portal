'use client';
import React, { useState } from "react";
import Button from "@/components/button";
import { Power, X, TriangleAlert } from "lucide-react";
import Section from "@/components/section";
import Input from "@/components/input";
import PortalStatusBadge from "@/components/portal-status-badge";
import AlertBanner from "@/components/alertBanner";

// Helper to check if a saved end date has passed
const checkIfClosed = (endDate: string | null) => {
  if (!endDate) return false; 
  const end = new Date(endDate);
  const today = new Date();
  // Check if today is after the end date
  return today < end; // Changed to check if date is in the future (not closed)
};

// Helper to check if a date is in the past
const isDateInPast = (dateStr: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    // Normalize today to start of day for accurate comparison
    today.setHours(0, 0, 0, 0); 
    return date < today;
}

// --- Custom Modal Component ---
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

// --- Main Page Component ---
export default function Page() {
  // Initialize SAVED STATES (These reflect the state stored in the database)
  const FUTURE_START = "2025-11-20"; 
  const FUTURE_END = "2025-11-24";

  const [nominationStartDate, setNominationStartDate] = useState(FUTURE_START); 
  const [nominationEndDate, setNominationEndDate] = useState(FUTURE_END);
  const [scoringStartDate, setScoringStartDate] = useState(FUTURE_START);
  const [scoringEndDate, setScoringEndDate] = useState(FUTURE_END);
  
  // Tracks if submissions/scores exist (Set to true/false to simulate statuses)
  const [hasNominationSubmissions, setHasNominationSubmissions] = useState(true); 
  const [hasScoringSubmissions, setHasScoringSubmissions] = useState(true); 
  
  // DRAFT STATES (What the user is currently typing)
  const [draftNominationStartDate, setDraftNominationStartDate] = useState(FUTURE_START);
  const [draftNominationEndDate, setDraftNominationEndDate] = useState(FUTURE_END);
  const [draftScoringStartDate, setDraftScoringStartDate] = useState(FUTURE_START);
  const [draftScoringEndDate, setDraftScoringEndDate] = useState(FUTURE_END);
  
  // UI State: Alert is now an object matching AlertBanner props
  const [alert, setAlert] = useState<{ title: string, message: string, variant: 'success' | 'error' | 'warning', key: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  // ==========================================================
  // LOGIC IMPLEMENTATION
  // ==========================================================

  // Determine the overall status for a period based on the rules
  const getPeriodStatus = (startDate: string, endDate: string, hasSubmissions: boolean): 'UNSCHEDULED' | 'OPEN' | 'PUBLISHED' | 'CLOSED' => {
    // 1. UNSCHEDULED: No date set (Saved state)
    if (!startDate || !endDate) {
      return 'UNSCHEDULED';
    }
    
    // Check if the period is CLOSED (date passed)
    const isClosed = !checkIfClosed(endDate);
    if (isClosed) {
      return 'CLOSED';
    }

    // 2. PUBLISHED: Date set, Saved, AND Submissions exist
    if (hasSubmissions) {
      return 'PUBLISHED';
    }
    
    // 3. OPEN: Date set, Saved, No submissions yet
    return 'OPEN';
  };

  const nominationStatus = getPeriodStatus(nominationStartDate, nominationEndDate, hasNominationSubmissions);
  const scoringStatus = getPeriodStatus(scoringStartDate, scoringEndDate, hasScoringSubmissions);
  
  // INPUT DISABLING LOGIC
  const isNominationDisabled = nominationStatus === 'PUBLISHED' || nominationStatus === 'CLOSED';
  const isScoringDisabled = scoringStatus === 'PUBLISHED' || scoringStatus === 'CLOSED';
  
  // BUTTON LOGIC
  const isInvalidInput = !draftNominationStartDate || !draftNominationEndDate || !draftScoringStartDate || !draftScoringEndDate;
  const hasAnySubmissions = hasNominationSubmissions || hasScoringSubmissions;
  
  const canReset = hasAnySubmissions || nominationStatus === 'CLOSED' || scoringStatus === 'CLOSED';
  
  // Save is allowed if no submissions AND input is valid
  const canSave = !hasAnySubmissions && !isInvalidInput; 
  
  // Clear is enabled if there are any draft changes made by the user
  const hasDraftChanges = 
    draftNominationStartDate !== nominationStartDate || 
    draftNominationEndDate !== nominationEndDate ||
    draftScoringStartDate !== scoringStartDate ||
    draftScoringEndDate !== scoringEndDate;
  
  const isLeftButtonEnabled = canReset || hasDraftChanges;
  const leftButtonText = canReset ? "Reset" : "Clear";

  // Helper to trigger alert banner
  const triggerAlert = (title: string, message: string, variant: 'success' | 'error' | 'warning') => {
    // Use Math.random() as a key to force the AlertBanner component to re-render
    setAlert({ title, message, variant, key: Math.random() });
  }


  // --- HANDLERS ---
  
  const handleClear = () => {
    // Reset SAVED states
    setNominationStartDate("");
    setNominationEndDate("");
    setScoringStartDate("");
    setScoringEndDate("");
    // Reset DRAFT states
    setDraftNominationStartDate("");
    setDraftNominationEndDate("");
    setDraftScoringStartDate("");
    setDraftScoringEndDate("");
    // Reset submissions flag
    setHasNominationSubmissions(false);
    setHasScoringSubmissions(false);
    
    triggerAlert('Success', 'All dates cleared successfully.', 'success');
  };
  
  const handleSaveAllSettings = () => {
    if (!canSave) {
        // Should only hit if button is forced enabled, but good for safety
        triggerAlert('Error', 'Cannot save settings with current submissions status.', 'error');
        return;
    }
    
    // VALIDATION 1: Empty Input Check (already covered by isInvalidInput but provide specific message)
    if (isInvalidInput) {
      triggerAlert('Error', 'Invalid date input. Please ensure all start and end dates are entered correctly.', 'error');
      return;
    }
    
    // VALIDATION 2: Past Date Check
    if (isDateInPast(draftNominationStartDate) || isDateInPast(draftNominationEndDate) ||
        isDateInPast(draftScoringStartDate) || isDateInPast(draftScoringEndDate)) {
      triggerAlert('Error', 'Invalid date input. Dates cannot be set in the past.', 'error');
      return;
    }
    
    // VALIDATION 3: Start Date must be before End Date
    if (new Date(draftNominationStartDate) >= new Date(draftNominationEndDate) ||
        new Date(draftScoringStartDate) >= new Date(draftScoringEndDate)) {
      triggerAlert('Error', 'Invalid date range. Start date must be before end date.', 'error');
      return;
    }

    // SUCCESS PATH
    setNominationStartDate(draftNominationStartDate);
    setNominationEndDate(draftNominationEndDate);
    setScoringStartDate(draftScoringStartDate);
    setScoringEndDate(draftScoringEndDate);
    
    triggerAlert('Success', 'Portal Settings was successfully saved', 'success');
  };
  
  const handleResetClick = () => {
    if (!isLeftButtonEnabled) return;

    if (leftButtonText === "Reset") {
        if (nominationStatus === 'PUBLISHED' || scoringStatus === 'PUBLISHED') {
            triggerAlert('Error', 'Cannot reset settings because a submission already exists.', 'error');
            return;
        }
        
        // If not PUBLISHED (only CLOSED or submissions exist in a non-published state), show modal
        setIsModalOpen(true);
        
    } else if (leftButtonText === "Clear") {
        // If it's a non-destructive clear, just clear the drafts
        handleClear();
    }
  };
  
  const handleConfirmDelete = () => {
    setIsModalOpen(false);
    handleClear(); 
    triggerAlert('Warning', 'All submission data has been permanently deleted, and periods have been reset.', 'warning');
  };
  
  // Input Change Handler Logic
  const handleDraftChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, currentStatus: string) => {
    if (currentStatus === 'PUBLISHED' || currentStatus === 'CLOSED') {
      triggerAlert('Error', 'Cannot edit dates while submissions exist or period is closed.', 'error');
      return;
    }
    setter(value);
  };


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
              status={nominationStatus}
            />
          </div>
          <p className="text-sm text-[var(--dark-grey)]">
            Allow employees to submit nominations
          </p>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="nomination_start_date"
              label="Start Date"
              placeholder="Select a Date"
              value={draftNominationStartDate}
              disabled={isNominationDisabled}
              onChange={(v) => handleDraftChange(setDraftNominationStartDate, v, nominationStatus)}
              width="w-full"
              type="date"
            />
            <Input
              id="nomination_end_date"
              label="End Date"
              placeholder="Select a Date"
              value={draftNominationEndDate}
              disabled={isNominationDisabled}
              onChange={(v) => handleDraftChange(setDraftNominationEndDate, v, nominationStatus)}
              width="w-full"
              type="date"
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
              status={scoringStatus}
            />
          </div>
          <p className="text-sm text-[var(--dark-grey)]">
            Committee members can score nominations
          </p>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="scoring_start_date"
              label="Start Date"
              placeholder="Select a Date"
              value={draftScoringStartDate}
              disabled={isScoringDisabled}
              onChange={(v) => handleDraftChange(setDraftScoringStartDate, v, scoringStatus)}
              width="w-full"
              type="date"
            />
            <Input
              id="scoring_end_date"
              label="End Date"
              placeholder="Select a Date"
              value={draftScoringEndDate}
              disabled={isScoringDisabled}
              onChange={(v) => handleDraftChange(setDraftScoringEndDate, v, scoringStatus)}
              width="w-full"
              type="date"
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
            <div className="px-4 py-2">Save All Settings</div>
          </Button>
        </div>
      </div>
    </Section>
  );
}