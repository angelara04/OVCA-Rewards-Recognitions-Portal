"use client"
import type React from "react"
import clsx from "clsx"
import { Download } from "lucide-react"

export interface Column {
  key: string
  label: string
  width?: number | string
  render?: (value: any, row: any, rowIndex: number) => React.ReactNode
}

interface TableProps<T> {
  columns: Column[]
  data: T[]
  onDownloadClick?: (row: T, index: number) => void
  minTableWidth?: number | string
}

export default function NominationReportTable<T>({
  columns,
  data,
  onDownloadClick,
  minTableWidth = "1400px",
}: TableProps<T>) {
  const renderCellValue = (col: Column, row: any, rowIndex: number) => {
    const raw = row?.[col.key]

    if (col.render) return col.render(raw, row, rowIndex)

    if (col.key === "committeescore" || col.key === "averagescore" || col.key === "remarks") {
      const status = row?.status || ""
      if (status === "NOT STARTED") return "---"
      if (status === "ON GOING" && !raw) return "null"
      return (raw ?? "").toString()
    }

    if (col.key === "datescored" || col.key === "dateregistered" || col.key === "datesubmitted") {
      if (!raw) return "-"
      try {
        const d = new Date(raw)
        if (isNaN(d.getTime())) return raw
        return d.toLocaleDateString("en-PH")
      } catch {
        return raw
      }
    }

    return (raw ?? "").toString()
  }

  const isDownloadDisabled = (row: any) => {
    return row?.status === "NOT STARTED" || row?.status === "ON GOING"
  }

  return (
    <div className="overflow-auto border border-[var(--outline-grey)] rounded-md flex-1 max-h-[420px]">
      <table
        className="w-full text-xs border-collapse"
        style={{
          minWidth: typeof minTableWidth === "number" ? `${minTableWidth}px` : minTableWidth,
        }}
      >
        {/* Header */}
        <colgroup>
          {columns.map((c) => {
            if (typeof c.width === "number") {
              return <col key={c.key} style={{ width: `${c.width}px` }} />
            }
            if (typeof c.width === "string" && /^(?:\d+(?:px|%)|rem|em)$/.test(c.width)) {
              return <col key={c.key} style={{ width: c.width }} />
            }
            return <col key={c.key} />
          })}
          {onDownloadClick && <col key="__download" style={{ width: 72 }} />}
        </colgroup>

        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  "py-3 px-4 font-medium sticky top-0 bg-[var(--maroon)] z-20 text-white",
                  "border-none text-left",
                )}
                style={typeof col.width === "number" ? { width: `${col.width}px` } : undefined}
              >
                {col.label}
              </th>
            ))}
            {onDownloadClick && (
              <th className="py-3 px-4 font-medium text-center sticky top-0 right-0 bg-[var(--maroon)] z-30 text-white border-none">
                Actions
              </th>
            )}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="bg-white text-gray-800">
          {data.map((row, i) => (
            <tr key={i} className="border-b border-[var(--outline-grey)] hover:bg-gray-50 transition-colors">
              {columns.map((col, idx) => {
                const isLast = idx === columns.length - 1
                return (
                  <td
                    key={col.key}
                    className={clsx(
                      "py-3 px-4 align-top",
                      !isLast && "border-r border-[var(--outline-grey)]",
                      "text-left",
                    )}
                    style={typeof col.width === "number" ? { width: `${col.width}px` } : undefined}
                  >
                    {renderCellValue(col, row, i)}
                  </td>
                )
              })}

              {/* Download Actions column */}
              {onDownloadClick && (
                <td className="py-3 px-3 text-center sticky right-0 bg-white z-20 border-l border-[var(--outline-grey)]">
                  <button
                    onClick={() => onDownloadClick(row, i)}
                    disabled={isDownloadDisabled(row)}
                    className={clsx(
                      "transition-colors",
                      isDownloadDisabled(row)
                        ? "text-[var(--dark-grey)] cursor-not-allowed"
                        : "text-[var(--maroon)] hover:cursor-pointer",
                    )}
                    aria-label="Download"
                  >
                    <Download size={18} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
