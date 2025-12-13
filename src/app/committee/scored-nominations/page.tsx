"use client";
import React, { useState, useEffect, useMemo } from "react";
import { FolderX, MoreHorizontal } from "lucide-react";
import Button from "@/components/button";
import { SearchBar } from "@/components/search-bar";
import Table, { Column } from "@/components/table/committee-table";
import DropdownMenu from "@/components/dropdown-menu";
import { useRouter } from "next/navigation";
import Section from "@/components/section";
import {
  getCommitteeDashboardData,
  getNominationResults,
  getMyScoreForNomination,
} from "@/app/admin/committee/actions";

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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

useEffect(() => {
  async function fetchScored() {
    setLoading(true);

    const nominations = await getCommitteeDashboardData();

    const completedNominations: Employee[] = (
      await Promise.all(
        nominations.map(async (nom) => {
          if (nom.my_status !== "Completed") return null;

          // Get your personal score
          const myScore = await getMyScoreForNomination(nom.id);
          if (myScore === null) return null; // Should not happen but safe

          // Fetch rubric to determine max possible score
          const result = await getNominationResults(nom.id);
          const maxScore =
            result.rubric?.criteria?.reduce(
              (sum: number, c: any) => sum + (c.max || 0),
              0
            ) || 100;

          const status =
            myScore >= maxScore * 0.7 ? "Qualified" : "Disqualified";

          const latestReviewDate = result.reviews?.[0]?.updated_at
            ? new Date(result.reviews[0].updated_at).toLocaleDateString("en-PH")
            : "";

          return {
            nomineeid: nom.id,
            nomineename: nom.nominee_name,
            category: nom.category,
            nominatorid: nom.nominator_id,
            nominatorname: nom.nominator_name || "",
            datescored: latestReviewDate,
            totalscore: myScore, // ← THIS IS THE SCORE YOU WANT
            status,
          };
        })
      )
    ).filter((x): x is Employee => x !== null);

    setData(completedNominations);
    setLoading(false);
  }

  fetchScored();
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
    { key: "datescored", label: "Date Scored" },
    { key: "totalscore", label: "Total Score" },
    { key: "status", label: "Status" },
  ];

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
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">
            Scored Nominations
          </h1>
          <p className="text-base text-[var(--dark-grey)]">
            Nominations that have been scored by the committee
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

      <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] rounded-xl shadow-sm -mt-[1px] px-6 py-6 min-h-[75vh] flex flex-col relative content-area">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Completed Scored Nominations
        </h2>

        <SearchBar
          value={searchQuery}
          onChange={(val: string) => setSearchQuery(val)}
          placeholder="Search by nominee name"
        />

        <div className="mt-4 border border-[var(--outline-grey)] rounded-md bg-[var(--white)] min-h-[60vh] flex flex-col w-full relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3 w-full">
              <div className="w-10 h-10 border-4 border-[var(--maroon)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[var(--dark-grey)] text-sm font-medium">
                Loading...
              </p>
            </div>
          ) : hasResults ? (
            <div className="w-full overflow-auto">
              <Table
                columns={columns}
                data={filteredData}
                renderActions={(_row, i) => {
                  const employee = filteredData[i];
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
                      disabled={!isInteractive}
                      className={`${iconColor} ${cursor}`}
                      onClick={(e) => {
                        if (!isInteractive) return;
                        const buttonRect =
                          e.currentTarget.getBoundingClientRect();
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
                    const sel = filteredData[openDropdownIndex!];
                    if (!sel) return setOpenDropdownIndex(null);

                    // derive slug from category
                    // const category = sel.category || "";
                    // let slug = category
                    //   .toLowerCase()
                    //   .trim()
                    //   .replace(/[^a-z0-9\s-]/g, "")
                    //   .replace(/\s+/g, "-");

                    // // normalize known categories
                    // if (
                    //   category ===
                    //   "Non-Teaching Personnel (Junior and Industrial Level)"
                    // )
                    //   slug = "junior";
                    // if (category === "Non-Teaching Personnel (Senior Level)")
                    //   slug = "senior";
                    // if (
                    //   category ===
                    //   "Non-Teaching Personnel (Non-Supervisory Level)"
                    // )
                    //   slug = "non-supervisory";

                    const categorySlug = getCategorySlug(sel.category);

                    const id = sel.nomineeid;
                    const params = new URLSearchParams();
                    params.set("nomineeid", sel.nomineeid);
                    params.set("nomineename", sel.nomineename);
                    params.set("category", sel.category);

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
