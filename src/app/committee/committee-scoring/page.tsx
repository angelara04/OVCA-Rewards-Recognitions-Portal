"use client";

import Dropdown from "@/components/dropdown";
import { Category } from "@/app/store/category";
import React, { useMemo, useState } from "react";
import { FolderX, MoreHorizontal } from "lucide-react";
import Section from "@/components/section";
import Button from "@/components/button";
import Table, { Column } from "@/components/table/committee-table";
import DropdownMenu from "@/components/dropdown-menu";
import { useRouter } from "next/navigation";

interface CommitteeScoringProps {
  children?: React.ReactNode;
}

interface Nominee {
  nomineeid: string;
  nomineename: string;
  category: string;
  nominatorid: string;
  nominatorname: string;
  datesubmitted: string;
  status: string;
}

export default function CommitteeScoring({ children }: CommitteeScoringProps) {
  const { selectedCategory } = Category();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // 🧩 Dummy data
  const data: Nominee[] = useMemo(
    () =>
      Array(12)
        .fill(null)
        .map((_, i) => ({
          nomineeid: `E012501125${i}`,
          nomineename: `Maria Del Santos ${i + 1}`,
          category:
            i % 3 === 0
              ? "Non-Teaching Personnel (Junior and Industrial Level)"
              : i % 3 === 1
              ? "Non-Teaching Personnel (Senior Level)"
              : "Non-Teaching Personnel (Non-Supervisory Level)",
          nominatorid: `E012501125`,
          nominatorname: "Jose Rizal",
          datesubmitted: `2025-10-${(12 - (i % 10))
            .toString()
            .padStart(2, "0")}`,
          status:
            i % 4 === 0
              ? "In Progress"
              : i % 4 === 1
              ? "Completed"
              : i % 4 === 2
              ? "Not Started"
              : "Completed",
        })),
    []
  );

  // 🧮 Filter table
  const filteredData = useMemo(() => {
    let result = data;
    if (selectedCategory && selectedCategory !== "Select Category") {
      result = result.filter((d) => d.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d) =>
        Object.values(d).join(" ").toLowerCase().includes(q)
      );
    }
    return result;
  }, [searchQuery, selectedCategory, data]);

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

  // ✅ Revised Evaluate handler (with query params)
  const handleEvaluate = (nominee: Nominee) => {
    let path = "";

    switch (nominee.category) {
      case "Non-Teaching Personnel (Junior and Industrial Level)":
        path = `/committee/committee-scoring/junior/${nominee.nomineeid}`;
        break;
      case "Non-Teaching Personnel (Senior Level)":
        path = `/committee/committee-scoring/senior/${nominee.nomineeid}`;
        break;
      case "Non-Teaching Personnel (Non-Supervisory Level)":
        path = `/committee/committee-scoring/non-supervisory/${nominee.nomineeid}`;
        break;
      default:
        console.warn("Unknown category:", nominee.category);
        return;
    }

    router.push(
      `${path}?nomineeid=${encodeURIComponent(
        nominee.nomineeid
      )}&nomineename=${encodeURIComponent(nominee.nomineename)}`
    );
  };

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">
            Committee Scoring
          </h1>
          <p className="text-base text-[var(--dark-grey)]">
            Welcome to your nomination dashboard. Here you can view and evaluate
            nominees.
          </p>
        </div>
        <Button size="sm" variant="secondary">
          <div className="px-5 py-1">Back to Dashboard</div>
        </Button>
      </div>

      {/* Category Dropdown */}
      <Section width="w-full" height="h-auto" alignment="p-10 mb-4">
        <h2 className="font-bold text-2xl text-[var(--black)] mb-4">
          Select Nominee Category
        </h2>

        <Dropdown
          displayText="Select Category"
          options={[
            {
              label: "Non-Teaching Personnel (Junior and Industrial Level)",
              href: "#",
            },
            { label: "Non-Teaching Personnel (Senior Level)", href: "#" },
            {
              label: "Non-Teaching Personnel (Non-Supervisory Level)",
              href: "#",
            },
          ]}
        />

        {/* Table */}
        <div className="w-full max-w-7xl min-h-[65vh] flex flex-col relative content-area">
          <div className="mt-4 flex-1 w-full relative">
            {hasResults ? (
              <Table
                columns={columns}
                data={filteredData}
                minTableWidth={1200}
                renderActions={(_row, i) => (
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
                )}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full text-gray-500">
                <FolderX size={100} className="mb-4 opacity-70" />
                <p className="font-bold text-3xl">No Results Found</p>
              </div>
            )}
          </div>

          {/* Evaluate Dropdown */}
          {typeof window !== "undefined" &&
            openDropdownIndex !== null &&
            dropdownPosition && (
              <DropdownMenu
                position={dropdownPosition}
                onCloseAction={() => setOpenDropdownIndex(null)}
                items={[
                  {
                    label: "Evaluate",
                    color: "text-black",
                    onClickAction: () => {
                      const selectedNominee = filteredData[openDropdownIndex!];
                      handleEvaluate(selectedNominee);
                      setOpenDropdownIndex(null);
                    },
                  },
                ]}
              />
            )}
        </div>
      </Section>

      {children}
    </Section>
  );
}
