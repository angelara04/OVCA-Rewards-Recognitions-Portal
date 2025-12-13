"use client";
import { useState, useMemo, useEffect, use } from "react";
import { FolderX } from "lucide-react";
import Button from "@/components/button";
import { SearchBar } from "@/components/search-bar";
import NominationReportTable, {
  type Column,
} from "@/components/table/nomination-report-table";
import PortalStatusBadge from "@/components/portal-status-badge";
import Section from "@/components/section";
import { jsPDF } from "jspdf";
import {
  getNominationReport,
  type NominationReportData,
} from "@/app/admin/committee/actions";
import AlertBanner from "@/components/alertBanner";
import { createClient } from "@/utils/supabase/client";
import {
  getPeriodStatus,
  type PeriodStatus,
} from "@/app/admin/settings/actions"; // adjust path if needed
import autoTable from "jspdf-autotable";
interface Nomination {
  nomineeid: string;
  nomineename: string;
  category: string;
  committeescore: (number | "N/A")[];
  averagescore: number | "N/A";
  status: "NOT STARTED" | "ON GOING" | "COMPLETED";
  submittedCount?: number;
}

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);

  const [alert, setAlert] = useState<{
    visible: boolean;
    title?: string;
    message?: string;
    variant?: "error" | "warning" | "success";
  }>({ visible: false });

  // nomination report
  const [reportData, setReportData] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);

  // period status
  const [scoringPeriodStatus, setScoringPeriodStatus] =
    useState<PeriodStatus>("UNSCHEDULED");

  useEffect(() => {
    async function fetchReport() {
      const data = await getNominationReport();

      const mapped: Nomination[] = data.map((n) => {
        const scores = n.reviews.map((r) => r.total_score ?? "N/A");
        const validScores = scores.filter(
          (s) => typeof s === "number"
        ) as number[];

        // average null if ≤ 3 valid scores
        const avgScore =
          validScores.length > 2
            ? parseFloat(
                (
                  validScores.reduce((a, b) => a + b, 0) / validScores.length
                ).toFixed(2)
              )
            : "N/A";

        const submittedCount = validScores.length;

        let status: "NOT STARTED" | "ON GOING" | "COMPLETED" = "NOT STARTED";
        if (submittedCount === 0) status = "NOT STARTED";
        else if (submittedCount > 0 && submittedCount < 15) status = "ON GOING";
        else if (submittedCount >= 15) status = "COMPLETED";

        return {
          nomineeid: n.id,
          nomineename: n.nominee_name,
          category: n.category,
          committeescore: scores,
          averagescore: avgScore,
          submittedCount,
          status,
        };
      });

      setReportData(mapped);
    }

    async function fetchPeriodStatus() {
      const status = await getPeriodStatus("scoring_period");
      setScoringPeriodStatus(status);
    }
    async function loadAll() {
      setLoading(true);
      await Promise.all([fetchReport(), fetchPeriodStatus()]);
      setLoading(false);
    }

    loadAll();
  }, []);

  // ------------- FILTER -------------
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reportData;
    return reportData.filter((d) =>
      Object.values(d).join(" ").toLowerCase().includes(q)
    );
  }, [searchQuery, reportData]);

  // ---------- AGGREGATES & STATUS LOGIC ----------
  const totalMembersPerNominee = 15;
  const totalCapacity = reportData.length * totalMembersPerNominee;
  const totalSubmitted = reportData.reduce(
    (sum, d) => sum + (d.submittedCount || 0),
    0
  );

  // Map period status (from getPeriodStatus) to evaluation status used in admin/settings
  // 'OPEN' -> 'ONGOING', 'CLOSED' -> 'COMPLETED', 'UNSCHEDULED' -> 'NO_SCHEDULE'
  const evaluationStatus = (() => {
    switch (scoringPeriodStatus) {
      case "OPEN":
        return "ON GOING" as const;
      case "CLOSED":
        return "COMPLETED" as const;
      default:
        return "NO SCHEDULE" as const;
    }
  })();

  const getReportUIConfig = (status: string) => {
    switch (status) {
      case "NO SCHEDULE":
        return { bgColor: "bg-[var(--light-red)]", buttonDisabled: true };
      case "ON GOING":
        return { bgColor: "bg-[var(--light-purple)]", buttonDisabled: true };
      case "COMPLETED":
        return { bgColor: "bg-[var(--light-green)]", buttonDisabled: false };
      default:
        return { bgColor: "bg-[var(--settings-grey)]", buttonDisabled: true };
    }
  };

  const { bgColor, buttonDisabled } = getReportUIConfig(evaluationStatus);
  const hasResults = filteredData.length > 0;

  // Button enable/disable: only enable when evaluationStatus is COMPLETED
  const isGenerateEnabled = evaluationStatus === "COMPLETED";

  // Button styling to match Figma: green for Completed, pink/purple for Ongoing, red for Not Started/Unscheduled
  const generateButtonClass = isGenerateEnabled
    ? "bg-[var(--forest-green)] hover:bg-[var(--forest-green)] text-white"
    : evaluationStatus === "ON GOING"
    ? "bg-[var(--dark-purple)] text-white opacity-95 cursor-not-allowed"
    : "bg-[var(--outline-grey)] text-black opacity-95 cursor-not-allowed";

  // ---------- TABLE COLUMNS ----------
  const columns: Column[] = [
    { key: "nomineeid", label: "Nominee ID", width: 120 },
    { key: "nomineename", label: "Nominee Name", width: 160 },
    { key: "category", label: "Category", width: 200 },
    {
      key: "committeescore",
      label: "Committee Score",
      width: 180,
      render: (value: (number | "N/A")[], row: Nomination) => {
        if (row.status === "NOT STARTED") return "null";
        const scores = value || ["N/A", "N/A", "N/A"];
        return (
          <div className="flex gap-2">
            {scores.map((score, idx) => (
              <div
                key={idx}
                className={`w-8 h-6 text-xs flex items-center justify-center rounded ${
                  score === "N/A"
                    ? "bg-[var(--settings-grey)] text-black"
                    : "bg-[var(--maroon)] text-white"
                }`}
              >
                {score}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: "averagescore",
      label: "Average Score",
      width: 150,
      render: (value: number | "N/A") => {
        if (value === "N/A") return "null";
        return (Math.round(value * 100) / 100).toFixed(2);
      },
    },
  ];

  const handleDownload = (row: Nomination, index: number) => {
    console.log("Download action triggered for:", row);
  };
  const handleView = (row: Nomination, index: number) => {
    console.log("View action triggered for:", row);
  };

  // ---------- PDF Generation ----------
  const generatePDF = async () => {
    if (!filteredData.length) {
      setAlert({
        visible: true,
        title: "No data",
        message: "No data to generate PDF",
        variant: "error",
      });
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 10;

    const summaryData: { name: string; average: string | number }[] = [];

    const supabase = createClient();

    // Batch-fetch all completed reviews for the nominees to reduce roundtrips
    const nominationIds = filteredData.map((n) => n.nomineeid);
    let allReviews: any[] = [];
    try {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .in("nomination_id", nominationIds)
        .eq("status", "completed")
        .order("created_at", { ascending: true });
      allReviews = data || [];
    } catch (err) {
      console.error("Failed to fetch reviews batch", err);
      allReviews = [];
    }

    // Group reviews by nomination_id for quick lookup
    const reviewsByNomination = new Map<string, any[]>();
    for (const r of allReviews) {
      const key = r.nomination_id;
      if (!reviewsByNomination.has(key)) reviewsByNomination.set(key, []);
      reviewsByNomination.get(key)!.push(r);
    }

    // Batch-fetch reviewer profiles used across all reviews
    const reviewerIds = Array.from(
      new Set(allReviews.map((r) => r.reviewer_id).filter(Boolean))
    );
    let profiles: any[] = [];
    if (reviewerIds.length > 0) {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", reviewerIds);
        profiles = data || [];
      } catch (err) {
        console.error("Failed to fetch profiles batch", err);
        profiles = [];
      }
    }
    const profilesById = new Map(profiles.map((p: any) => [String(p.id), p]));

    for (const nominee of filteredData) {
      // Header
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Nominee Name: ${nominee.nomineename}`, 10, y);
      y += 8;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Nominee ID: ${nominee.nomineeid}`, 10, y);
      y += 6;
      doc.text(`Category: ${nominee.category}`, 10, y);
      y += 10;

      // Build committeeData from the pre-fetched batch results
      let committeeData: any[] = [];
      const reviews = reviewsByNomination.get(nominee.nomineeid) || [];
      if (reviews.length > 0) {
        committeeData = reviews.map((review: any, idx: number) => {
          const reviewerProfile = profilesById.get(String(review.reviewer_id));
          const reviewerName =
            reviewerProfile?.name ||
            String(review.reviewer_id) ||
            `Reviewer ${idx + 1}`;

          const totalScore = review.total_score ?? "N/A";
          const status =
            typeof totalScore === "number" && totalScore >= 70
              ? "Qualified"
              : "Disqualified";

          let date = "-";
          try {
            const d = new Date(review.updated_at || review.created_at || "");
            date = isNaN(d.getTime())
              ? String(review.updated_at || "-")
              : d.toLocaleDateString("en-PH");
          } catch {
            date = String(review.updated_at || "-");
          }

          return {
            committee: `C00${idx + 1}`,
            name: reviewerName,
            totalScore,
            status,
            comment: review.comments || "-",
            date,
          };
        });
      } else {
        // Fallback to the existing committeescore array if no reviews are available
        committeeData = (nominee.committeescore || []).map((score, idx) => ({
          committee: `C00${idx + 1}`,
          name: `Reviewer ${idx + 1}`,
          totalScore: score,
          status:
            typeof score === "number" && score >= 70
              ? "Qualified"
              : "Disqualified",
          comment: "-",
          date: "-",
        }));
      }

      // Use autoTable for uniform table layout & blue header
      autoTable(doc, {
        startY: y,
        head: [
          ["Committee", "Name", "Total Score", "Status", "Comment", "Date"],
        ],
        body: committeeData.map((c) => [
          c.committee,
          c.name,
          c.totalScore,
          c.status,
          c.comment,
          c.date,
        ]),
        styles: {
          font: "helvetica",
          fontSize: 11,
          overflow: "linebreak",
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [0, 123, 255],
          textColor: 255,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 18 }, // Committee
          1: { cellWidth: 60 }, // Name
          2: { cellWidth: 18 }, // Total Score
          3: { cellWidth: 25 }, // Status
          4: { cellWidth: 46 }, // Comment
          5: { cellWidth: 23 }, // Date
        },
        margin: { left: 10, right: 10 },
        theme: "grid",
      });

      y = (doc as any).lastAutoTable.finalY + 4;

      // Calculate average score
      const validScores = committeeData
        .filter((c) => typeof c.totalScore === "number")
        .map((c) => Number(c.totalScore));
      const average =
        validScores.length > 3
          ? (
              validScores.reduce((a, b) => a + b, 0) / validScores.length
            ).toFixed(2)
          : "N/A";

      doc.setFont("helvetica", "bold");
      doc.text(`Average Score: ${average}`, 10, y);
      y += 12;

      summaryData.push({ name: nominee.nomineename, average });

      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    }

    // Summary page
    doc.addPage();
    y = 15;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("SCORING SUMMARY", 10, y);
    y += 10;

    // Use autoTable for summary
    autoTable(doc, {
      startY: y,
      head: [["Nominee Name", "Average Score"]],
      body: summaryData.map((item) => [item.name, item.average]),
      styles: {
        font: "helvetica",
        fontSize: 11,
        overflow: "linebreak",
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [0, 123, 255],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 30 },
      },
      theme: "grid",
    });

    doc.save("nomination-report.pdf");
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Section
        width="w-full"
        height="min-h-screen"
        alignment="items-center p-10"
      >
        {/* HEADER + LOADING PLACEHOLDER */}
        <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
          <div>
            <h1 className="text-[28px] font-bold text-[var(--black)]">
              Nomination Report
            </h1>
            <p className="text-base text-[var(--dark-grey)]">
              Generate reports and view committee scoring summaries with full
              visibility
            </p>
          </div>
          <Button size="sm" variant="secondary">
            <div className="px-5 py-1">Back to Dashboard</div>
          </Button>
        </div>

        <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] rounded-xl shadow-sm px-6 py-6 min-h-[75vh] flex flex-col relative content-area">
          <p>Loading...</p>
        </div>
      </Section>
    );
  }

  // While the nomination report is being fetched, show a full-page loading overlay
  if (loading) {
    return (
      <Section
        width="w-full"
        height="min-h-screen"
        alignment="items-center p-10"
      >
        <div className="relative w-full min-h-screen">
          <div className="absolute inset-0 flex flex-col items-center justify-center h-full gap-3">
            <div className="w-10 h-10 border-4 border-[var(--maroon)] border-t-transparent rounded-full animate-spin" />
            <p className="text-[var(--dark-grey)] text-sm font-medium">
              Loading...
            </p>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {alert.visible && (
        <AlertBanner
          title={alert.title || "Alert"}
          message={alert.message || ""}
          variant={alert.variant || "error"}
          onClose={() => setAlert({ visible: false })}
        />
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">
            Nomination Report
          </h1>
          <p className="text-base text-[var(--dark-grey)]">
            Generate reports and view committee scoring summaries with full
            visibility
          </p>
        </div>
        <Button size="sm" variant="secondary">
          <div className="px-5 py-1">Back to Dashboard</div>
        </Button>
      </div>

      {/* Committee Scoring Summary */}
      <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] rounded-xl shadow-sm px-6 py-6 flex flex-col relative content-area">
        <h2 className="text-[18px] font-bold text-gray-900 mb-6">
          Committee Scoring Summary
        </h2>

        <SearchBar
          value={searchQuery}
          onChange={(val: string) => setSearchQuery(val)}
          placeholder="Search by nominee name"
        />

        <div className="mt-4 flex flex-col w-full relative">
          {hasResults ? (
            <NominationReportTable
              columns={columns}
              data={filteredData}
              onDownloadAction={handleDownload}
            />
          ) : (
            <div className="h-[60vh] flex flex-col items-center justify-center text-gray-500 border border-[var(--outline-grey)] rounded-md">
              <FolderX size={100} className="mb-4 opacity-70" />
              <p className="font-bold text-3xl">No Results Found</p>
            </div>
          )}
        </div>
      </div>

      {/* Final Report */}
      <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] rounded-xl shadow-sm mt-10 px-6 py-6 flex flex-col relative content-area">
        <h2 className="text-[18px] font-bold text-gray-900 mb-6">
          Gawad Tsanselor Final Report
        </h2>

        <div
          className={`w-full ${bgColor} rounded-sm min-h-[10vh] py-4 px-4 mb-2 relative pr-24`}
        >
          <div className="mb-2">
            <h3 className="text-md font-semibold text-gray-900">
              Evaluation Status
            </h3>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <PortalStatusBadge
              variant="report"
              totalMembers={totalCapacity}
              submittedCount={totalSubmitted}
              evaluationStatus={evaluationStatus}
            />
          </div>

          <p className="text-sm text-[var(--dark-grey)]">
            {evaluationStatus === "NO SCHEDULE" &&
              "No committee reviews submitted yet"}
            {evaluationStatus === "ON GOING" &&
              `${reportData.length} nominees reviewed`}
            {evaluationStatus === "COMPLETED" &&
              "All committee reviews completed"}
          </p>
        </div>

        <Button
          size="sm"
          variant={isGenerateEnabled ? "primary" : "disabled"}
          disabled={!isGenerateEnabled}
          className={`w-full ${generateButtonClass}`}
          onClick={generatePDF}
        >
          <div className="px-4 py-2">Generate Report</div>
        </Button>

        {/* Optional: show scoring period status */}
        {/* {scoringPeriodStatus !== "OPEN" && (
          <p className="text-sm text-[var(--dark-grey)] mt-2">
            {scoringPeriodStatus === "CLOSED" &&
              "Scoring period recently closed."}
            {scoringPeriodStatus === "UNSCHEDULED" &&
              "Scoring period not yet scheduled."}
          </p>
        )} */}
      </div>
    </Section>
  );
}
