'use client'

import { useState, useEffect } from 'react'
import { promoteToCommittee, getCommitteeMembers, removeFromCommittee } from '../actions'

export default function CommitteeManagementPage() {
  const [userId, setUserId] = useState('')
  const [message, setMessage] = useState('')
  const [committee, setCommittee] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadCommittee() {
    setLoading(true)
    const members = await getCommitteeMembers()
    setCommittee(members)
    setLoading(false)
  }

  useEffect(() => {
    loadCommittee()
  }, [])

  async function handlePromote() {
    setMessage('')
    const result = await promoteToCommittee(userId)
    if (result.success) {
      setMessage(`✅ ${result.message}`)
      await loadCommittee()
    } else {
      setMessage(`❌ ${result.message}`)
    }
  }

  async function handleRemove(id: string) {
    const confirmRemove = confirm('Are you sure you want to remove this committee member?')
    if (!confirmRemove) return
    const result = await removeFromCommittee(id)
    if (result.success) {
      setMessage(`✅ ${result.message}`)
      await loadCommittee()
    } else {
      setMessage(`❌ ${result.message}`)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Committee Management</h1>

      {/* Promotion Input */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <button
          onClick={handlePromote}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          Promote to Committee
        </button>
      </div>

      {message && <p className="mt-2">{message}</p>}

      {/* Committee List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Current Committee Members</h2>
        {loading ? (
          <p>Loading...</p>
        ) : committee.length === 0 ? (
          <p>No committee members found.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {committee.map((member) => (
                <tr key={member.id}>
                  <td className="border p-2">{member.id}</td>
                  <td className="border p-2">{member.name}</td>
                  <td className="border p-2">{member.email}</td>
                  <td className="border p-2">{member.role}</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
