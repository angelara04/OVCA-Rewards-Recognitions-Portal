"use client"

import { useState, useEffect } from "react"
// 1. Import the new deleteNomination action
import { createOrUpdateNomination, getMyNominations, deleteNomination } from "./actions"

export default function NominationForm() {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [nominations, setNominations] = useState<any[]>([])
  const [actionValue, setActionValue] = useState("save")

  const [editingId, setEditingId] = useState<string | null>(null)
  const [existingAttachments, setExistingAttachments] = useState<any[]>([])

  async function loadNominations() {
    const data = await getMyNominations()
    setNominations(data)
  }

  useEffect(() => {
    loadNominations()
  }, [])

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  function startEditing(nom: any) {
    setEditingId(nom.id)
    ;(document.querySelector("input[name='category']") as HTMLInputElement).value = nom.category
    ;(document.querySelector("input[name='nominee_name']") as HTMLInputElement).value = nom.nominee_name
    ;(document.querySelector("input[name='position']") as HTMLInputElement).value = nom.position
    ;(document.querySelector("input[name='unit']") as HTMLInputElement).value = nom.unit
    ;(document.querySelector("input[name='length_of_service']") as HTMLInputElement).value = nom.length_of_service
    ;(document.querySelector("textarea[name='achievements']") as HTMLTextAreaElement).value = nom.achievements

    setExistingAttachments(nom.attachments || [])
    setFiles([])
    
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 2. New Handle Delete Function
  async function handleDeleteDraft(id: string) {
    const confirmed = confirm("Are you sure you want to delete this draft? This includes deleting all attached files. This action cannot be undone.")
    
    if (!confirmed) return

    // Start simple loading indication (optional, or use specific state)
    setLoading(true) 
    
    const res = await deleteNomination(id)
    
    setLoading(false)

    if (res.success) {
      alert("Draft deleted.")
      
      // If we were currently editing this specific draft, clear the form
      if (editingId === id) {
        setEditingId(null)
        setExistingAttachments([])
        setFiles([])
        const form = document.querySelector("form")
        if (form) form.reset()
      }

      loadNominations()
    } else {
      alert("Error: " + res.message)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // ... existing handleSubmit logic ...
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("action", actionValue)
    formData.set("existing_attachments", JSON.stringify(existingAttachments))

    files.forEach((file) => formData.append("attachments", file))

    const res = await createOrUpdateNomination(formData)
    setLoading(false)

    // if (res.success) {
    //   alert("Success: " + res.message)
    //   loadNominations()
    //   setEditingId(null)
    //   setExistingAttachments([])
    //   setFiles([])
    //   e.currentTarget.reset()
    // } else {
    //   alert("Error: " + res.message)
    // }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
       {/* ... Existing Form JSX ... */}
       <h1 className="text-2xl font-semibold mb-4">Nomination Form</h1>

      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded bg-white shadow">
        <input type="hidden" name="nomination_id" value={editingId ?? ""} />
        <input type="hidden" name="action" value={actionValue} />

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
          <label>Achievements</label>
          <textarea name="achievements" className="border w-full p-2" required />
        </div>

        {existingAttachments.length > 0 && (
          <div className="border p-3 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Existing Attachments</h4>
            <ul className="space-y-2">
              {existingAttachments.map((att, index) => (
                <li key={att.id} className="flex justify-between items-center bg-white p-2 border rounded">
                  <a
                    href={`https://drive.google.com/file/d/${att.drive_file_id}/view`}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    {att.file_name}
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      setExistingAttachments(prev => prev.filter((_, i) => i !== index))
                    }
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label>Upload New Attachments</label>
          <input
            type="file"
            multiple
            onChange={(e) => {
              const selected = Array.from(e.target.files || [])
              setFiles(prev => [...prev, ...selected])
            }}
            className="mt-1"
          />
          {files.length > 0 && (
            <div className="mt-3 border rounded p-3 bg-gray-50">
              <h4 className="font-medium mb-2">Files to Upload</h4>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-white p-2 border rounded"
                  >
                    <span className="text-sm">
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            onClick={() => setActionValue("save")}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="submit"
            disabled={loading}
            onClick={(e) => {
              const ok = confirm(
                "Are you sure you want to submit? You cannot edit afterwards."
              )
              if (!ok) {
                e.preventDefault()
                return
              }
              setActionValue("submit")
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </form>

      <h2 className="text-xl font-semibold mt-10 mb-4">My Nominations</h2>

      <div className="space-y-4">
        {nominations.map((nom) => (
          <div key={nom.id} className="border p-4 rounded shadow bg-white relative">
            <div className="flex justify-between">
              <h3 className="font-bold text-lg">{nom.nominee_name}</h3>
              <span className={`text-sm px-2 py-1 rounded ${nom.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {nom.status}
              </span>
            </div>

            {/* 3. Updated Action Buttons Section */}
            {nom.status === "in_progress" && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm shadow hover:bg-blue-700 transition"
                  onClick={() => startEditing(nom)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm shadow hover:bg-red-700 transition"
                  onClick={() => handleDeleteDraft(nom.id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            )}

            <p className="mt-6 text-gray-700">
              <strong>Category:</strong> {nom.category}<br />
              <strong>Position:</strong> {nom.position}<br />
              <strong>Unit:</strong> {nom.unit}
            </p>

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