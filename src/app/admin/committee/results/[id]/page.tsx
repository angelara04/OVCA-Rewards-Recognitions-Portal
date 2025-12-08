"use client"

import { useState, useEffect, use } from "react"
import { getNominationResults } from "../../actions"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NominationResults({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const result = await getNominationResults(resolvedParams.id)
      if (result?.error) {
        alert(result.error)
        router.push("/admin/committee")
        return
      }
      setData(result)
      setLoading(false)
    }
    load()
  }, [resolvedParams.id, router])

  if (loading) return <div className="p-10 text-center">Loading Results...</div>
  if (!data || !data.rubric) return <div className="p-10 text-center">Data incomplete.</div>

  // --- CALCULATIONS ---
  const criteria = data.rubric.criteria || []
  const maxScore = (criteria as any[]).reduce((sum, item) => sum + (item.max || 0), 0)

  const reviews = data.reviews || []
  const totalScoreSum = reviews.reduce((sum: number, r: any) => sum + (parseFloat(r.total_score) || 0), 0)
  const reviewerCount = reviews.length
  const averageScore = reviewerCount > 0 ? (totalScoreSum / reviewerCount) : 0
  
  const percentage = maxScore > 0 ? (averageScore / maxScore) * 100 : 0
  
  const isQualified = data.nomination.evaluation_result === "Qualified"
  const statusColor = isQualified ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200"

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation */}
        <div className="mb-6 flex justify-between items-center">
            <Link href="/admin/committee" className="text-gray-600 hover:text-gray-900 font-medium">
                &larr; Back to Dashboard
            </Link>
            <button onClick={() => window.print()} className="px-4 py-2 bg-white border shadow-sm rounded text-sm font-medium hover:bg-gray-50 print:hidden">
                🖨️ Print Report
            </button>
        </div>

        {/* --- HEADER: FINAL VERDICT --- */}
        <div className={`mb-8 p-6 rounded-xl border-l-8 shadow-sm bg-white ${isQualified ? "border-green-500" : "border-red-500"}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{data.nomination.nominee_name}</h1>
                    <p className="text-gray-500">{data.nomination.position} • {data.nomination.unit}</p>
                    
                    {/* Nominator Name Display */}
                    <p className="text-sm text-gray-400 mt-2">
                       Nominated by: <span className="font-medium text-gray-600">{data.nomination.nominator?.name || "Unknown"}</span>
                    </p>

                    <p className="text-sm font-mono text-gray-400 mt-1">{data.nomination.category}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">Final Verdict</p>
                    <span className={`px-4 py-2 rounded-lg text-2xl font-bold border ${statusColor}`}>
                        {data.nomination.evaluation_result || "Pending"}
                    </span>
                </div>
            </div>
        </div>

        {/* --- SCORE DASHBOARD --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">Average Score</h3>
                <div className="text-5xl font-extrabold text-blue-600">
                    {averageScore.toFixed(2)}
                    <span className="text-lg text-gray-400 font-medium"> / {maxScore}</span>
                </div>
                <div className="mt-4 w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{percentage.toFixed(2)}% Rating</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border text-center flex flex-col justify-center">
                <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">Total Reviews</h3>
                <div className="text-4xl font-bold text-gray-800">{reviewerCount}</div>
                <p className="text-sm text-gray-500">Committee Members</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border text-center flex flex-col justify-center">
                <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">Passing Threshold</h3>
                <div className="text-4xl font-bold text-gray-800">{(maxScore * 0.7).toFixed(2)}</div>
                <p className="text-sm text-gray-500">70% Required to Qualify</p>
            </div>
        </div>

        {/* --- DETAILED BREAKDOWN --- */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Reviewer Breakdown</h2>
        
        {reviews.length === 0 ? (
           <p className="text-gray-500 italic">No reviews found (or there was an error loading reviewer details).</p>
        ) : (
        <div className="space-y-4">
            {reviews.map((review: any, index: number) => {
                // Extract Metadata if it exists
                const metadata = review.scores_json?.meta_ipcr_breakdown;

                return (
                <div key={review.id} className="bg-white border rounded-lg p-6 shadow-sm">
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-4 border-b pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                {index + 1}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">
                                    {review.reviewer?.name || "Committee Member"}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    Submitted on {new Date(review.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                                {Number(review.total_score).toFixed(2)} <span className="text-sm text-gray-400 font-normal">/ {maxScore}</span>
                            </div>
                        </div>
                    </div>

                    {/* --- NEW SECTION: Supervisor Info (Only if present) --- */}
                    {metadata && (metadata.supervisor || metadata.unit) && (
                        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col sm:flex-row sm:gap-8 gap-2">
                            {metadata.supervisor && (
                                <div>
                                    <p className="text-xs font-bold text-blue-800 uppercase">Supervisor</p>
                                    <p className="text-sm text-blue-900 font-medium">{metadata.supervisor}</p>
                                </div>
                            )}
                            {metadata.unit && (
                                <div>
                                    <p className="text-xs font-bold text-blue-800 uppercase">Unit / Office</p>
                                    <p className="text-sm text-blue-900 font-medium">{metadata.unit}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Scores Section */}
                        <div>
                            <h5 className="text-xs font-bold uppercase text-gray-400 mb-3">Score Breakdown</h5>
                            <ul className="space-y-2 text-sm">
                                {Object.entries(review.scores_json || {})
                                    // FILTER: Hide metadata keys
                                    .filter(([key]) => !key.startsWith("meta_")) 
                                    .map(([key, val]) => {
                                        const rubricItem = (criteria as any[]).find((c: any) => c.id === key)
                                        const label = rubricItem ? rubricItem.label : key
                                        const max = rubricItem ? rubricItem.max : "?"
                                        
                                        return (
                                            <li key={key} className="flex justify-between border-b border-gray-100 pb-1">
                                                <span className="text-gray-600 truncate pr-4">{label}</span>
                                                <span className="font-mono font-bold">{Number(val).toFixed(2)} <span className="text-gray-400 font-normal text-xs">/ {max}</span></span>
                                            </li>
                                        )
                                })}
                            </ul>
                        </div>

                        {/* Comments Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h5 className="text-xs font-bold uppercase text-gray-500 mb-2">Remarks / Comments</h5>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap italic">
                                "{review.comments || "No comments provided."}"
                            </p>
                        </div>
                    </div>
                </div>
            )})}
        </div>
        )}

      </div>
    </div>
  )
}