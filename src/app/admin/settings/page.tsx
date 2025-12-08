"use client";

import { useState, useEffect } from "react";
// Import the new resetEntireCycle action
import { getPortalData, saveAllSettings, resetEntireCycle, type PeriodSetting } from "./actions"; 
import { RefreshCw, Calendar, CheckCircle, Lock, Clock, AlertCircle, Trash2 } from "lucide-react"; 

type AdminStatus = "UNSCHEDULED" | "PUBLISHED" | "OPEN" | "CLOSED";
type EvaluationStatus = "NO_SCHEDULE" | "NOT_STARTED" | "ONGOING" | "COMPLETED";

export default function PortalSettingsPage() {
  const [settings, setSettings] = useState<Record<string, PeriodSetting> | null>(null);
  const [counts, setCounts] = useState({ nom: 0, review: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nomDates, setNomDates] = useState({ start: "", end: "" });
  const [scoreDates, setScoreDates] = useState({ start: "", end: "" });

  const toInputFormat = (isoString: string | null | undefined) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };

  const fetchData = async () => {
    const data = await getPortalData();
    setSettings(data.settings);
    setCounts({ nom: data.nominationCount, review: data.reviewCount });
    
    if (loading) {
        setNomDates({
            start: toInputFormat(data.settings["nomination_period"]?.start_at),
            end: toInputFormat(data.settings["nomination_period"]?.end_at)
        });
        setScoreDates({
            start: toInputFormat(data.settings["scoring_period"]?.start_at),
            end: toInputFormat(data.settings["scoring_period"]?.end_at)
        });
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const calculateAdminStatus = (dates: {start: string, end: string}, dataCount: number): AdminStatus => {
      if (!dates.start || !dates.end) return "UNSCHEDULED";
      const now = new Date();
      if (now > new Date(dates.end)) return "CLOSED";
      if (dataCount > 0) return "OPEN";
      return "PUBLISHED";
  };

  const getEvaluationStatus = (dates: {start: string, end: string}): EvaluationStatus => {
      if (!dates.start || !dates.end) return "NO_SCHEDULE";
      const now = new Date();
      const start = new Date(dates.start);
      const end = new Date(dates.end);
      if (now < start) return "NOT_STARTED"; 
      if (now >= start && now <= end) return "ONGOING"; 
      return "COMPLETED"; 
  };

  const nomAdminStatus = calculateAdminStatus(nomDates, counts.nom);
  const scoreAdminStatus = calculateAdminStatus(scoreDates, counts.review);
  const nomEvalStatus = getEvaluationStatus(nomDates);
  const scoreEvalStatus = getEvaluationStatus(scoreDates);

  // --- HANDLERS ---
  const handleSaveAll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append("nom_start", nomDates.start);
    formData.append("nom_end", nomDates.end);
    formData.append("score_start", scoreDates.start);
    formData.append("score_end", scoreDates.end);
    
    if ((nomDates.start && nomDates.end && nomDates.start >= nomDates.end) || 
        (scoreDates.start && scoreDates.end && scoreDates.start >= scoreDates.end)) {
        alert("❌ Error: Start dates must be earlier than End dates.");
        setSaving(false); return;
    }

    const res = await saveAllSettings(formData);
    if(res.success) { await fetchData(); alert("Settings saved!"); } 
    else { alert(res.message); }
    setSaving(false);
  };

  // --- 🔥 NEW MASTER RESET HANDLER ---
  const handleGlobalReset = async () => {
    const confirmMsg = "⚠️ DANGER ZONE: RESET ALL DATA?\n\n" +
      "This action will:\n" +
      "1. PERMANENTLY DELETE all submitted Nominations.\n" +
      "2. PERMANENTLY DELETE all Committee Scores.\n" +
      "3. Clear all timeline dates.\n\n" +
      "Are you absolutely sure you want to start a fresh cycle?";

    if (!confirm(confirmMsg)) return;

    // Double confirmation for safety
    if (!confirm("Please confirm one last time: WIPE ALL DATA?")) return;

    setSaving(true);
    const res = await resetEntireCycle();
    
    if (res.success) {
        await fetchData();
        setNomDates({ start: "", end: "" });
        setScoreDates({ start: "", end: "" });
        alert("✅ System Reset Complete. Ready for new cycle.");
    } else {
        alert("Error: " + res.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Portal Settings</h1>
      
      <form onSubmit={handleSaveAll} className="space-y-8">
        
        {/* --- NOMINATION CARD --- */}
        <PeriodCard 
            title="Nomination Period"
            description="Window for submitting candidates."
            status={nomAdminStatus}
            dates={nomDates}
            setDates={setNomDates}
            dataCount={counts.nom}
            dataLabel="nominations"
        />

        {/* --- SCORING CARD --- */}
        <PeriodCard 
            title="Committee Scoring Period"
            description="Window for evaluations."
            status={scoreAdminStatus}
            dates={scoreDates}
            setDates={setScoreDates}
            dataCount={counts.review}
            dataLabel="reviews"
        />

        {/* --- SYSTEM STATUS MONITOR --- */}
        <div className="bg-white border border-indigo-100 rounded-xl shadow-sm overflow-hidden mt-8">
            <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex items-center gap-2">
                <RefreshCw className="text-indigo-600 w-5 h-5" />
                <h3 className="font-bold text-indigo-900">System Status Monitor</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-indigo-50">
                <StatusMonitorItem label="Nomination Phase" status={nomEvalStatus} />
                <StatusMonitorItem label="Committee Evaluation Phase" status={scoreEvalStatus} />
            </div>
        </div>

        {/* --- 🔥 NEW BOTTOM BAR --- */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end items-center gap-4 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            
            {/* RESET BUTTON */}
            <button 
                type="button" 
                onClick={handleGlobalReset}
                disabled={saving}
                className="px-6 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
                <Trash2 size={18} />
                Reset All Data
            </button>

            {/* SAVE BUTTON */}
            <button 
                type="submit" 
                disabled={saving}
                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 shadow-lg transition-colors"
            >
                {saving ? "Saving..." : "Save All Settings"}
            </button>
        </div>
        <div className="h-20"></div>
      </form>
    </div>
  );
}

// --- HELPER COMPONENTS ---

// Simplified Card (Reset button removed from header)
function PeriodCard({ title, description, status, dates, setDates, dataCount, dataLabel }: any) {
    const isReadOnly = status === "OPEN" || status === "CLOSED";

    let badgeClass = "bg-gray-100 text-gray-500";
    if(status === "PUBLISHED") badgeClass = "bg-blue-50 text-blue-600 border-blue-100";
    if(status === "OPEN") badgeClass = "bg-green-100 text-green-700 border-green-200";
    if(status === "CLOSED") badgeClass = "bg-red-100 text-red-700 border-red-200";

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
                <div className="flex items-center gap-3">
                    {dataCount > 0 && <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{dataCount} {dataLabel}</span>}
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${badgeClass}`}>{status}</span>
                </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {isReadOnly && (
                    <div className="absolute inset-0 bg-gray-50/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-xs font-medium text-gray-500 flex items-center gap-2">
                            <Lock size={12} /> Timeline Locked ({status})
                        </div>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                    <input type="datetime-local" value={dates.start} onChange={(e) => setDates({...dates, start: e.target.value})} disabled={isReadOnly} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none disabled:bg-gray-100" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                    <input type="datetime-local" value={dates.end} onChange={(e) => setDates({...dates, end: e.target.value})} disabled={isReadOnly} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none disabled:bg-gray-100" />
                </div>
            </div>
        </div>
    );
}

function StatusMonitorItem({ label, status }: { label: string, status: EvaluationStatus }) {
    let color = "text-gray-400";
    let icon = <AlertCircle size={20} />;
    let desc = "No schedule set.";

    switch(status) {
        case "NO_SCHEDULE":
            color = "text-gray-400"; icon = <Calendar size={20} />; desc = "Waiting for configuration."; break;
        case "NOT_STARTED":
            color = "text-yellow-600"; icon = <Clock size={20} />; desc = "Scheduled but not yet active."; break;
        case "ONGOING":
            color = "text-green-600"; icon = <CheckCircle size={20} />; desc = "Currently active and accessible."; break;
        case "COMPLETED":
            color = "text-red-600"; icon = <Lock size={20} />; desc = "Period has ended."; break;
    }

    return (
        <div className="p-6 flex items-start gap-4">
            <div className={`mt-1 ${color}`}>{icon}</div>
            <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{label}</h4>
                <p className={`text-2xl font-black mt-1 ${color}`}>{status.replace('_', ' ')}</p>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
            </div>
        </div>
    );
}