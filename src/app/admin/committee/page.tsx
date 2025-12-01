"use client"

import { useState, useEffect } from "react"
import { getCommitteeDashboardData, type CommitteeNomination } from "./actions"
import Link from "next/link"

export default function CommitteeDashboard() {
  const [nominations, setNominations] = useState<CommitteeNomination[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("All")

  useEffect(() => {
    async function fetchData() {
      const data = await getCommitteeDashboardData()
      setNominations(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  // Filter logic
  const filteredNominations = nominations.filter((nom) => {
    if (filterStatus === "All") return true
    return nom.my_status === filterStatus
  })

  // Helper to get badge colors based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default: // Not Started
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Committee Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview of nominations assigned for evaluation.
          </p>
        </div>

        {/* Simple Stats Card */}
        <div className="flex gap-4">
          <div className="bg-white p-3 rounded border shadow-sm text-center min-w-[100px]">
            <div className="text-2xl font-bold text-blue-600">
              {nominations.filter((n) => n.my_status === "In Progress").length}
            </div>
            <div className="text-xs text-gray-500 uppercase font-semibold">Pending</div>
          </div>
          <div className="bg-white p-3 rounded border shadow-sm text-center min-w-[100px]">
            <div className="text-2xl font-bold text-green-600">
              {nominations.filter((n) => n.my_status === "Completed").length}
            </div>
            <div className="text-xs text-gray-500 uppercase font-semibold">Done</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        {["All", "Not Started", "In Progress", "Completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === status
                ? "bg-gray-900 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold border-b">Nominee</th>
              <th className="p-4 font-semibold border-b">Category / Unit</th>
              <th className="p-4 font-semibold border-b">Review Progress</th>
              <th className="p-4 font-semibold border-b">My Status</th>
              <th className="p-4 font-semibold border-b text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredNominations.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No nominations found.
                </td>
              </tr>
            ) : (
              filteredNominations.map((nom) => (
                <tr key={nom.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{nom.nominee_name}</div>
                    <div className="text-sm text-gray-500">{nom.position}</div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-800">{nom.category}</div>
                    <div className="text-xs text-gray-500">{nom.unit}</div>
                  </td>

                  {/* Global Progress Column */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {nom.global_review_count} / 3
                      </span>
                      {/* Simple progress bar */}
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${nom.global_review_count >= 3 ? "bg-red-500" : "bg-blue-500"}`}
                          style={{ width: `${(nom.global_review_count / 3) * 100}%` }} 
                        />
                      </div>
                    </div>
                    {nom.global_review_count >= 3 && (
                      <span className="text-xs text-red-600 font-medium">Locked</span>
                    )}
                  </td>

                  {/* My Status Badge */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                        nom.my_status
                      )}`}
                    >
                      {nom.my_status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    {/* UPDATED LINK PATH HERE */}
                    <Link
                      href={`/admin/committee/review/${nom.id}`}
                      className={`inline-block px-4 py-2 rounded text-sm font-medium shadow-sm transition-colors ${
                        nom.my_status === "Completed"
                          ? "bg-white border text-gray-700 hover:bg-gray-50"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {nom.my_status === "Completed" ? "View Results" : "Evaluate"}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}