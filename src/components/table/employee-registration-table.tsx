"use client";
import React from "react";
import clsx from "clsx";

export interface Column {
  key: string;
  label: string;
}

interface TableProps<T> {
  columns: Column[];
  data: T[];
  renderActions?: (row: T, index: number) => React.ReactNode;
}

export default function Table<T>({ columns, data, renderActions }: TableProps<T>) {
  return (
    <div className="overflow-auto border border-gray-200 rounded-md flex-1 max-h-[60vh]">
      <table className="w-full text-sm border-collapse min-w-[1200px]">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="py-3 px-4 font-medium text-left sticky top-0 bg-[#7b1020] z-20 text-white"
              >
                {col.label}
              </th>
            ))}
            {renderActions && (
              <th className="py-3 px-4 font-medium text-right sticky top-0 right-0 bg-[#7b1020] z-30 text-white">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white text-gray-800">
          {data.map((row, i) => (
            <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
              {columns.map((col) => {
                const value = (row as any)[col.key];
                
                // Role column badge
                if (col.key === "role") {
                  return (
                    <td key={col.key} className="py-3 px-4">
                      <span
                        className={clsx(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          value === "Nominator" && "bg-blue-100 text-blue-800",
                          value === "Committee" && "bg-green-100 text-green-800"
                        )}
                      >
                        {value}
                      </span>
                    </td>
                  );
                }

                return <td key={col.key} className="py-3 px-4">{value}</td>;
              })}
              {renderActions && (
                <td className="py-3 px-4 text-right sticky right-0 bg-white z-20">
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
