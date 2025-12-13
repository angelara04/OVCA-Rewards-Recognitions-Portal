"use client";
import React, { useState, useMemo, useEffect } from "react";
import { FolderX, MoreHorizontal } from "lucide-react";
import Button from "@/components/button";
import { SearchBar } from "@/components/search-bar";
import Table, { Column } from "@/components/table/committee-table";
import DropdownMenu from "@/components/dropdown-menu";
import Section from "@/components/section";
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

export default function PendingReviewPage() {
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

  // Fetch reviewer nominations where this user has NOT completed review
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setFetchError(null);

      try {
        const serverRows: CommitteeNomination[] =
          await getCommitteeDashboardData();
        if (!mounted) return;

        // Only rows where this reviewer has NOT completed
        const pendingRows = (serverRows || []).filter(
          (r) => r.my_status !== "Completed"
        );

        const mapped: Nominee[] = pendingRows.map((r) => ({
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

  const hasResults = filteredData.length > 0;

  const columns: Column[] = [
    { key: "nomineeid", label: "Nominee ID" },
    { key: "nomineename", label: "Nominee Name" },
    { key: "category", label: "Category" },
    { key: "nominatorid", label: "Nominator ID" },
    { key: "nominatorname", label: "Nominator Name" },
    { key: "datesubmitted", label: "Date Submitted" },
    { key: "status", label: "Status" },
  ];

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">
            Pending Review
          </h1>
          <p className="text-base text-[var(--dark-grey)]">
            Nominations awaiting your committee review and scoring
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            // navigate to dashboard — change path if your dashboard route is different
            router.push("/committee/review-dashboard");
          }}
        >
          <div className="px-5 py-1">Back to Dashboard</div>
        </Button>
      </div>

      {/* Table container */}
      <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] border-t-0 rounded-b-xl shadow-sm px-6 py-6 min-h-[75vh] flex flex-col relative content-area -mt-[8px]">
        <SearchBar
          value={searchQuery}
          onChange={(val: string) => setSearchQuery(val)}
          placeholder="Search nominations"
        />

        <div className="mt-4 border border-[var(--outline-grey)] rounded-md bg-[var(--white)] min-h-[60vh] flex flex-col w-full relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
              <div className="w-10 h-10 border-4 border-[var(--maroon)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[var(--dark-grey)] text-sm font-medium">
                Loading...
              </p>
            </div>
          ) : fetchError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500">
              <p className="font-bold">Failed to load nominations</p>
              <p className="text-sm mt-2">{fetchError}</p>
            </div>
          ) : hasResults ? (
            <div className="w-full overflow-auto">
              <Table
                columns={columns}
                data={filteredData}
                renderActions={(row, i) => {
                  const nom = filteredData[i];
                  const isClickable = nom.status !== "Completed";
                  return (
                    <button
                      disabled={!isClickable}
                      className={`${
                        isClickable
                          ? "text-[var(--maroon)] hover:text-[var(--hover-maroon)] cursor-pointer"
                          : "text-[var(--outline-grey)] cursor-not-allowed"
                      }`}
                      onClick={(e) => {
                        if (!isClickable) return;
                        const rect = (
                          e.currentTarget as HTMLElement
                        ).getBoundingClientRect();
                        const container = document
                          .querySelector(".content-area")!
                          .getBoundingClientRect();
                        setDropdownPosition({
                          top: rect.bottom - container.top + 4,
                          left: rect.left - container.left - 90,
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
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
              <FolderX size={100} className="mb-4 opacity-70" />
              <p className="font-bold text-3xl">No Pending Nominations</p>
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
                  color: "text-black",
                  onClickAction: () => {
                    const item = filteredData[openDropdownIndex!];
                    const id = item.nomineeid;
                    const categorySlug = getCategorySlug(item.category);

                    const params = new URLSearchParams();
                    params.set("nomineeid", item.nomineeid);
                    params.set("nomineename", item.nomineename);
                    params.set("category", item.category);

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
