"use client"

import type React from "react"
import { useState, useRef } from "react"

export interface TableColumn {
  key: string
  label: string
  width?: string
  render?: (value: any, row: any) => React.ReactNode
}

export interface TableRow {
  [key: string]: any
}

interface ScrollableTableProps {
  columns: TableColumn[]
  data: TableRow[]
  onActionClick?: (action: string, row: TableRow) => void
  headerBgColor?: string
  headerTextColor?: string
}

export function ScrollableTable({
  columns,
  data,
  onActionClick,
  headerBgColor = "bg-[#8B1538]",
  headerTextColor = "text-white",
}: ScrollableTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1 max-h-[440px] overflow-y-auto">
        <div className="w-full">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className={`${headerBgColor} ${headerTextColor}`}>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-sm font-semibold whitespace-nowrap ${column.width || "w-auto"}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-gray-200 transition-colors ${
                    hoveredRow === rowIndex ? "bg-gray-50" : "bg-white"
                  }`}
                  onMouseEnter={() => setHoveredRow(rowIndex)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {columns.map((column) => (
                    <td
                      key={`${rowIndex}-${column.key}`}
                      className={`px-6 py-4 text-sm text-gray-700 whitespace-nowrap ${column.width || "w-auto"}`}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

interface StatusBadgeProps {
  status: "Qualified" | "Disqualified"
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isQualified = status === "Qualified"
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
        isQualified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {status}
    </span>
  )
}

interface ActionsMenuProps {
  onEvaluate?: () => void
}

export function ActionsMenu({ onEvaluate }: ActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
        aria-label="Actions menu"
      >
        <span className="text-lg font-bold text-gray-600">•••</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              onEvaluate?.()
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg"
          >
            Evaluate
          </button>
        </div>
      )}
    </div>
  )
}