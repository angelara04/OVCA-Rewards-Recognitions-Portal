"use client";


import { useState, useEffect } from "react";
import {
  createOrUpdateNomination,
  getMyNominations,
  deleteNomination,
} from "./actions";
import AlertBanner from "@/components/alertBanner";
import ConfirmModal from "@/components/confirm-modal";


export default function NominationForm() {
  const [loading, setLoading] = useState(false);
  const [nominations, setNominations] = useState<any[]>([]);
  const [actionValue, setActionValue] = useState("save");


  // --- EVIDENCE FILES STATE ---
  const [files, setFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);


  // --- CONSENT FILES STATE (NEW) ---
  const [consentFiles, setConsentFiles] = useState<File[]>([]);
  const [existingConsentAttachments, setExistingConsentAttachments] = useState<any[]>([]);


  const [editingId, setEditingId] = useState<string | null>(null);
 
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{
    title?: string;
    message?: string;
    variant?: "error" | "warning" | "success";
    duration?: number;
  } | null>(null);


  async function loadNominations() {
    const data = await getMyNominations();
    setNominations(data);
  }


  useEffect(() => {
    loadNominations();
  }, []);


  // --- FILE HANDLERS ---
  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }


  function removeConsentFile(index: number) {
    setConsentFiles((prev) => prev.filter((_, i) => i !== index));
  }


  function startEditing(nom: any) {
    setEditingId(nom.id);
   
    // Fill Text Inputs
    const setVal = (name: string, val: string) => {
        const el = document.querySelector(`[name='${name}']`) as HTMLInputElement | HTMLTextAreaElement;
        if(el) el.value = val || "";
    }


    setVal("category", nom.category);
    setVal("nominee_name", nom.nominee_name);
    setVal("position", nom.position);
    setVal("unit", nom.unit);
    setVal("length_of_service", nom.length_of_service);
    setVal("achievements", nom.achievements);


    // Filter Attachments by Type
    const allAtts = nom.attachments || [];
   
    // 'evidence' or null defaults to standard attachment
    setExistingAttachments(allAtts.filter((a: any) => !a.attachment_type || a.attachment_type === 'evidence'));
   
    // 'consent' goes to the new bucket
    setExistingConsentAttachments(allAtts.filter((a: any) => a.attachment_type === 'consent'));


    setFiles([]);
    setConsentFiles([]);


    window.scrollTo({ top: 0, behavior: "smooth" });
  }


  function handleDeleteDraft(id: string) {
    setPendingDeleteId(id);
    setBanner({
      title: "Confirm Deletion",
      message: "Delete this draft? This removes all attached files and consent forms.",
      variant: "warning",
      duration: 600000,
    });
  }


  async function confirmDeleteDraft() {
    if (!pendingDeleteId) return;
    setLoading(true);
    try {
      const res = await deleteNomination(pendingDeleteId);
      if (res.success) {
        setBanner({ title: "Deleted", message: "Draft deleted.", variant: "success", duration: 4000 });
       
        if (editingId === pendingDeleteId) {
          setEditingId(null);
          setExistingAttachments([]);
          setExistingConsentAttachments([]);
          setFiles([]);
          setConsentFiles([]);
          const form = document.querySelector("form");
          if (form) (form as HTMLFormElement).reset();
        }
        await loadNominations();
      } else {
        setBanner({ title: "Error", message: res.message || "Error deleting", variant: "error", duration: 4000 });
      }
    } catch (err) {
      setBanner({ title: "Error", message: "Delete failed", variant: "error", duration: 4000 });
    } finally {
      setPendingDeleteId(null);
      setLoading(false);
    }
  }


  function cancelDeleteDraft() {
    setPendingDeleteId(null);
    setBanner(null);
  }


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);


    const formData = new FormData(e.currentTarget);
    formData.set("action", actionValue);


    // Combine both existing lists for the backend to check against what to KEEP
    // If an ID is missing from this combined list, the backend will delete it.
    const allKeptAttachments = [...existingAttachments, ...existingConsentAttachments];
    formData.set("existing_attachments_json", JSON.stringify(allKeptAttachments));


    // Append standard evidence files
    files.forEach((file) => formData.append("attachments", file));


    // Append consent files (NEW KEY)
    consentFiles.forEach((file) => formData.append("consent_attachments", file));


    const res = await createOrUpdateNomination(formData);
   
    if (res.success) {
        setBanner({ title: "Success", message: res.message, variant: "success", duration: 4000 });
        // Reset form logic...
        if (actionValue === "submit" || !editingId) {
             e.currentTarget.reset();
             setFiles([]);
             setConsentFiles([]);
             setExistingAttachments([]);
             setExistingConsentAttachments([]);
             setEditingId(null);
        }
        loadNominations();
    } else {
        setBanner({ title: "Error", message: res.message || "Failed", variant: "error", duration: 4000 });
    }
   
    setLoading(false);
  }


  // Helper component for file list
  const FileList = ({ files, onRemove, title }: { files: any[], onRemove: (i: number) => void, title: string }) => (
    <div className="mt-3 border rounded p-3 bg-gray-50">
        <h4 className="font-medium mb-2 text-sm uppercase text-gray-500">{title}</h4>
        <ul className="space-y-2">
            {files.map((file, index) => (
                <li key={index} className="flex justify-between items-center bg-white p-2 border rounded">
                    <span className="text-sm truncate max-w-[200px]">{file.name || file.file_name}</span>
                    <button type="button" onClick={() => onRemove(index)} className="text-red-600 text-xs hover:underline">Remove</button>
                </li>
            ))}
        </ul>
    </div>
  );


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Nomination Form</h1>


      {pendingDeleteId && (
        <ConfirmModal action="delete" onCancelAction={cancelDeleteDraft} onConfirmAction={confirmDeleteDraft} />
      )}


      {banner && (!pendingDeleteId || banner.variant !== "warning") && (
        <div className="mb-4">
          <AlertBanner title={banner.title} message={banner.message} variant={banner.variant as any} duration={banner.duration} onClose={() => setBanner(null)} />
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded bg-white shadow">
        <input type="hidden" name="nomination_id" value={editingId ?? ""} />
       
        {/* Standard Inputs */}
        <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium">Category</label><input name="category" className="border w-full p-2 rounded" required /></div>
            <div><label className="block text-sm font-medium">Nominee Name</label><input name="nominee_name" className="border w-full p-2 rounded" required /></div>
            <div><label className="block text-sm font-medium">Position</label><input name="position" className="border w-full p-2 rounded" required /></div>
            <div><label className="block text-sm font-medium">Unit / Office</label><input name="unit" className="border w-full p-2 rounded" required /></div>
        </div>
       
        <div><label className="block text-sm font-medium">Length of Service</label><input name="length_of_service" className="border w-full p-2 rounded" required /></div>
        <div><label className="block text-sm font-medium">Achievements</label><textarea name="achievements" className="border w-full p-2 rounded h-24" required /></div>


        <hr className="my-6" />


        {/* --- SECTION 1: EVIDENCE ATTACHMENTS --- */}
        <div>
          <h3 className="font-semibold mb-2">1. Evidence / Certifications</h3>
          <p className="text-xs text-gray-500 mb-2">Upload proofs of achievements here.</p>
         
          {existingAttachments.length > 0 && (
            <FileList
                title="Existing Evidence"
                files={existingAttachments}
                onRemove={(idx) => setExistingAttachments(prev => prev.filter((_, i) => i !== idx))}
            />
          )}


          <input
            type="file" multiple
            onChange={(e) => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mt-2"
          />
         
          {files.length > 0 && <FileList title="New Evidence to Upload" files={files} onRemove={removeFile} />}
        </div>


        <hr className="my-6" />


        {/* --- SECTION 2: CONSENT ATTACHMENTS (NEW) --- */}
        <div>
          <h3 className="font-semibold mb-2">2. Nominee Consent</h3>
          <p className="text-xs text-gray-500 mb-2">Upload pictures of the nominee's signature or consent form.</p>


          {existingConsentAttachments.length > 0 && (
            <FileList
                title="Existing Consent"
                files={existingConsentAttachments}
                onRemove={(idx) => setExistingConsentAttachments(prev => prev.filter((_, i) => i !== idx))}
            />
          )}


          <input
            type="file" multiple
            onChange={(e) => setConsentFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 mt-2"
          />


          {consentFiles.length > 0 && <FileList title="New Consent to Upload" files={consentFiles} onRemove={removeConsentFile} />}
        </div>


        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} onClick={() => setActionValue("save")} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            {loading ? "Processing..." : "Save Draft"}
          </button>
          <button type="submit" disabled={loading} onClick={() => setActionValue("submit")} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Submit
          </button>
        </div>
      </form>


      {/* --- DISPLAY LIST --- */}
      <h2 className="text-xl font-semibold mt-10 mb-4">My Nominations</h2>
      <div className="space-y-4">
        {nominations.map((nom) => (
          <div key={nom.id} className="border p-4 rounded shadow bg-white relative">
             <div className="flex justify-between items-start">
              <div>
                  <h3 className="font-bold text-lg">{nom.nominee_name}</h3>
                  <p className="text-sm text-gray-600">{nom.position} - {nom.unit}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${nom.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                {nom.status}
              </span>
            </div>


            {nom.status === "in_progress" && (
              <div className="mt-2 flex gap-2">
                <button className="text-blue-600 text-sm hover:underline" onClick={() => startEditing(nom)}>Edit</button>
                <button className="text-red-600 text-sm hover:underline" onClick={() => handleDeleteDraft(nom.id)}>Delete</button>
              </div>
            )}


            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Evidence List */}
                <div className="bg-gray-50 p-2 rounded text-sm">
                    <p className="font-semibold mb-1">Evidence:</p>
                    <ul className="list-disc ml-4">
                        {nom.attachments?.filter((a:any) => !a.attachment_type || a.attachment_type === 'evidence').map((att: any) => (
                            <li key={att.id}>
                                <a href={`https://drive.google.com/file/d/${att.drive_file_id}/view`} target="_blank" className="text-blue-600 underline truncate block">
                                    {att.file_name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
               
                {/* Consent List */}
                <div className="bg-green-50 p-2 rounded text-sm">
                    <p className="font-semibold mb-1 text-green-900">Consent:</p>
                    <ul className="list-disc ml-4 text-green-800">
                        {nom.attachments?.filter((a:any) => a.attachment_type === 'consent').map((att: any) => (
                            <li key={att.id}>
                                <a href={`https://drive.google.com/file/d/${att.drive_file_id}/view`} target="_blank" className="underline truncate block">
                                    {att.file_name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
