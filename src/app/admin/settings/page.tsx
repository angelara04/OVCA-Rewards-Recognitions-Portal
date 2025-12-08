"use client";

import { useState, useEffect } from "react";
import { getPortalSettings, saveAllSettings, getPeriodStatus, clearPeriod, type PeriodSetting, type PeriodStatus } from "./actions"; 
import { RefreshCw, CheckCircle, Clock, XCircle } from "lucide-react"; 

export default function PortalSettingsPage() {
  const [settings, setSettings] = useState<Record<string, PeriodSetting> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [nomStatus, setNomStatus] = useState<PeriodStatus | null>(null);
  const [scoreStatus, setScoreStatus] = useState<PeriodStatus | null>(null);

  const [nomDates, setNomDates] = useState({ start: "", end: "" });
  const [scoreDates, setScoreDates] = useState({ start: "", end: "" });

  const toInputFormat = (isoString: string | null | undefined) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };

  const fetchAndSetStatuses = async () => {
    setNomStatus(null);
    setScoreStatus(null);
    const nom = await getPeriodStatus('nomination_period');
    const score = await getPeriodStatus('scoring_period');
    setNomStatus(nom);
    setScoreStatus(score);
  };

  useEffect(() => {
    async function load() {
      const data = await getPortalSettings();
      setSettings(data);
      
      setNomDates({
        start: toInputFormat(data["nomination_period"]?.start_at),
        end: toInputFormat(data["nomination_period"]?.end_at)
      });
      setScoreDates({
        start: toInputFormat(data["scoring_period"]?.start_at),
        end: toInputFormat(data["scoring_period"]?.end_at)
      });

      await fetchAndSetStatuses();
      setLoading(false);
    }
    load();
  }, []);

  const handleSaveAll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData();
    formData.append("nom_start", nomDates.start);
    formData.append("nom_end", nomDates.end);
    formData.append("score_start", scoreDates.start);
    formData.append("score_end", scoreDates.end);

    // --- 🛡️ UPDATED VALIDATION LOGIC ---

    // 1. Self-Check: Start cannot be later than End within the same period
    if ((nomDates.start && nomDates.end && nomDates.start >= nomDates.end) || 
        (scoreDates.start && scoreDates.end && scoreDates.start >= scoreDates.end)) {
        alert("❌ Date Logic Error: Start dates must be earlier than End dates.");
        setSaving(false);
        return;
    }

    // 2. Cross-Check: Scoring cannot begin/end BEFORE Nomination starts/ends
    // (Allows simultaneous start, but enforces logical progression)
    if (nomDates.start && scoreDates.start) {
        if (new Date(scoreDates.start) < new Date(nomDates.start)) {
            alert("❌ Sequence Error: Scoring cannot begin BEFORE Nomination starts.");
            setSaving(false);
            return;
        }
    }

    if (nomDates.end && scoreDates.end) {
        if (new Date(scoreDates.end) < new Date(nomDates.end)) {
            alert("❌ Sequence Error: Scoring cannot end BEFORE Nomination ends.");
            setSaving(false);
            return;
        }
    }
    // --- END VALIDATION ---

    const result = await saveAllSettings(formData);
    
    if (result.success) {
        const updated = await getPortalSettings();
        setSettings(updated);
        await fetchAndSetStatuses(); 
        alert("✅ Timeline updated successfully!");
    } else {
        alert("Error: " + result.message);
    }
    setSaving(false);
  };

  const clearNomination = async () => {
      if(!confirm("Are you sure you want to unschedule the Nomination Period?")) return;
      setSaving(true);
      await clearPeriod('nomination_period');
      setNomDates({ start: "", end: "" });
      await fetchAndSetStatuses();
      const updated = await getPortalSettings();
      setSettings(updated);
      setSaving(false);
  };

  const clearScoring = async () => {
      if(!confirm("Are you sure you want to unschedule the Committee Scoring Period?")) return;
      setSaving(true);
      await clearPeriod('scoring_period');
      setScoreDates({ start: "", end: "" });
      await fetchAndSetStatuses();
      const updated = await getPortalSettings();
      setSettings(updated);
      setSaving(false);
  };

  const getStatusDisplay = (status: PeriodStatus | null) => {
    if (!status) return { text: "Loading...", icon: RefreshCw, color: "text-gray-500", bg: "bg-gray-100" };
    switch (status) {
      case 'OPEN': return { text: "🟢 OPEN (Active)", icon: CheckCircle, color: "text-green-700", bg: "bg-green-100" };
      case 'RECENTLY_CLOSED': return { text: "🟡 RECENTLY CLOSED", icon: Clock, color: "text-yellow-700", bg: "bg-yellow-100" };
      case 'UNSCHEDULED': return { text: "🔴 UNSCHEDULED", icon: XCircle, color: "text-red-700", bg: "bg-red-100" };
      default: return { text: "Error", icon: XCircle, color: "text-gray-500", bg: "bg-gray-100" };
    }
  };

  const nomDisplay = getStatusDisplay(nomStatus);
  const scoreDisplay = getStatusDisplay(scoreStatus);
  const NomIcon = nomDisplay.icon;
  const ScoreIcon = scoreDisplay.icon;

  if (loading || !settings) return <div className="p-10 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Portal Settings</h1>
            <p className="text-gray-500 mt-1">Configure the global timeline for nominations and scoring.</p>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        {/* NOMINATION SECTION */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">🔥 Nomination Submission</h3>
                    <p className="text-sm text-gray-500">Set the window for employees to submit entries.</p>
                </div>
                <button type="button" onClick={clearNomination} disabled={saving} className="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center gap-1">
                    <XCircle className="w-3 h-3"/> Clear / Unschedule
                </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nomination Start</label>
                    <input type="datetime-local" value={nomDates.start} onChange={(e) => setNomDates({...nomDates, start: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nomination End</label>
                    <input type="datetime-local" value={nomDates.end} onChange={(e) => setNomDates({...nomDates, end: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
                </div>
            </div>
        </div>

        {/* SCORING SECTION */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">⚖️ Committee Scoring</h3>
                    <p className="text-sm text-gray-500">Set the window for committee evaluations.</p>
                </div>
                <button type="button" onClick={clearScoring} disabled={saving} className="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center gap-1">
                    <XCircle className="w-3 h-3"/> Clear / Unschedule
                </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Scoring Start</label>
                    <input type="datetime-local" value={scoreDates.start} onChange={(e) => setScoreDates({...scoreDates, start: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Scoring End</label>
                    <input type="datetime-local" value={scoreDates.end} onChange={(e) => setScoreDates({...scoreDates, end: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
                </div>
            </div>
        </div>

        {/* STATUS DEBUGGER */}
        <div className="bg-white border border-gray-400 border-dashed rounded-xl shadow-inner overflow-hidden p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-xl font-bold text-gray-800">🔬 Timeline Status Debugger</h3>
                <button type="button" onClick={fetchAndSetStatuses} disabled={saving} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"><RefreshCw className="w-4 h-4" /> Refresh Status</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`${nomDisplay.bg} p-4 rounded-lg border border-gray-200`}>
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2"><span className={nomDisplay.color}><NomIcon className="w-5 h-5"/></span> Nomination Period</h4>
                    <p className={`mt-2 text-lg font-bold ${nomDisplay.color}`}>{nomDisplay.text}</p>
                </div>
                <div className={`${scoreDisplay.bg} p-4 rounded-lg border border-gray-200`}>
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2"><span className={scoreDisplay.color}><ScoreIcon className="w-5 h-5"/></span> Scoring Period</h4>
                    <p className={`mt-2 text-lg font-bold ${scoreDisplay.color}`}>{scoreDisplay.text}</p>
                </div>
            </div>
        </div>

        {/* SAVE BAR */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg flex justify-end items-center gap-4 z-50">
            <span className="text-sm text-gray-500 hidden md:inline">Empty dates will be saved as "Unscheduled".</span>
            <button type="submit" disabled={saving} className="px-8 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-lg">
                {saving ? "Saving..." : "Save All Settings"}
            </button>
        </div>
        <div className="h-20"></div>
      </form>
    </div>
  );
}