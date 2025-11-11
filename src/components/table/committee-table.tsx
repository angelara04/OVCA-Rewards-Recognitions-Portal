"use client";
import React from "react";
import clsx from "clsx";
import { StatusBadge } from "@/components/table/status-badge";

export interface Column {
  key: string;
  label: string;
  width?: number | string; // px number or Tailwind class / CSS size string
  // custom renderer: (value, row, rowIndex) => ReactNode
  render?: (value: any, row: any, rowIndex: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column[];
  data: T[];
  renderActions?: (row: T, index: number) => React.ReactNode;
  // optional min table width to avoid horizontal gaps
  minTableWidth?: number | string;
}

export default function Table<T>({
  columns,
  data,
  renderActions,
  minTableWidth = "1400px",
}: TableProps<T>) {
  const renderCellValue = (col: Column, row: any, rowIndex: number) => {
    const raw = row?.[col.key];

    // priority: custom renderer from column
    if (col.render) return col.render(raw, row, rowIndex);

    if (
      col.key === "dateRegistered" ||
      col.key === "datesubmitted" ||
      col.key === "datescored"
    ) {
      if (!raw) return "-";
      try {
        const d = new Date(raw);
        if (isNaN(d.getTime())) return raw;
        return d.toLocaleDateString("en-PH");
      } catch {
        return raw;
      }
    }

    if (col.key === "status") {
      // map incoming values to StatusBadge expected labels
      const statusStr = typeof raw === "string" ? raw : "";
      const mappedStatus =
        statusStr.toLowerCase() === "pending"
          ? "Pending"
          : statusStr.toLowerCase() === "approved"
          ? "Approved"
          : statusStr.toLowerCase() === "rejected"
          ? "Rejected"
          : statusStr.toLowerCase() === "completed"
          ? "Completed"
          : statusStr; // allow "In Progress", "Qualified", etc.
      return <StatusBadge status={mappedStatus as any} />;
    }

    // default
    return (raw ?? "").toString();
  };

  return (
    <div className="overflow-auto border border-[var(--outline-grey)] rounded-md flex-1 h-[60vh]">
      <table
        className="w-full text-xs border-collapse"
        style={{
          minWidth:
            typeof minTableWidth === "number"
              ? `${minTableWidth}px`
              : minTableWidth,
        }}
      >
        {/* Header */}
        <colgroup>
          {columns.map((c) => {
            if (typeof c.width === "number") {
              return <col key={c.key} style={{ width: `${c.width}px` }} />;
            }
            if (
              typeof c.width === "string" &&
              /^(?:\d+(?:px|%)|rem|em)$/.test(c.width)
            ) {
              return <col key={c.key} style={{ width: c.width }} />;
            }
            // no explicit width: allow browser to size
            return <col key={c.key} />;
          })}
          {renderActions && <col key="__actions" style={{ width: 72 }} />}
        </colgroup>

        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  "py-3 px-4 font-medium sticky top-0 bg-[var(--maroon)] z-20 text-white",
                  "border-none",
                  // force left-aligned header text
                  "text-left"
                )}
                // allow explicit style for header cell width when a numeric width was given
                style={
                  typeof col.width === "number"
                    ? { width: `${col.width}px` }
                    : undefined
                }
              >
                {col.label}
              </th>
            ))}
            {renderActions && (
              <th className="py-3 px-4 font-medium text-right sticky top-0 right-0 bg-[var(--maroon)] z-30 text-white border-none">
                Actions
              </th>
            )}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="bg-white text-gray-800">
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[var(--outline-grey)] hover:bg-gray-50 transition-colors"
            >
              {columns.map((col, idx) => {
                const isLast = idx === columns.length - 1;
                return (
                  <td
                    key={col.key}
                    className={clsx(
                      "py-3 px-4 align-top",
                      !isLast && "border-r border-[var(--outline-grey)]",
                      "text-left"
                    )}
                    style={
                      typeof col.width === "number"
                        ? { width: `${col.width}px` }
                        : undefined
                    }
                  >
                    {renderCellValue(col, row, i)}
                  </td>
                );
              })}

              {/* Actions column */}
              {renderActions && (
                <td className="py-3 px-3 text-right sticky right-0 bg-white z-20">
                  {renderActions(row, i)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
