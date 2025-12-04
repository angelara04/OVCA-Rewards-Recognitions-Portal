"use client"

import { useState, useEffect, use } from "react"
import { getReviewContext, saveCommitteeReview } from "../../actions"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ReviewWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const nominationId = resolvedParams.id
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [currentScores, setCurrentScores] = useState<Record<string, number>>({})
  
  // NEW STATE: Track IPCR breakdown specifically (2022, 2023, 2024)
  const [ipcrValues, setIpcrValues] = useState({ y2022: 0, y2023: 0, y2024: 0 })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    async function load() {
      const result = await getReviewContext(nominationId)
      if (result?.error) {
        alert("Nomination not found")
        router.push("/admin/committee")
        return
      }
      setData(result)
      if (result?.existingReview?.scores_json) {
        const savedScores = result.existingReview.scores_json
        setCurrentScores(savedScores)
        
        // RESTORE LOGIC: If we saved the breakdown in the draft, restore it
        if (savedScores["meta_ipcr_breakdown"]) {
            setIpcrValues(savedScores["meta_ipcr_breakdown"])
        }
      }
      setLoading(false)
    }
    load()
  }, [nominationId, router])

  // Helper to handle IPCR specific changes
  const handleIPCRChange = (e: React.ChangeEvent<HTMLInputElement>, criteriaId: string) => {
    const { name, value } = e.target;
    let numValue = parseFloat(value);
    
    // Validation
    if (isNaN(numValue)) numValue = 0;
    if (numValue > 60) numValue = 60;
    if (numValue < 0) numValue = 0;

    const newIpcr = { ...ipcrValues, [name]: numValue };
    setIpcrValues(newIpcr);

    // Calculate Average
    const total = newIpcr.y2022 + newIpcr.y2023 + newIpcr.y2024;
    const average = total / 3;
    
    // Update the main score state with the Average
    setCurrentScores(prev => ({
        ...prev,
        [criteriaId]: parseFloat(average.toFixed(2))
    }));
  }

  if (loading) return <div className="p-10 text-center">Loading Workspace...</div>

  // Missing Rubric Error
  if (!data?.rubric) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-xl w-full bg-white border-2 border-red-100 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Error</h2>
          <p className="text-gray-600 mb-6">Rubric missing for: <strong>{data.nomination.category}</strong></p>
          <Link href="/admin/committee" className="px-6 py-2 bg-gray-800 text-white rounded">&larr; Return</Link>
        </div>
      </div>
    )
  }

  const groupedCriteria = (data.rubric.criteria as any[]).reduce((acc: any, item: any) => {
    const section = item.section || "General"
    if (!acc[section]) acc[section] = []
    acc[section].push(item)
    return acc
  }, {})

  // Calculate total score excluding metadata keys
  const totalScore = Object.entries(currentScores).reduce((acc, [key, val]) => {
      if (key.startsWith("meta_")) return acc;
      return acc + (val || 0);
  }, 0);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const submitter = (e.nativeEvent as any).submitter as HTMLButtonElement
    const action = submitter.value 

    if (action === "submit") {
      if (!confirm("Are you sure? Submitting locks your review.")) {
        setSaving(false); return
      }
    }

    const formData = new FormData(e.currentTarget)
    formData.append("action", action)
    formData.append("nomination_id", nominationId)

    const res = await saveCommitteeReview(formData)
    setSaving(false)

    if (res.success) {
      alert(res.message)
      if (action === "submit") router.push("/admin/committee")
    } else {
      alert("Error: " + res.message)
    }
  }

  const isReadOnly = data.existingReview?.status === "completed" || data.isLocked
  const evaluationResult = data.nomination.evaluation_result

  // Split attachments
  const allFiles = data.nomination.attachments || [];
  const evidenceFiles = allFiles.filter((a: any) => !a.attachment_type || a.attachment_type === 'evidence');
  const consentFiles = allFiles.filter((a: any) => a.attachment_type === 'consent');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* HEADER BAR */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/committee" className="text-gray-500 hover:text-gray-900 font-medium">
            &larr; Back
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
             Evaluation: <span className="font-normal text-gray-600">{data.nomination.nominee_name}</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={() => setShowDetails(true)}
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium text-sm"
            >
                📄 View Nomination Details
            </button>

            <div className="bg-gray-900 text-white px-4 py-2 rounded-lg font-mono text-lg">
                Score: {totalScore.toFixed(2)}
            </div>
        </div>
      </div>

      {/* --- MAIN FORM CONTENT --- */}
      <div className="max-w-4xl mx-auto mt-8 px-6">
          
          {isReadOnly && (
             <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded shadow-sm">
               <p className="font-bold">View Only Mode</p>
               <p>This review is submitted or closed.</p>
             </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            {Object.keys(groupedCriteria).map((section) => (
              <div key={section} className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">{section}</h3>
                <div className="space-y-6">
                  {groupedCriteria[section].map((item: any) => {
                    
                    // --- SPECIAL LOGIC FOR "IPCR" / PART A ---
                    const isIPCR = item.label.includes("IPCR");

                    if (isIPCR) {
                        return (
                            <div key={item.id} className="border border-gray-300 rounded overflow-hidden mb-6">
                                <div className="bg-gray-200 p-3 font-bold border-b border-gray-300 text-sm">
                                    Part A. (Maximum Points - {item.max})
                                </div>
                                <div className="p-3 border-b border-gray-300 bg-white font-medium text-sm">
                                    IPCR (Indicate the average rating)
                                </div>
                                <table className="w-full text-sm">
                                    <tbody>
                                        {/* Row 2022 */}
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 w-1/2">2022</td>
                                            <td className="p-3 text-center w-1/4 text-gray-600">Max 60</td>
                                            <td className="p-3 w-1/4">
                                                <input 
                                                    type="number" name="y2022" placeholder="0" max="60"
                                                    disabled={isReadOnly}
                                                    value={ipcrValues.y2022 || ''}
                                                    onChange={(e) => handleIPCRChange(e, item.id)}
                                                    className="w-full border border-gray-400 rounded p-1 text-center"
                                                />
                                            </td>
                                        </tr>
                                        {/* Row 2023 */}
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 w-1/2">2023</td>
                                            <td className="p-3 text-center w-1/4 text-gray-600">Max 60</td>
                                            <td className="p-3 w-1/4">
                                                <input 
                                                    type="number" name="y2023" placeholder="0" max="60"
                                                    disabled={isReadOnly}
                                                    value={ipcrValues.y2023 || ''}
                                                    onChange={(e) => handleIPCRChange(e, item.id)}
                                                    className="w-full border border-gray-400 rounded p-1 text-center"
                                                />
                                            </td>
                                        </tr>
                                        {/* Row 2024 */}
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 w-1/2">2024 (Jan–Jun)</td>
                                            <td className="p-3 text-center w-1/4 text-gray-600">Max 60</td>
                                            <td className="p-3 w-1/4">
                                                <input 
                                                    type="number" name="y2024" placeholder="0" max="60"
                                                    disabled={isReadOnly}
                                                    value={ipcrValues.y2024 || ''}
                                                    onChange={(e) => handleIPCRChange(e, item.id)}
                                                    className="w-full border border-gray-400 rounded p-1 text-center"
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr className="font-bold">
                                            <td className="p-3">Average Score (Calculated):</td>
                                            <td className="p-3"></td>
                                            <td className="p-3 text-center bg-gray-200 border-l border-gray-300 text-gray-900">
                                                {/* Hidden input to ensure form submission includes the calculated average */}
                                                <input type="hidden" name={item.id} value={currentScores[item.id] || 0} />
                                                {(currentScores[item.id] || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )
                    }

                    // --- STANDARD CRITERIA INPUT ---
                    return (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pb-6 border-b border-gray-100 last:border-0">
                        <div className="md:col-span-9">
                            <label className="block font-medium text-gray-900 text-lg">{item.label}</label>
                            {item.description && <p className="text-gray-500 mt-1">{item.description}</p>}
                        </div>
                        <div className="md:col-span-3 flex items-center gap-2 justify-end">
                            <input
                            type="number" name={item.id} min="0" max={item.max} required disabled={isReadOnly}
                            step="0.01" // Allow decimals for standard inputs too
                            value={currentScores[item.id] ?? ""}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0
                                setCurrentScores(prev => ({...prev, [item.id]: val}))
                            }}
                            className="w-24 p-2 border rounded text-center font-bold text-xl focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-400 font-medium text-lg">/ {item.max}</span>
                        </div>
                        </div>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="bg-white p-6 rounded-lg shadow-sm border">
               <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Feedback</h3>
               <div>
                 <label className="block font-medium mb-2">Comments / Remarks</label>
                 <textarea 
                   name="comments" rows={4} disabled={isReadOnly}
                   defaultValue={data.existingReview?.comments || ""}
                   className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                   placeholder="Enter any additional feedback here..."
                 />
               </div>
            </div>

            {!isReadOnly && (
              <div className="flex justify-end gap-4 pt-4">
                <button type="submit" name="action" value="save" disabled={saving} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium">
                    Save Draft
                </button>
                <button type="submit" name="action" value="submit" disabled={saving} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-lg">
                    {saving ? "Submitting..." : "Submit Final Review"}
                </button>
              </div>
            )}
          </form>
      </div>

      {/* --- MODAL: NOMINATION DETAILS --- */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Nomination Details</h2>
                    <button onClick={() => setShowDetails(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                </div>
                {/* Modal Content */}
                <div className="p-6 overflow-y-auto">
                    {evaluationResult && evaluationResult !== "Pending" && (
                        <div className={`mb-6 p-4 rounded border-l-4 ${evaluationResult === 'Qualified' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'}`}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-1">Final Committee Verdict</p>
                            <p className="text-xl font-bold">{evaluationResult}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div><p className="text-xs text-gray-500 uppercase">Nominee</p><p className="font-semibold">{data.nomination.nominee_name}</p></div>
                        <div><p className="text-xs text-gray-500 uppercase">Position</p><p className="font-semibold">{data.nomination.position}</p></div>
                        <div><p className="text-xs text-gray-500 uppercase">Unit</p><p className="font-semibold">{data.nomination.unit}</p></div>
                        <div><p className="text-xs text-gray-500 uppercase">Category</p><p className="font-semibold text-sm">{data.nomination.category}</p></div>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-2">Achievements</h3>
                        <div className="bg-gray-50 p-3 rounded border text-sm text-gray-700 whitespace-pre-wrap">
                            {data.nomination.achievements}
                        </div>
                    </div>
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-gray-700 border-b pb-1 mb-2">Evidence / Certifications</h3>
                        <ul className="space-y-2">
                        {evidenceFiles.map((att: any) => (
                            <li key={att.id}><a href={`https://drive.google.com/file/d/${att.drive_file_id}/view`} target="_blank" className="text-blue-600 hover:underline text-sm block">📄 {att.file_name}</a></li>
                        ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 border-b pb-1 mb-2">Consent Forms</h3>
                        <ul className="space-y-2">
                        {consentFiles.map((att: any) => (
                            <li key={att.id}><a href={`https://drive.google.com/file/d/${att.drive_file_id}/view`} target="_blank" className="text-green-600 hover:underline text-sm block">✅ {att.file_name}</a></li>
                        ))}
                        </ul>
                    </div>
                </div>
                {/* Modal Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button onClick={() => setShowDetails(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium">Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}