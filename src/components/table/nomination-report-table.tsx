"use client"
import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import clsx from "clsx"
import { MoreHorizontal, Download, Eye } from "lucide-react"

export interface Column {
  key: string
  label: string
  width?: number | string
  render?: (value: any, row: any, rowIndex: number) => React.ReactNode
}

interface TableProps<T> {
  columns: Column[]
  data: T[]
  onDownloadAction?: (row: T, index: number) => void 
  onViewAction?: (row: T, index: number) => void 
  minTableWidth?: number | string
}

export default function NominationReportTable<T>({
  columns,
  data,
  onDownloadAction,
  onViewAction,
  minTableWidth = "1400px",
}: TableProps<T>) {
  
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null)
  const actionButtonRef = useRef<HTMLButtonElement>(null)

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

  const hasActions = onDownloadAction || onViewAction
  
  const calculatePosition = useCallback((buttonElement: HTMLButtonElement) => {
    const rect = buttonElement.getBoundingClientRect()
    const DROPDOWN_WIDTH = 144
    const RIGHT_OFFSET = 10
    
    setDropdownPosition({
      top: rect.bottom + 10, 
      left: rect.right - DROPDOWN_WIDTH - RIGHT_OFFSET, 
    })
  }, [])
  
  const handleActionClick = (index: number, buttonElement: HTMLButtonElement) => {
    if (openDropdownIndex === index) {
      setOpenDropdownIndex(null)
      setDropdownPosition(null)
    } else {
      setOpenDropdownIndex(index)
      calculatePosition(buttonElement)
      actionButtonRef.current = buttonElement
    }
  }

  // Handle click outside to close the dropdown
  useEffect(() => {
    const closeDropdown = (event: MouseEvent) => {
      if (actionButtonRef.current && !actionButtonRef.current.contains(event.target as Node)) {
        setOpenDropdownIndex(null)
        setDropdownPosition(null)
      }
    }

    if (openDropdownIndex !== null) {
      document.addEventListener('mousedown', closeDropdown)
      window.addEventListener('scroll', () => {
        if (actionButtonRef.current) {
          calculatePosition(actionButtonRef.current)
        }
      })
    }
    
    return () => {
      document.removeEventListener('mousedown', closeDropdown)
      window.removeEventListener('scroll', () => {})
    }
  }, [openDropdownIndex, calculatePosition])


  const handleActionSelect = (action: 'download' | 'view', row: T, index: number) => {
    setOpenDropdownIndex(null)
    setDropdownPosition(null)
    if (action === 'download' && onDownloadAction) {
      onDownloadAction(row, index)
    }
    if (action === 'view' && onViewAction) {
      onViewAction(row, index)
    }
  }

  return (
    <div className="overflow-auto border border-[var(--outline-grey)] rounded-md flex-1 max-h-[420px]">
      <table
        className="w-full text-xs border-collapse"
        style={{
          minWidth: typeof minTableWidth === "number" ? `${minTableWidth}px` : minTableWidth,
        }}
      >
        {/* ... (colgroup and thead remain unchanged) ... */}
        <colgroup>
          {columns.map((c) => (
            typeof c.width === "number" ? (
              <col key={c.key} style={{ width: `${c.width}px` }} />
            ) : typeof c.width === "string" && /^(?:\d+(?:px|%)|rem|em)$/.test(c.width) ? (
              <col key={c.key} style={{ width: c.width }} />
            ) : (
              <col key={c.key} />
            )
          ))}
          {hasActions && <col key="__actions" style={{ width: 72 }} />}
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
            {hasActions && (
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

              {/* ACTIONS COLUMN */}
              {hasActions && (
                <td 
                  className="py-3 px-3 text-center sticky right-0 bg-white z-20 border-l border-[var(--outline-grey)]"
                > 
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={(e) => handleActionClick(i, e.currentTarget)}
                      className="text-[var(--maroon)] hover:cursor-pointer transition-colors p-1 rounded-full hover:bg-[var(--outline-grey)] focus:outline-none"
                      aria-expanded={openDropdownIndex === i}
                      aria-label="More Actions"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* FIXED POSITION DROPDOWN (Rendered outside the table structure) */}
      {openDropdownIndex !== null && dropdownPosition && data[openDropdownIndex] && (
          <div
            className="z-[100] w-36 origin-top-right rounded-md shadow-lg bg-white"
            role="menu"
            style={{
              position: 'fixed',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
          >
            {/* FIX: Removed py-1 from wrapper div */}
            <div>
              
              {/* View Option */}
              {onViewAction && (
                <button
                  onClick={() => handleActionSelect('view', data[openDropdownIndex], openDropdownIndex)}
                  // FIX: Increased horizontal padding px-4 to ensure full width usage
                  className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" 
                  role="menuitem"
                >
                  View
                </button>
              )}
              
              {/* Download Option */}
              {onDownloadAction && (
                <button
                  onClick={() => handleActionSelect('download', data[openDropdownIndex], openDropdownIndex)}
                  disabled={isDownloadDisabled(data[openDropdownIndex])}
                  // FIX: Increased horizontal padding px-4 to ensure full width usage
                  className={clsx(
                    "group flex items-center w-full px-4 py-2 text-sm",
                    isDownloadDisabled(data[openDropdownIndex])
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                  role="menuitem"
                >
                  Download
                </button>
              )}
            </div>
          </div>
      )}
    </div>
  )
}