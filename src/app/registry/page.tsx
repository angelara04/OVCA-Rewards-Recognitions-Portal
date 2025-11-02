'use client'

import { registerUser } from './actions'

export default function RegistryPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        action={registerUser}
        className="flex flex-col gap-3 border p-6 rounded-lg shadow-md w-[320px]"
      >
        <h2 className="text-xl font-semibold text-center">Registration Form</h2>

        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="border px-2 py-1 rounded"
        />

        <label htmlFor="department">Department</label>
        <input
          id="department"
          name="department"
          type="text"
          required
          className="border px-2 py-1 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-1.5 rounded mt-3 hover:bg-blue-700"
        >
          Submit Registration
        </button>
      </form>
    </div>
  )
}
