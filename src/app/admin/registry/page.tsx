"use client"

import { useEffect, useState } from 'react'
import {
  getPendingRegistrations,
  getApprovedRegistrations,
  getDeniedRegistrations,
  approveRegistration,
  denyRegistration,
  deleteRejectedUser,
} from './actions'

export default function RegistryApprovalPage() {
  const [pending, setPending] = useState<any[]>([])
  const [approved, setApproved] = useState<any[]>([])
  const [denied, setDenied] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [pendingData, approvedData, deniedData] = await Promise.all([
        getPendingRegistrations(),
        getApprovedRegistrations(),
        getDeniedRegistrations(),
      ])
      setPending(pendingData)
      setApproved(approvedData)
      setDenied(deniedData)
      setLoading(false)
    }
    load()
  }, [])

  async function handleApprove(id: string) {
    await approveRegistration(id)
    setPending((prev) => prev.filter((p) => p.id !== id))
    const updated = await getApprovedRegistrations()
    setApproved(updated)
  }

  async function handleDeny(id: string) {
    await denyRegistration(id)
    setPending((prev) => prev.filter((p) => p.id !== id))
    const updatedDenied = await getDeniedRegistrations()
    setDenied(updatedDenied)
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm("Are you sure you want to permanently delete this denied user?")
    if (!confirmDelete) return
    await deleteRejectedUser(id)
    setDenied((prev) => prev.filter((d) => d.id !== id))
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold mb-2">User Registry Management</h1>

      {/* Pending Users */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Pending Registrations</h2>
        {pending.length === 0 ? (
          <p>No pending users.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Department</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((reg) => (
                <tr key={reg.id}>
                  <td className="border p-2">{reg.name}</td>
                  <td className="border p-2">{reg.email}</td>
                  <td className="border p-2">{reg.form_data?.department}</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleApprove(reg.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeny(reg.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Deny
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Approved Users */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Approved Users</h2>
        {approved.length === 0 ? (
          <p>No approved users yet.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Department</th>
                <th className="border p-2">Approved On</th>
              </tr>
            </thead>
            <tbody>
              {approved.map((user) => (
                <tr key={user.id}>
                  <td className="border p-2">{user.name}</td>
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2">{user.form_data?.department}</td>
                  <td className="border p-2">
                    {new Date(user.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Denied Users */}
      <div>
  <h2 className="text-xl font-semibold mb-2">Denied Users</h2>
  {denied.length === 0 ? (
    <p>No denied users.</p>
  ) : (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">Name</th>
          <th className="border p-2">Email</th>
          <th className="border p-2">Department</th>
          <th className="border p-2">Denied On</th>
          <th className="border p-2">Action</th>
        </tr>
      </thead>
      <tbody>
        {denied.map((user) => {
          const deniedDate = new Date(user.denied_at)
          const now = new Date()
          const diffDays = Math.floor((now.getTime() - deniedDate.getTime()) / (1000 * 60 * 60 * 24))
          const isOverdue = diffDays > 3

          return (
            <tr key={user.id} className={isOverdue ? 'bg-red-50' : ''}>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.form_data?.department}</td>
              <td className="border p-2">
                {deniedDate.toLocaleString()}
                {isOverdue && (
                  <span className="ml-2 text-sm text-red-600 font-semibold">
                    (Overdue for deletion)
                  </span>
                )}
              </td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => handleDelete(user.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
        )}
      </div>
    </div>
  )
}
