"use client"

import { useState, useEffect, use } from "react"
import { getReviewContext, saveCommitteeReview } from "../../actions"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ReviewWorkspace({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params)
  const nominationId = resolvedParams.id
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  
  // State for real-time total calculation
  const [currentScores, setCurrentScores] = useState<Record<string, number>>({})

  useEffect(() => {
    async function load() {
      const result = await getReviewContext(nominationId)
      if (result?.error) {
        alert("Nomination not found")
        // UPDATED REDIRECT PATH
        router.push("/admin/committee")
        return
      }
      setData(result)
      
      // If we have an existing review, load the scores into state
      if (result?.existingReview?.scores_json) {
        setCurrentScores(result.existingReview.scores_json)
      }
      setLoading(false)
    }
    load()
  }, [nominationId, router])

  if (loading) return <div className="p-10 text-center">Loading Workspace...</div>

  // --- SAFETY CHECK: RUBRIC MISSING ---
  if (!data?.rubric) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-xl w-full bg-white border-2 border-red-100 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Error</h2>
          <p className="text-gray-600 mb-6">
            The scoring criteria for this category have not been set up in the database yet.
          </p>
          
          <div className="bg-gray-100 p-3 rounded text-sm text-gray-700 font-mono mb-8 inline-block">
            Category: <strong>{data.nomination.category}</strong>
          </div>

          <div>
            {/* UPDATED RETURN LINK */}
            <Link 
              href="/admin/committee" 
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
            >
              &larr; Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Group questions by section (Part A, Part B, etc.)
  const groupedCriteria = (data.rubric.criteria as any[]).reduce((acc: any, item: any) => {
    const section = item.section || "General"
    if (!acc[section]) acc[section] = []
    acc[section].push(item)
    return acc
  }, {})

  // Calculate total in real-time
  const totalScore = Object.values(currentScores).reduce((a, b) => a + b, 0)

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    // Identify which button was clicked (Save vs Submit)
    const submitter = (e.nativeEvent as any).submitter as HTMLButtonElement
    const action = submitter.value 

    if (action === "submit") {
      const confirmSubmit = confirm("Are you sure? You cannot edit this review after submitting.")
      if (!confirmSubmit) {
        setSaving(false)
        return
      }
    }

    const formData = new FormData(e.currentTarget)
    formData.append("action", action)
    formData.append("nomination_id", nominationId)

    const res = await saveCommitteeReview(formData)
    setSaving(false)

    if (res.success) {
      alert(res.message)
      if (action === "submit") {
        // UPDATED REDIRECT PATH
        router.push("/admin/committee")
      }
    } else {
      alert("Error: " + res.message)
    }
  }

  const isReadOnly = data.existingReview?.status === "completed" || data.isLocked

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden bg-gray-50">
      
      {/* LEFT PANEL: Nomination Details (Scrollable) */}
      <div className="w-full md:w-1/3 bg-white border-r overflow-y-auto p-6 shadow-lg z-10">
        {/* UPDATED BACK LINK */}
        <Link href="/admin/committee" className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
        
        <h2 className="text-xl font-bold text-gray-900 mb-1">{data.nomination.nominee_name}</h2>
        <p className="text-sm text-gray-600 mb-6">{data.nomination.position}</p>

        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Category</h3>
            <p className="font-medium text-gray-800">{data.nomination.category}</p>
          </div>
          
          <div>
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Unit</h3>
            <p className="font-medium text-gray-800">{data.nomination.unit}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Achievements</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1 bg-gray-50 p-3 rounded border">
              {data.nomination.achievements}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Attachments</h3>
            {(!data.nomination.attachments || data.nomination.attachments.length === 0) && (
                <p className="text-gray-400 text-sm italic">No attachments provided.</p>
            )}
            <ul className="space-y-2">
              {data.nomination.attachments?.map((att: any) => (
                <li key={att.id}>
                  <a 
                    href={`https://drive.google.com/file/d/${att.drive_file_id}/view`}
                    target="_blank"
                    className="flex items-center gap-2 text-blue-600 hover:underline text-sm p-2 border rounded hover:bg-blue-50 transition"
                  >
                    📄 {att.file_name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Dynamic Scoring Form (Scrollable) */}
      <div className="w-full md:w-2/3 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Evaluation Form</h1>
            <div className="bg-gray-900 text-white px-4 py-2 rounded-lg font-mono text-lg">
              Total: {totalScore}
            </div>
          </div>

          {isReadOnly && (
             <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
               <p className="font-bold">View Only Mode</p>
               <p>This review has been submitted (or locked) and cannot be edited.</p>
             </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Dynamic Rendering of Sections */}
            {Object.keys(groupedCriteria).map((section) => (
              <div key={section} className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">{section}</h3>
                
                <div className="space-y-6">
                  {groupedCriteria[section].map((item: any) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      <div className="md:col-span-8">
                        <label className="block font-medium text-gray-900">{item.label}</label>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                      
                      <div className="md:col-span-4 flex items-center gap-2 justify-end">
                        <input
                          type="number"
                          name={item.id}
                          min="0"
                          max={item.max}
                          required
                          disabled={isReadOnly}
                          value={currentScores[item.id] ?? ""}
                          onChange={(e) => {
                             const val = parseFloat(e.target.value) || 0
                             setCurrentScores(prev => ({...prev, [item.id]: val}))
                          }}
                          className="w-20 p-2 border rounded text-center font-bold text-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-400 text-sm font-medium">/ {item.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Recommendation & Comments */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
               <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Final Verdict</h3>
               
               <div className="mb-4">
                 <label className="block font-medium mb-2">Recommendation</label>
                 <select 
                   name="recommendation" 
                   required 
                   disabled={isReadOnly}
                   defaultValue={data.existingReview?.recommendation || ""}
                   className="w-full p-2 border rounded"
                 >
                   <option value="">Select a verdict...</option>
                   <option value="qualified">Qualified</option>
                   <option value="disqualified">Disqualified</option>
                 </select>
               </div>

               <div>
                 <label className="block font-medium mb-2">Comments / Remarks</label>
                 <textarea 
                   name="comments" 
                   rows={4}
                   disabled={isReadOnly}
                   defaultValue={data.existingReview?.comments || ""}
                   className="w-full p-2 border rounded"
                   placeholder="Enter any additional feedback here..."
                 />
               </div>
            </div>

            {/* Action Buttons */}
            {!isReadOnly && (
              <div className="flex justify-end gap-4 pt-4 pb-10">
                <button
                  type="submit"
                  name="action"
                  value="save"
                  disabled={saving}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition font-medium"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  name="action"
                  value="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium shadow-lg"
                >
                  {saving ? "Submitting..." : "Submit Final Review"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}