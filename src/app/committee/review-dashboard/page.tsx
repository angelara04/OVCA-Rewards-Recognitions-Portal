"use client";
import React, { useMemo, useState } from "react";
import { FolderX, MoreHorizontal } from "lucide-react";
import Section from "@/components/section";
import Card from "@/components/card";
import Button from "@/components/button";
import { SearchBar } from "@/components/search-bar";
import Table, { Column } from "@/components/table/committee-table";
import DropdownMenu from "@/components/dropdown-menu";

interface Nominee {
  nomineeid: string;
  nomineename: string;
  category: string;
  nominatorid: string;
  nominatorname: string;
  datesubmitted: string; // ISO or parsable date
  status: string;
}

export default function ReviewDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const data: Nominee[] = useMemo(
    () =>
      Array(12)
        .fill(null)
        .map((_, i) => ({
          nomineeid: `E012501125`,
          nomineename: `Maria Del Santos ${i + 1}`,
          category: "Administrative Excellence",
          nominatorid: `E012501125`,
          nominatorname: "Jose Rizal",
          datesubmitted: `2025-10-${(12 - (i % 10))
            .toString()
            .padStart(2, "0")}`,
          status:
            i % 4 === 0
              ? "In Progress"
              : i % 4 === 1
              ? "Complete"
              : i % 4 === 2
              ? "Not Started"
              : "Complete",
        })),
    []
  );

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((d) =>
      Object.values(d).join(" ").toLowerCase().includes(q)
    );
  }, [searchQuery, data]);

  const columns: Column[] = useMemo(
    () => [
      { key: "nomineeid", label: "Nominee ID", width: 160 },
      { key: "nomineename", label: "Nominee Name", width: 260 },
      { key: "category", label: "Category", width: 260 },
      { key: "nominatorid", label: "Nominator ID", width: 160 },
      { key: "nominatorname", label: "Nominator Name", width: 220 },
      { key: "datesubmitted", label: "Date Submitted", width: 140 },
      { key: "status", label: "Status", width: 140 },
    ],
    []
  );

  const hasResults = filteredData.length > 0;

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 w-full max-w-7xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">
            Committee Review Dashboard
          </h1>
          <p className="text-base text-[var(--dark-grey)]">
            Welcome to the committee review dashboard. Here you can view and
            score nominations
          </p>
        </div>
        <Button size="sm" variant="secondary">
          <div className="px-5 py-1">Back to Dashboard</div>
        </Button>
      </div>

      {/* Cards */}
      <div className="w-[75%] max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 justify-items-center">
        <Card description="Pending Review" number={10} />
        <Card description="Completed Scoring" number={2} />
        <Card description="Total Nominations" number={12} />
      </div>

      {/* Content area (used for dropdown positioning) */}
      <div className="w-full max-w-7xl  min-h-[65vh] flex flex-col relative content-area">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nominations</h2>

        <SearchBar
          value={searchQuery}
          onChange={(v: string) => setSearchQuery(v)}
          placeholder="Search by name, department, or email"
        />

        <div className="mt-4 flex-1 w-full relative">
          {hasResults ? (
            <Table
              columns={columns}
              data={filteredData}
              minTableWidth={1200}
              renderActions={(_row, i) => {
                // left border that stays with sticky actions column
                return (
                  <div className="h-full flex items-center justify-end pl-3">
                    <button
                      onClick={(e) => {
                        const buttonRect = (
                          e.currentTarget as HTMLElement
                        ).getBoundingClientRect();
                        const containerRect = document
                          .querySelector(".content-area")!
                          .getBoundingClientRect();
                        setDropdownPosition({
                          top: buttonRect.bottom - containerRect.top + 6,
                          left: buttonRect.left - containerRect.left - 90,
                        });
                        setOpenDropdownIndex(
                          openDropdownIndex === i ? null : i
                        );
                      }}
                      className="text-[var(--maroon)] hover:text-[var(--maroon)]"
                      aria-label="Actions"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                );
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full text-gray-500">
              <FolderX size={100} className="mb-4 opacity-70" />
              <p className="font-bold text-3xl">No Results Found</p>
            </div>
          )}
        </div>

        {/* Dropdown */}
        {typeof window !== "undefined" &&
          openDropdownIndex !== null &&
          dropdownPosition && (
            <DropdownMenu
              position={dropdownPosition}
              onCloseAction={() => setOpenDropdownIndex(null)}
              items={[
                {
                  label: "Evaluate",
                  // use black text (per your spec)
                  color: "text-black",
                  onClickAction: () => {
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
