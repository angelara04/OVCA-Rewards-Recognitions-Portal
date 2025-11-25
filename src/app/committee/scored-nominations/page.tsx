"use client";
import React, { useState, useMemo } from "react";
import { FolderX, MoreHorizontal } from "lucide-react";
import Button from "@/components/button";
import { SearchBar } from "@/components/search-bar";
import Table, { Column } from "@/components/table/committee-table";
import DropdownMenu from "@/components/dropdown-menu";

import Section from "@/components/section";

interface Employee {
  nomineeid: string;
  nomineename: string;
  category: string;
  nominatorid: string;
  nominatorname: string;
  datescored: string;
  totalscore: number;
  status: string;
}

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Sample Data
  const data: Employee[] = Array(25)
    .fill(null)
    .map((_, i) => {
      const date = new Date(Date.now() - i * 86400000);
      const datesubmitted = date.toLocaleDateString("en-PH");
      const totalscore = i * 10;
      const status = totalscore >= 70 ? "Qualified" : "Disqualified";
      return {
        nomineeid: `E0125${1000 + i}`,
        nomineename: `Maria Del Santos ${i + 1}`,
        category: "Administrative Excellence",
        nominatorid: `E0125${2000 + i}`,
        nominatorname: `Jose Rizal ${i + 1}`,
        datescored: datesubmitted,
        totalscore,
        status,
      };
    });

  // Filtered Data (search only)
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((d) =>
      Object.values(d).join(" ").toLowerCase().includes(q)
    );
  }, [searchQuery, data]);

  const hasResults = filteredData.length > 0;

  const columns: Column[] = [
    { key: "nomineeid", label: "Nominee ID" },
    { key: "nomineename", label: "Nominee Name" },
    { key: "category", label: "Category" },
    { key: "nominatorid", label: "Nominator ID" },
    { key: "nominatorname", label: "Nominator Name" },
    { key: "datescored", label: "Date Scored" },
    { key: "totalscore", label: "Total Score" },
    { key: "status", label: "Status" },
  ];

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">
            Scored Nominations
          </h1>
          <p className="text-base text-[var(--dark-grey)]">
            Nominations that have been scored by the committee
          </p>
        </div>
        <Button size="sm" variant="secondary">
          <div className="px-5 py-1">Back to Dashboard</div>
        </Button>
      </div>

      {/* Content */}
      <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] rounded-xl shadow-sm -mt-[1px] px-6 py-6 min-h-[75vh] flex flex-col relative content-area">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Completed Scored Nominations
        </h2>
        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChange={(val: string) => setSearchQuery(val)}
          placeholder="Search by nominee name"
        />

        {/* Table Container */}
        <div className="mt-4 border border-[var(--outline-grey)] rounded-md bg-[var(--white)] min-h-[60vh] flex flex-col w-full relative">
          {hasResults ? (
            <div className="w-full overflow-auto">
              <Table
                columns={columns}
                data={filteredData}
                renderActions={(_row, i) => {
                  const employee = filteredData[i];
                  // allow interaction for both statuses
                  const isInteractive =
                    employee.status === "Qualified" ||
                    employee.status === "Disqualified";
                  const iconColor = isInteractive
                    ? "text-[var(--maroon)]"
                    : "text-[var(--outline-grey)]";
                  const cursor = isInteractive
                    ? "cursor-pointer"
                    : "cursor-not-allowed";

                  return (
                    <button
                      // enable for both statuses
                      disabled={!isInteractive}
                      className={`${iconColor} ${cursor}`}
                      onClick={(e) => {
                        if (!isInteractive) return;
                        const buttonRect = (
                          e.currentTarget as HTMLElement
                        ).getBoundingClientRect();
                        const containerRect = document
                          .querySelector(".content-area")!
                          .getBoundingClientRect();
                        setDropdownPosition({
                          top: buttonRect.bottom - containerRect.top + 4,
                          left: buttonRect.left - containerRect.left - 90,
                        });
                        setOpenDropdownIndex(
                          openDropdownIndex === i ? null : i
                        );
                      }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  );
                }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full text-gray-500">
              <FolderX size={100} className="mb-4 opacity-70" />
              <p className="font-bold text-3xl">No Results Found</p>
            </div>
          )}
        </div>

        {/* Dropdown (single Evaluate action) */}
        {typeof window !== "undefined" &&
          openDropdownIndex !== null &&
          dropdownPosition && (
            <DropdownMenu
              position={dropdownPosition}
              onCloseAction={() => setOpenDropdownIndex(null)}
              items={[
                {
                  label: "View",
                  color: "text-black",
                  onClickAction: () => {
                    // replace with navigation/handler to evaluation page
                    console.log("Evaluate", filteredData[openDropdownIndex!]);
                    setOpenDropdownIndex(null);
                  },
                },
              ]}
            />
          )}
      </div>
    </Section>
  );
}
