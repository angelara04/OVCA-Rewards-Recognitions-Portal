"use client";

import Dropdown from "@/components/dropdown";
import React, { useMemo, useState, useEffect } from "react";
import { FolderX, MoreHorizontal } from "lucide-react";
import Section from "@/components/section";
import Button from "@/components/button";
import Table, { Column } from "@/components/table/committee-table";
import DropdownMenu from "@/components/dropdown-menu";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import {
  getCommitteeDashboardData,
  type CommitteeNomination,
} from "@/app/admin/committee/actions";

interface Nominee {
  nomineeid: string;
  nomineename: string;
  category: string;
  nominatorid: string;
  nominatorname: string;
  datesubmitted: string;
  status: string;
}

export default function CommitteeScoring() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedCategory, setSelectedCategory] = useState("Select Category");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [data, setData] = useState<Nominee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCategory("Select Category");
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadForCategory() {
      setLoading(true);
      setFetchError(null);

      try {
        const serverRows: CommitteeNomination[] =
          await getCommitteeDashboardData();

        if (!mounted) return;

        const mapped: Nominee[] = (serverRows || [])
          .filter((r) => r.category)
          .map((r) => ({
            nomineeid: r.id,
            nomineename: r.nominee_name ?? "",
            category: r.category ?? "",
            nominatorid: r.nominator_id ?? "",
            nominatorname: r.nominator_name ?? "",
            datesubmitted: r.submitted_at
              ? new Date(r.submitted_at).toLocaleDateString("en-PH")
              : "",
            status: r.my_status ?? "Not Started",
          }));

        setData(mapped);
      } catch (err: any) {
        console.error("Failed to load nominations:", err);
        setFetchError(err?.message ?? "Failed to fetch nominations");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadForCategory();
    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  const filteredData = useMemo(() => {
    let result = data;

    if (selectedCategory !== "Select Category") {
      result = result.filter((d) => d.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d) =>
        Object.values(d).join(" ").toLowerCase().includes(q)
      );
    }

    return result;
  }, [data, selectedCategory, searchQuery]);

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

  // Navigate to scoring
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

  // Navigate to view-only page
  const handleView = (nominee: Nominee) => {
    router.push(
      `/committee/committee-scoring/view/${
        nominee.nomineeid
      }?nomineeid=${encodeURIComponent(
        nominee.nomineeid
      )}&nomineename=${encodeURIComponent(nominee.nomineename)}`
    );
  };

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
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

      <Section width="w-full" height="h-auto" alignment="p-10 mb-4">
        <h2 className="font-bold text-2xl text-[var(--black)] mb-4">
          Select Nominee Category
        </h2>

        <Dropdown
          displayText={selectedCategory}
          options={[
            { label: "Select Category", href: "#", onClick: () => {} },
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
          onSelect={(label) => setSelectedCategory(label)}
        />

        <div className="w-full max-w-7xl min-h-[65vh] flex flex-col relative content-area">
          <div className="mt-4 flex-1 w-full relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center h-full gap-3">
                <div className="w-10 h-10 border-4 border-[var(--maroon)] border-t-transparent rounded-full animate-spin" />
                <p className="text-[var(--dark-grey)] text-sm font-medium">
                  Loading...
                </p>
              </div>
            ) : fetchError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full text-red-500">
                <p className="font-bold">Failed to load nominations</p>
                <p className="text-sm mt-2">{fetchError}</p>
              </div>
            ) : hasResults ? (
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

          {/* Evaluate or View depending on status */}
          {typeof window !== "undefined" &&
            openDropdownIndex !== null &&
            dropdownPosition && (
              <DropdownMenu
                position={dropdownPosition}
                onCloseAction={() => setOpenDropdownIndex(null)}
                items={[
                  filteredData[openDropdownIndex!].status === "Completed"
                    ? {
                        label: "View",
                        color: "text-black",
                        onClickAction: () => {
                          const selectedNominee =
                            filteredData[openDropdownIndex!];
                          handleView(selectedNominee);
                          setOpenDropdownIndex(null);
                        },
                      }
                    : {
                        label: "Evaluate",
                        color: "text-black",
                        onClickAction: () => {
                          const selectedNominee =
                            filteredData[openDropdownIndex!];
                          handleEvaluate(selectedNominee);
                          setOpenDropdownIndex(null);
                        },
                      },
                ]}
              />
            )}
        </div>
      </Section>
    </Section>
  );
}
