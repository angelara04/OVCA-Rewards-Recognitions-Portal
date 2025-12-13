"use client";
import React, { useMemo, useState, useEffect } from "react";
import { FolderX, MoreHorizontal } from "lucide-react";
import Section from "@/components/section";
import Card from "@/components/card";
import { SearchBar } from "@/components/search-bar";
import Table, { Column } from "@/components/table/committee-table";
import DropdownMenu from "@/components/dropdown-menu";
import { useRouter } from "next/navigation";

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

export default function ReviewDashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [data, setData] = useState<Nominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setFetchError(null);
      try {
        const serverRows: CommitteeNomination[] =
          await getCommitteeDashboardData();
        if (!mounted) return;

        const mapped: Nominee[] = (serverRows || []).map((r) => ({
          nomineeid: r.id,
          nomineename: r.nominee_name ?? "",
          category: r.category ?? "",
          nominatorid: r.nominator_id ?? "",
          nominatorname: r.nominator_name ?? "",
          datesubmitted: r.submitted_at ?? "",
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

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((d) =>
      Object.values(d).join(" ").toLowerCase().includes(q)
    );
  }, [searchQuery, data]);

  const columns: Column[] = useMemo(
    () => [
      { key: "nomineeid", label: "Nominee ID", width: 500 },
      { key: "nomineename", label: "Nominee Name", width: 260 },
      { key: "category", label: "Category", width: 200 },
      { key: "nominatorid", label: "Nominator ID", width: 500 },
      { key: "nominatorname", label: "Nominator Name", width: 220 },
      { key: "datesubmitted", label: "Date Submitted", width: 140 },
      { key: "status", label: "Status", width: 200 },
    ],
    []
  );

  const hasResults = filteredData.length > 0;

  const pendingCount = data.filter((d) => d.status !== "Completed").length;
  const completedCount = data.filter((d) => d.status === "Completed").length;
  const totalCount = data.length;

  const getCategorySlug = (category: string) => {
    if (!category || category.trim() === "") return "unknown";
    switch (category.trim()) {
      case "Non-Teaching Personnel (Junior and Industrial Level)":
        return "junior";
      case "Junior Professionals (SG 1 - 8)":
        return "junior";
      case "Industrial and Allied Professionals (SG 1 - 8)":
        return "junior";
      case "Non-Teaching Personnel (Senior Level)":
        return "senior";
      case "Non-Teaching Personnel (Non-Supervisory Level)":
        return "non-supervisory";
      default:
        return category.toLowerCase().replace(/\s+/g, "-");
    }
  };

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
      </div>

      {/* Cards */}
      <div className="w-[75%] max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 justify-items-center">
        <Card description="Pending Review" number={pendingCount} />
        <Card description="Completed Scoring" number={completedCount} />
        <Card description="Total Nominations" number={totalCount} />
      </div>

      {/* Content area */}
      <div className="w-full max-w-7xl min-h-[65vh] flex flex-col relative content-area">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nominations</h2>
        <SearchBar
          value={searchQuery}
          onChange={(v: string) => setSearchQuery(v)}
          placeholder="Search by name, department, or email"
        />

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
              renderActions={(row, i) => (
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
                      setOpenDropdownIndex(openDropdownIndex === i ? null : i);
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

        {/* Dropdown */}
        {typeof window !== "undefined" &&
          openDropdownIndex !== null &&
          dropdownPosition && (
            <DropdownMenu
              position={dropdownPosition}
              onCloseAction={() => setOpenDropdownIndex(null)}
              items={[
                {
                  label:
                    filteredData[openDropdownIndex!].status === "Completed"
                      ? "View"
                      : "Evaluate",
                  color: "text-black",
                  onClickAction: () => {
                    const item = filteredData[openDropdownIndex!];

                    const id = item.nomineeid;
                    const categorySlug = getCategorySlug(item.category);

                    // Build query params: pass nominee name, id, and category slug
                    const params = new URLSearchParams();
                    params.set("nomineeid", item.nomineeid);
                    params.set("nomineename", item.nomineename);
                    params.set("category", item.category);

                    // If completed → redirect to view mode (also include mode)
                    if (item.status === "Completed") {
                      params.set("mode", "view");
                    }

                    router.push(
                      `/committee/committee-scoring/${categorySlug}/${id}?${params.toString()}`
                    );

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
