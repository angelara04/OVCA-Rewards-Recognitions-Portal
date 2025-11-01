"use client";
import React from "react";
import clsx from "clsx";
import Role from "@/components/greetings/role";
import { StatusBadge } from "@/components/table/status-badge";

export interface Column {
  key: string;
  label: string;
}

interface TableProps<T> {
  columns: Column[];
  data: T[];
  renderActions?: (row: T, index: number) => React.ReactNode;
}

export default function Table<T>({
  columns,
  data,
  renderActions,
}: TableProps<T>) {
  return (
    <div className="overflow-auto border border-[var(--outline-grey)] rounded-md flex-1 h-[60vh] relative">
      <table className="w-full text-xs border-collapse min-w-[1400px]">
        {/* Header */}
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key}
                className={clsx(
                  "py-3 px-4 font-medium text-left sticky top-0 bg-[var(--maroon)] z-20 text-white",
                  "border-none"
                )}
              >
                {col.label}
              </th>
            ))}
            {renderActions && (
                <th
                  className="sticky top-0 right-0 bg-[var(--maroon)] z-40 text-white px-4 py-3 text-center"
                >
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
                const value = (row as any)[col.key];
                const isLast = idx === columns.length - 1;

                // Role column
                if (col.key === "role") {
                  const normalized =
                    typeof value === "string" ? value.toLowerCase() : value;
                  const normalizedKey = normalized.includes("hr")
                    ? "hr"
                    : normalized.includes("committee")
                    ? "committee"
                    : "nominator";
                  return (
                    <td
                      key={col.key}
                      className={clsx(
                        "py-3 px-4",
                        !isLast && "border-r border-[var(--outline-grey)]"
                      )}
                    >
                      <Role role={normalizedKey} />
                    </td>
                  );
                }

                // Date Registered column
                if (col.key === "dateRegistered") {
                  return (
                    <td
                      key={col.key}
                      className={clsx(
                        "py-3 px-4 text-gray-700 text-xs",
                        !isLast && "border-r border-[var(--outline-grey)]"
                      )}
                    >
                      {value}
                    </td>
                  );
                }

                // Status column
                if (col.key === "status") {
                  const statusStr =
                    typeof value === "string" ? value.toLowerCase() : "";
                  const mappedStatus =
                    statusStr === "pending"
                      ? "Pending"
                      : statusStr === "approved"
                      ? "Approved"
                      : statusStr === "rejected"
                      ? "Rejected"
                      : (value as
                          | "In Progress"
                          | "Complete"
                          | "Not Started"
                          | "Pending"
                          | "Approved"
                          | "Rejected");
                  return (
                    <td
                      key={col.key}
                      className={clsx(
                        "py-3 px-4",
                        !isLast && "border-r border-[var(--outline-grey)]"
                      )}
                    >
                      <StatusBadge status={mappedStatus} />
                    </td>
                  );
                }

                // Default rendering
                return (
                  <td
                    key={col.key}
                    className={clsx(
                      "py-3 px-4",
                      !isLast && "border-r border-[var(--outline-grey)]"
                    )}
                  >
                    {(value ?? "").toString()}
                  </td>
                );
              })}

            {renderActions && (
              <td className=" sticky right-0 bg-white z-30 w-[100px] border-l border-[var(--outline-grey)]">
                <div className="flex items-center justify-center h-full">
                  {renderActions(row, i)}
                </div>
              </td>
            )}

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
