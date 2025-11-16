"use client"

import { useState, useEffect } from "react"
import { createOrUpdateNomination, getMyNominations } from "./actions"

export default function NominationForm() {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [nominations, setNominations] = useState<any[]>([])

  // Load nominations
  async function loadNominations() {
    const data = await getMyNominations()
    setNominations(data)
  }

  useEffect(() => {
    loadNominations()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    files.forEach((file) => formData.append("attachments", file))

    const res = await createOrUpdateNomination(formData)
    setLoading(false)

    if (res.success) {
      alert("Success: " + res.message)
      loadNominations() // refresh list
    } else {
      alert("Error: " + res.message)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Nomination Form</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded bg-white shadow">
        <input type="hidden" name="nomination_id" value="" />
        <input type="hidden" name="status" value="draft" />

        <div>
          <label>Category</label>
          <input name="category" className="border w-full p-2" required />
        </div>

        <div>
          <label>Nominee Name</label>
          <input name="nominee_name" className="border w-full p-2" required />
        </div>

        <div>
          <label>Position</label>
          <input name="position" className="border w-full p-2" required />
        </div>

        <div>
          <label>Unit / Office / College</label>
          <input name="unit" className="border w-full p-2" required />
        </div>

        <div>
          <label>Length of Service</label>
          <input name="length_of_service" className="border w-full p-2" required />
        </div>

        <div>
          <label>Outstanding Achievements</label>
          <textarea name="achievements" className="border w-full p-2" required />
        </div>

        <div>
          <label>Attachments</label>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? "Saving..." : "Save Nomination"}
        </button>
      </form>

      {/* MY NOMINATIONS */}
      <h2 className="text-xl font-semibold mt-10 mb-4">My Nominations</h2>

      <div className="space-y-4">
        {nominations.length === 0 && <p>No nominations yet.</p>}

        {nominations.map((nom) => (
          <div key={nom.id} className="border p-4 rounded shadow bg-white">
            <div className="flex justify-between">
              <h3 className="font-bold text-lg">{nom.nominee_name}</h3>
              <span className="text-sm text-gray-600">{nom.status}</span>
            </div>

            <p className="mt-2 text-gray-700">
              <strong>Category:</strong> {nom.category} <br />
              <strong>Position:</strong> {nom.position} <br />
              <strong>Unit:</strong> {nom.unit}
            </p>

            {/* ATTACHMENTS */}
            <div className="mt-3">
              <h4 className="font-medium">Attachments</h4>

              {(!nom.attachments || nom.attachments.length === 0) && (
                <p className="text-gray-500 text-sm">No attachments</p>
              )}

              <ul className="list-disc ml-6 text-sm">
                {nom.attachments?.map((att: any) => (
                  <li key={att.id}>
                    <a
                      href={`https://drive.google.com/file/d/${att.drive_file_id}/view`}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      {att.file_name}
                    </a>{" "}
                    <span className="text-gray-500 ml-2">
                      ({Math.round(att.file_size / 1024)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
