"use client"

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

export function SearchBar({ placeholder = "Search by nominee name", value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-200 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
      />
    </div>
  )
}
