"use client";
import { useState, useMemo, useEffect } from "react";
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

  // nomination report
  const [reportData, setReportData] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);

  // period status
  const [scoringPeriodStatus, setScoringPeriodStatus] =
    useState<PeriodStatus>("UNSCHEDULED");

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      const data = await getNominationReport();

      const mapped: Nomination[] = data.map((n) => {
        const scores = n.reviews.map((r) => r.total_score ?? "N/A");
        const validScores = scores.filter(
          (s) => typeof s === "number"
        ) as number[];

        // average null if ≤ 3 valid scores
        const avgScore =
          validScores.length > 3
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
      setLoading(false);
    }

    async function fetchPeriodStatus() {
      const status = await getPeriodStatus("scoring_period");
      setScoringPeriodStatus(status);
    }

    fetchReport();
    fetchPeriodStatus();
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

  const completedNomineeCount = reportData.filter(
    (d) => d.status === "COMPLETED"
  ).length;
  const ongoingNomineeCount = reportData.filter(
    (d) => d.status === "ON GOING"
  ).length;

  let reportStatus: "NOT STARTED" | "ON GOING" | "COMPLETED";
  if (completedNomineeCount === reportData.length && reportData.length > 0) {
    reportStatus = "COMPLETED";
  } else if (
    ongoingNomineeCount > 0 ||
    (completedNomineeCount > 0 && completedNomineeCount < reportData.length)
  ) {
    reportStatus = "ON GOING";
  } else {
    reportStatus = "NOT STARTED";
  }

  const getReportUIConfig = (status: string) => {
    switch (status) {
      case "NOT STARTED":
        return { bgColor: "bg-[var(--light-red)]", buttonDisabled: true };
      case "ON GOING":
        return { bgColor: "bg-[var(--light-purple)]", buttonDisabled: true };
      case "COMPLETED":
        return { bgColor: "bg-[var(--light-green)]", buttonDisabled: false };
      default:
        return { bgColor: "bg-[var(--settings-grey)]", buttonDisabled: true };
    }
  };

  const { bgColor, buttonDisabled } = getReportUIConfig(reportStatus);
  const hasResults = filteredData.length > 0;

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
  const generatePDF = () => {
    alert("Generating PDF...");
    if (!filteredData.length) {
      alert("No data to generate PDF");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 10;

    const summaryData: { name: string; average: string | number }[] = [];

    filteredData.forEach((nominee) => {
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

      // Prepare committee table data
      const committeeData = (nominee.committeescore || []).map(
        (score, idx) => ({
          committee: `C00${idx + 1}`,
          name: `Reviewer ${idx + 1}`,
          score,
          date: "2025-11-21",
        })
      );

      // Use autoTable for uniform table layout & blue header
      autoTable(doc, {
        startY: y,
        head: [["Committee", "Name", "Score", "Date"]],
        body: committeeData.map((c) => [c.committee, c.name, c.score, c.date]),
        styles: {
          font: "helvetica",
          fontSize: 11,
          overflow: "linebreak", // ensures text wraps instead of cutting off
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 123, 255], // blue header
          textColor: 255,
          fontStyle: "bold",
        },
        columnStyles: {
          1: { cellWidth: 60 }, // Name column can wrap
          3: { cellWidth: 30 },
        },
        theme: "grid",
      });

      y = (doc as any).lastAutoTable.finalY + 4;

      // Calculate average score
      const validScores = committeeData
        .filter((c) => typeof c.score === "number")
        .map((c) => Number(c.score));
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
    });

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

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
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
            />
          </div>

          <p className="text-sm text-[var(--dark-grey)]">
            {reportStatus === "NOT STARTED" &&
              "No committee reviews submitted yet"}
            {reportStatus === "ON GOING" &&
              `${completedNomineeCount} of ${reportData.length} nominees reviewed`}
            {reportStatus === "COMPLETED" && "All committee reviews completed"}
          </p>
        </div>

        <Button
          size="sm"
          // variant={
          //   buttonDisabled || scoringPeriodStatus !== "OPEN"
          //     ? "disabled"
          //     : "primary"
          // }
          variant="primary"
          // disabled={buttonDisabled || scoringPeriodStatus !== "OPEN"}
          className="w-full"
          onClick={generatePDF}
        >
          <div className="px-4 py-2">Generate Report</div>
        </Button>

        {/* Optional: show scoring period status */}
        {scoringPeriodStatus !== "OPEN" && (
          <p className="text-sm text-[var(--dark-grey)] mt-2">
            {scoringPeriodStatus === "RECENTLY_CLOSED" &&
              "Scoring period recently closed."}
            {scoringPeriodStatus === "UNSCHEDULED" &&
              "Scoring period not yet scheduled."}
          </p>
        )}
      </div>
    </Section>
  );
}
