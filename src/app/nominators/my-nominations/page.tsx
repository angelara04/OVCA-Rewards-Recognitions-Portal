"use client";
import React, { useMemo, useState } from "react";
import Section from "@/components/section";
import Card from "@/components/card";
import Button from "@/components/button";
import Table, { Column } from "@/components/table/committee-table";
import { MoreHorizontal, FolderX } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import DropdownMenu from "@/components/dropdown-menu";

export default function MyNominationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // sample rows
  const nominationsData = [
    {
      nomineeid: "E012501125",
      nomineename: "Maria Del Santos",
      category: "Office of the Vice Chancellor",
      datesubmitted: "10/12/2025",
      status: "In Progress",
    },
    {
      nomineeid: "E012501126",
      nomineename: "Juan Dela Cruz",
      category: "Office of the Vice Chancellor",
      datesubmitted: "10/12/2025",
      status: "Completed",
    },
    {
      nomineeid: "E012501127",
      nomineename: "Ana Reyes",
      category: "Office of the Vice Chancellor",
      datesubmitted: "10/12/2025",
      status: "Completed",
    },
    {
      nomineeid: "E012501128",
      nomineename: "Luis Mercado",
      category: "Office of the Vice Chancellor",
      datesubmitted: "10/12/2025",
      status: "Completed",
    },
    {
      nomineeid: "E012501129",
      nomineename: "Clara Santos",
      category: "Office of the Vice Chancellor",
      datesubmitted: "10/12/2025",
      status: "In Progress",
    },
    {
      nomineeid: "E012501130",
      nomineename: "Ramon Lopez",
      category: "Office of the Vice Chancellor",
      datesubmitted: "10/12/2025",
      status: "In Progress",
    },
    {
      nomineeid: "E012501131",
      nomineename: "Maya Cruz",
      category: "Office of the Vice Chancellor",
      datesubmitted: "10/12/2025",
      status: "In Progress",
    },
    {
      nomineeid: "E012501132",
      nomineename: "Pedro Santos",
      category: "Office of the Vice Chancellor",
      datesubmitted: "10/12/2025",
      status: "Completed",
    },
    {
      nomineeid: "E012501133",
      nomineename: "Liza Gomez",
      category: "Office of the Vice Chancellor",
      datesubmitted: "10/12/2025",
      status: "Completed",
    },
    {
      nomineeid: "E012501134",
      nomineename: "Tomas Villanueva",
      category: "Office of the Vice Chancellor",
      datesubmitted: "10/12/2025",
      status: "Completed",
    },
  ];

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return nominationsData;
    return nominationsData.filter((item) =>
      Object.values(item).join(" ").toLowerCase().includes(q)
    );
  }, [searchQuery, nominationsData]);

  const hasResults = filteredData.length > 0;

  // Table columns - adapted for My Nominations (hide Nominee ID if not needed)
  const columns: Column[] = [
    { key: "nomineename", label: "Nominee Name" },
    { key: "category", label: "Category" },
    { key: "datesubmitted", label: "Date Submitted" },
    { key: "status", label: "Status" },
  ];

  function openActionsDropdown(e: React.MouseEvent, index: number) {
    const button = e.currentTarget as HTMLElement;

    // prefer the closest table container (same behavior as dashboard/review pages)
    const tableContainer =
      (button.closest(".table-container") as HTMLElement | null) ??
      (document.querySelector(".table-container") as HTMLElement | null);

    // fallback to content-area if table container not found
    const fallbackContainer =
      (button.closest(".content-area") as HTMLElement | null) ??
      (document.querySelector(".content-area") as HTMLElement | null);

    const container = tableContainer || fallbackContainer;
    const buttonRect = button.getBoundingClientRect();

    if (!container) {
      // viewport fallback
      setDropdownPosition({
        top: buttonRect.bottom + 4,
        left: buttonRect.left - 90,
      });
      setOpenDropdownIndex((prev) => (prev === index ? null : index));
      return;
    }

    const containerRect = container.getBoundingClientRect();
    setDropdownPosition({
      top: buttonRect.bottom - containerRect.top + 4,
      left: buttonRect.left - containerRect.left - 70,
    });
    setOpenDropdownIndex((prev) => (prev === index ? null : index));
  }

  const dropdownItems = useMemo(() => {
    if (openDropdownIndex === null) return [];
    const item = filteredData[openDropdownIndex];
    if (!item) return [];

    if (item.status === "Completed") {
      return [
        {
          label: "View",
          color: "text-black",
          onClickAction: () => {
            console.log("View", item);
            setOpenDropdownIndex(null);
          },
        },
      ];
    }

    if (item.status === "In Progress") {
      return [
        {
          label: "Continue",
          color: "text-black",
          onClickAction: () => {
            console.log("Continue", item);
            setOpenDropdownIndex(null);
          },
        },
        {
          label: "Delete",
          color: "text-red-600",
          onClickAction: () => {
            console.log("Delete", item);
            // implement delete confirmation/handler here
            setOpenDropdownIndex(null);
          },
        },
      ];
    }

    // fallback for other statuses: show Continue
    return [
      {
        label: "Continue",
        color: "text-black",
        onClickAction: () => {
          console.log("Continue", item);
          setOpenDropdownIndex(null);
        },
      },
    ];
  }, [openDropdownIndex, filteredData]);

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">
            My Nominations
          </h1>
          <p className="text-base text-[var(--dark-grey)]">
            View and manage all your nominations.
          </p>
        </div>
        <Button size="sm" variant="primary">
          <div className="px-5 py-1">New Nomination</div>
        </Button>
      </div>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={(val: string) => setSearchQuery(val)}
        placeholder="Search by nominee name"
      />

      {/* Table */}
      <div className="table-container mt-4 border border-[var(--outline-grey)] rounded-md bg-[var(--white)] min-h-[60vh] flex flex-col w-full relative">
        {hasResults ? (
          <div className="w-full overflow-auto">
            <Table
              columns={columns}
              data={filteredData}
              renderActions={(_row, i) => {
                const row = filteredData[i];
                const isInteractive =
                  row.status === "In Progress" || row.status === "Completed";
                const iconColor = isInteractive
                  ? "text-[var(--maroon)]"
                  : "text-[var(--outline-grey)]";
                const cursor = isInteractive
                  ? "cursor-pointer"
                  : "cursor-not-allowed";

                return (
                  <button
                    disabled={!isInteractive}
                    className={`${iconColor} ${cursor}`}
                    onClick={(e) => {
                      if (!isInteractive) return;
                      openActionsDropdown(e, i);
                    }}
                    aria-label="Actions"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                );
              }}
            />

            {/* Dropdown */}
            {typeof window !== "undefined" &&
              openDropdownIndex !== null &&
              dropdownPosition && (
                <DropdownMenu
                  position={dropdownPosition}
                  onCloseAction={() => setOpenDropdownIndex(null)}
                  items={dropdownItems}
                />
              )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full text-gray-500">
            <FolderX size={100} className="mb-4 opacity-70" />
            <p className="font-bold text-3xl">No Results Found</p>
          </div>
        )}
      </div>
    </Section>
  );
}
