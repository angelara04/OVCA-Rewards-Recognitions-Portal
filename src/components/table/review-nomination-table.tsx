import React from "react";
import clsx from "clsx";

interface TableRow {
  nomineeName: string;
  category: string;
  nominator: string;
  dateSubmitted: string;
  status: string;
}

interface TableProps {
  title: string;
  data: TableRow[];
}

export default function Table({ title, data }: TableProps) {
  return (
    <div className="w-[280px] bg-white rounded-xl md:w-[550px] lg:w-full shadow-[0_0px_10px_2px_rgba(0,0,0,0.10)]  p-5">
      {/* Header */}
      <h2 className="font-bold text-2xl text-[var(--black)] mb-4">{title}</h2>

      {/* Table Wrapper for proper rounding */}
      <div className="overflow-y-scroll rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[var(--maroon)] text-white">
            <tr>
              <th className="text-left py-3 px-5 font-medium">Nominee Name</th>
              <th className="text-left py-3 px-5 font-medium">Category</th>
              <th className="text-left py-3 px-5 font-medium">Nominator</th>
              <th className="text-left py-3 px-5 font-medium">
                Date Submitted
              </th>
              <th className="text-left py-3 px-5 font-medium">Status</th>
              <th className="text-left py-3 px-5 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="text-gray-700 bg-white">
            {data.map((row, index) => (
              <tr
                key={index}
                className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="py-3 px-5">{row.nomineeName}</td>
                <td className="py-3 px-5">{row.category}</td>
                <td className="py-3 px-5">{row.nominator}</td>
                <td className="py-3 px-5">{row.dateSubmitted}</td>
                <td className="py-3 px-5">
                  <span
                    className={clsx(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      row.status === "Pending" &&
                        "bg-yellow-100 text-yellow-800",
                      row.status === "Complete" &&
                        "bg-green-100 text-green-700",
                      row.status === "Not Started" &&
                        "bg-gray-100 text-gray-600"
                    )}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-3 px-5">
                  <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-200 transition text-sm">
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
