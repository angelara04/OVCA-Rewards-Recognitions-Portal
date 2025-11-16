"use client"

import { useState } from "react"
import { createOrUpdateNomination } from "./actions"

export default function NominationForm() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const res = await createOrUpdateNomination(formData)

    setLoading(false)

    if (res.success) {
      alert("Success: " + res.message)
    } else {
      alert("Error: " + res.message)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Nomination Form</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <button
  type="submit"
  disabled={loading}
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
>
  {loading ? "Saving..." : "Save Nomination"}
</button>
      </form>
    </div>
  )
}
