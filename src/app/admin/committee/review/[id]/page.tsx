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
  
  // State for IPCR
  const [ipcrValues, setIpcrValues] = useState({ 
    y2022: 0, y2023: 0, y2024: 0, supervisor: "", unit: ""
  })

  // 🔥 NEW STATE: Local Category Selection
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    async function load() {
      const result = await getReviewContext(nominationId)
      
      if (result?.error) {
        alert(result.error) 
        router.push("/admin/committee")
        return
      }

      setData(result)
      
      // Initialize local category state with DB value
      if (result?.nomination?.category) {
          setSelectedCategory(result.nomination.category);
      }

      if (result?.existingReview?.scores_json) {
        const savedScores = result.existingReview.scores_json
        setCurrentScores(savedScores)
        if (savedScores["meta_ipcr_breakdown"]) {
            setIpcrValues(prev => ({...prev, ...savedScores["meta_ipcr_breakdown"]}))
        }
      }
      setLoading(false)
    }
    load()
  }, [nominationId, router])

  // ... (handleValuesChange logic remains the same) ...
  const handleValuesChange = (e: React.ChangeEvent<HTMLInputElement>, criteriaId?: string) => {
    const { name, value, type } = e.target;
    if (type === "text") {
         setIpcrValues(prev => ({ ...prev, [name]: value }));
         return;
    }
    let numValue = parseFloat(value);
    if (isNaN(numValue)) numValue = 0;
    if (numValue > 60) numValue = 60;
    if (numValue < 0) numValue = 0;
    const newIpcr = { ...ipcrValues, [name]: numValue };
    setIpcrValues(newIpcr);
    if (criteriaId) {
        const total = newIpcr.y2022 + newIpcr.y2023 + newIpcr.y2024;
        const average = total / 3;
        setCurrentScores(prev => ({...prev, [criteriaId]: parseFloat(average.toFixed(2))}));
    }
  }

  if (loading) return <div className="p-10 text-center">Loading Workspace...</div>
  if (!data?.rubric) return <div className="p-10 text-center">Error loading rubric.</div>

  const groupedCriteria = (data.rubric.criteria as any[]).reduce((acc: any, item: any) => {
    const section = item.section || "General"
    if (!acc[section]) acc[section] = []
    acc[section].push(item)
    return acc
  }, {})

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
    
    // 🔥 NEW: Append the category selection to the form data
    formData.append("override_category", selectedCategory);

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
  const isNonSupervisory = data.nomination.category?.includes("Non-Supervisory");
  
  // Check for the specific types
  const isJuniorOrIndustrial = 
      data.nomination.category.includes("Industrial") || 
      data.nomination.category.includes("Junior") ||
      data.nomination.category.includes("Non-Teaching Personnel (Junior and Industrial Level)"); // Include original logic

  const OPTION_1 = "Industrial and Allied Professionals (SG 1 - 8)";
  const OPTION_2 = "Junior Professionals (SG 1 - 8)";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header (Same as before) */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/committee" className="text-gray-500 hover:text-gray-900 font-medium">&larr; Back</Link>
          <h1 className="text-xl font-bold text-gray-900">Evaluation: <span className="font-normal text-gray-600">{data.nomination.nominee_name}</span></h1>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setShowDetails(true)} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium text-sm">📄 View Details</button>
            <div className="bg-gray-900 text-white px-4 py-2 rounded-lg font-mono text-lg">Score: {totalScore.toFixed(2)}</div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-6">
          {isReadOnly && (
             <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded shadow-sm">
               <p className="font-bold">View Only Mode</p>
               <p>This review is submitted or closed.</p>
             </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            
            {/* 🔥 NEW: Local Category Override UI (Bundled with form) */}
            {isJuniorOrIndustrial && !isReadOnly && (
                <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Category Selection</h3>
                  </div>

                  <div className="space-y-3">
                    {/* Option 1: Industrial */}
                    <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-md border transition-all ${selectedCategory === OPTION_1 ? 'bg-indigo-50 border-indigo-200' : 'border-transparent hover:bg-gray-50'}`}>
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        checked={selectedCategory === OPTION_1}
                        onChange={() => setSelectedCategory(OPTION_1)}
                      />
                      <span className={`text-sm ${selectedCategory === OPTION_1 ? 'font-semibold text-indigo-900' : 'text-gray-700'}`}>
                        {OPTION_1}
                      </span>
                    </label>

                    {/* Option 2: Junior */}
                    <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-md border transition-all ${selectedCategory === OPTION_2 ? 'bg-indigo-50 border-indigo-200' : 'border-transparent hover:bg-gray-50'}`}>
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        checked={selectedCategory === OPTION_2}
                        onChange={() => setSelectedCategory(OPTION_2)}
                      />
                      <span className={`text-sm ${selectedCategory === OPTION_2 ? 'font-semibold text-indigo-900' : 'text-gray-700'}`}>
                        {OPTION_2}
                      </span>
                    </label>
                  </div>
                </div>
            )}

            {/* Rubric Sections (Same as before) */}
            {isNonSupervisory && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
                    {/* ... Supervisor Input fields ... */}
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Required Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Name of Supervisor <span className="text-red-500">*</span></label>
                            <input type="text" name="supervisor" value={ipcrValues.supervisor || ''} onChange={(e) => handleValuesChange(e)} disabled={isReadOnly} required className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Supervisor Unit / Office <span className="text-red-500">*</span></label>
                            <input type="text" name="unit" value={ipcrValues.unit || ''} onChange={(e) => handleValuesChange(e)} disabled={isReadOnly} required className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
                        </div>
                    </div>
                </div>
            )}

            {Object.keys(groupedCriteria).map((section) => (
              <div key={section} className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">{section}</h3>
                <div className="space-y-6">
                  {groupedCriteria[section].map((item: any) => {
                    // ... (Your existing rubric rendering logic including IPCR table) ...
                    const isIPCR = (item.label && item.label.toLowerCase().includes("ipcr")) || item.id === "ipcr";
                    if (isIPCR) {
                        return (
                            <div key={item.id} className="border border-gray-300 rounded overflow-hidden mb-6">
                                <div className="bg-gray-200 p-3 font-bold border-b border-gray-300 text-sm">Part A. (Maximum Points - {item.max})</div>
                                <div className="p-3 border-b border-gray-300 bg-white font-medium text-sm">IPCR (Indicate the average rating)</div>
                                <table className="w-full text-sm">
                                    <tbody>
                                        {['y2022', 'y2023', 'y2024'].map((yearKey, idx) => (
                                            <tr key={yearKey} className="border-b border-gray-200">
                                                <td className="p-3 w-1/2">{idx === 2 ? '2024 (Jan–Jun)' : 2022 + idx}</td>
                                                <td className="p-3 text-center w-1/4 text-gray-600">Max 60</td>
                                                <td className="p-3 w-1/4">
                                                    <input type="number" name={yearKey} placeholder="0" max="60" disabled={isReadOnly}
                                                        value={ipcrValues[yearKey as keyof typeof ipcrValues] || ''}
                                                        onChange={(e) => handleValuesChange(e, item.id)}
                                                        className="w-full border border-gray-400 rounded p-1 text-center"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="font-bold">
                                            <td className="p-3">Average Score:</td>
                                            <td className="p-3"></td>
                                            <td className="p-3 text-center bg-gray-200 border-l border-gray-300 text-gray-900">
                                                <input type="hidden" name={item.id} value={currentScores[item.id] || 0} />
                                                {(currentScores[item.id] || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )
                    }
                    return (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pb-6 border-b border-gray-100 last:border-0">
                        <div className="md:col-span-9">
                            <label className="block font-medium text-gray-900 text-lg">{item.label}</label>
                            {item.description && <p className="text-gray-500 mt-1">{item.description}</p>}
                        </div>
                        <div className="md:col-span-3 flex items-center gap-2 justify-end">
                            <input type="number" name={item.id} min="0" max={item.max} required disabled={isReadOnly} step="0.01"
                            value={currentScores[item.id] ?? ""}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0
                                setCurrentScores(prev => ({...prev, [item.id]: val}))
                            }}
                            className="w-24 p-2 border rounded text-center font-bold text-xl focus:ring-2 focus:ring-blue-500" />
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
               <div><label className="block font-medium mb-2">Comments / Remarks</label><textarea name="comments" rows={4} disabled={isReadOnly} defaultValue={data.existingReview?.comments || ""} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" placeholder="Enter any additional feedback here..." /></div>
            </div>

            {!isReadOnly && (
              <div className="flex justify-end gap-4 pt-4">
                <button type="submit" name="action" value="save" disabled={saving} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium">Save Draft</button>
                <button type="submit" name="action" value="submit" disabled={saving} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-lg">{saving ? "Submitting..." : "Submit Final Review"}</button>
              </div>
            )}
          </form>
      </div>

      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* Modal Content (Keep existing) */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Nomination Details</h2>
                    <button onClick={() => setShowDetails(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div><p className="text-xs text-gray-500 uppercase">Nominee</p><p className="font-semibold">{data.nomination.nominee_name}</p></div>
                        <div><p className="text-xs text-gray-500 uppercase">Position</p><p className="font-semibold">{data.nomination.position}</p></div>
                    </div>
                    {/* ... other modal details ... */}
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button onClick={() => setShowDetails(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium">Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}