"use client";
import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";
import { MoreHorizontal } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getCommitteeReviewsForNominee,
  type CommitteeReview,
} from "@/app/admin/committee/actions";
import { createClient } from "@/utils/supabase/client";

export interface Column {
  key: string;
  label: string;
  width?: number | string;
  render?: (value: any, row: any, rowIndex: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column[];
  data: T[];
  onDownloadAction?: (row: T, index: number) => void;
  minTableWidth?: number | string;
}

export default function NominationReportTable<T>({
  columns,
  data,
  onDownloadAction,
  minTableWidth = "1400px",
}: TableProps<T>) {
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const actionButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const renderCellValue = (col: Column, row: any, rowIndex: number) => {
    const raw = row?.[col.key];

    if (col.render) return col.render(raw, row, rowIndex);

    if (
      col.key === "committeescore" ||
      col.key === "averagescore" ||
      col.key === "remarks"
    ) {
      const status = row?.status || "";
      if (status === "NOT STARTED") return "---";
      if (status === "ON GOING" && !raw) return "null";
      return (raw ?? "").toString();
    }

    if (
      col.key === "datescored" ||
      col.key === "dateregistered" ||
      col.key === "datesubmitted"
    ) {
      if (!raw) return "-";
      try {
        const d = new Date(raw);
        if (isNaN(d.getTime())) return raw;
        return d.toLocaleDateString("en-PH");
      } catch {
        return raw;
      }
    }

    return (raw ?? "").toString();
  };

  const isDownloadDisabled = (row: any) => false;
  const hasActions = !!onDownloadAction;

  const calculatePosition = useCallback((buttonElement: HTMLButtonElement) => {
    const rect = buttonElement.getBoundingClientRect();
    const DROPDOWN_WIDTH = 144;
    const RIGHT_OFFSET = 10;

    setDropdownPosition({
      top: rect.bottom + 10,
      left: rect.right - DROPDOWN_WIDTH - RIGHT_OFFSET,
    });
  }, []);

  const handleActionClick = (
    index: number,
    buttonElement: HTMLButtonElement
  ) => {
    if (openDropdownIndex === index) {
      setOpenDropdownIndex(null);
      setDropdownPosition(null);
    } else {
      setOpenDropdownIndex(index);
      calculatePosition(buttonElement);
      actionButtonRef.current = buttonElement;
    }
  };

  // No preloaded reviews — we'll fetch per-nominee when Download is triggered.

  // Handle click outside to close dropdown & scroll adjustment
  useEffect(() => {
    const closeDropdown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        actionButtonRef.current &&
        !actionButtonRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setOpenDropdownIndex(null);
        setDropdownPosition(null);
      }
    };
    const handleScroll = () => {
      if (actionButtonRef.current) calculatePosition(actionButtonRef.current);
    };

    if (openDropdownIndex !== null) {
      document.addEventListener("mousedown", closeDropdown);
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener("mousedown", closeDropdown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [openDropdownIndex, calculatePosition]);

  // PDF Generation: fetch reviews for the given nomineeId, then build PDF
  const generateNomineePDF = async (
    nomineeId: string,
    category: "junior" | "senior" | "non-supervisory"
  ) => {
    try {
      const pdf = new jsPDF();
      const supabase = createClient();

      // Fetch reviews
      const reviews = await getCommitteeReviewsForNominee(nomineeId);
      if (!reviews || reviews.length === 0) {
        alert("No completed reviews found for this nominee.");
        return;
      }

      // Fetch nomination details
      const { data: nomination } = await supabase
        .from("nominations")
        .select("nominator_name, nominee_name, category, position, unit")
        .eq("id", nomineeId)
        .maybeSingle();

      // Header
      pdf.setFontSize(16);
      pdf.text("Nominee Scoring Report", 10, 10);

      pdf.setFontSize(12);
      pdf.text(`Nominee ID: ${nomineeId}`, 10, 20);
      const nomineeName =
        (reviews[0] as any).nominee_name ||
        nomination?.nominee_name ||
        nomineeId;
      pdf.text(`Name: ${nomineeName}`, 10, 26);
      pdf.text(`Nominator: ${nomination?.nominator_name ?? "-"}`, 10, 32);
      pdf.text(`Category: ${nomination?.category ?? "-"}`, 70, 32);
      pdf.text(`Position: ${nomination?.position ?? "-"}`, 10, 38);
      pdf.text(`Unit: ${nomination?.unit ?? "-"}`, 70, 38);

      let yPos = 56;

      // Fetch reviewer profiles
      const reviewerIds = Array.from(
        new Set(reviews.map((r) => r.reviewer_id).filter(Boolean))
      );
      let profiles: any[] = [];
      if (reviewerIds.length > 0) {
        const { data } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", reviewerIds);
        profiles = data || [];
      }

      // Summary rows
      const summaryRows: [string, number, string, string][] = [];

      for (const [index, review] of reviews.entries()) {
        if (index > 0) yPos += 8;
        if (yPos > 270) {
          pdf.addPage();
          yPos = 10;
        }

        pdf.setFontSize(13);

        const reviewerProfile = profiles.find(
          (p) => String(p.id) === String(review.reviewer_id)
        );
        const reviewerDisplayName =
          reviewerProfile?.name || String(review.reviewer_id) || "Unknown";

        const scores =
          typeof review.scores_json === "string"
            ? JSON.parse(review.scores_json)
            : review.scores_json || {};

        const totalScore = Object.values(scores)
          .filter((v) => typeof v === "number")
          .reduce((sum, v) => sum + (v as number), 0);

        const body = Object.entries(scores)
          .filter(([k]) => k !== "meta_ipcr_breakdown")
          .map(([k, v]) => [k, (v ?? "").toString()]);

        pdf.text(
          `Committee ${index + 1} - Reviewer: ${reviewerDisplayName} (${
            review.reviewer_id
          })`,
          10,
          yPos
        );
        yPos += 6;

        autoTable(pdf, {
          startY: yPos,
          head: [["Criteria", "Score"]],
          body,
          styles: { fontSize: 11 },
          headStyles: { fillColor: [0, 123, 255], textColor: 255 }, // blue header
          theme: "grid",
          margin: { left: 10, right: 10 },
        });
        yPos = (pdf as any).lastAutoTable.finalY + 6;

        pdf.text(`Comments: ${review.comments ?? "-"}`, 10, yPos);
        yPos += 10;

        summaryRows.push([
          reviewerDisplayName,
          totalScore,
          review.status || "-",
          review.comments || "-",
        ]);
      }

      // Summary table
      if (summaryRows.length > 0) {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 10;
        }

        pdf.setFontSize(14);
        pdf.text("Summary of All Committees", 10, yPos);
        yPos += 6;

        autoTable(pdf, {
          startY: yPos,
          head: [["Committee", "Total Score", "Status", "Comments"]],
          body: summaryRows,
          styles: {
            fontSize: 11,
            overflow: "linebreak",
          },
          columnStyles: {
            3: { cellWidth: 80 }, // wrap Comments
          },
          headStyles: { fillColor: [0, 123, 255], textColor: 255 }, // blue header
          theme: "grid",
          margin: { left: 10, right: 10 },
        });

        const totalScoresSum = summaryRows.reduce(
          (sum, row) => sum + row[1],
          0
        );
        const totalAverage = summaryRows.length
          ? (totalScoresSum / summaryRows.length).toFixed(2)
          : "0";

        yPos = (pdf as any).lastAutoTable.finalY + 10;
        pdf.setFontSize(12);
        pdf.text(`Total Average Score: ${totalAverage}`, 10, yPos);
      }

      pdf.save(
        `${String(nomineeName).replace(/\s+/g, "_")}-scoring-report.pdf`
      );
    } catch (err) {
      console.error("Error generating nominee PDF:", err);
      alert("Failed to generate PDF. See console for details.");
    }
  };

  const handleActionSelect = (action: "download", row: T, index: number) => {
    setOpenDropdownIndex(null);
    setDropdownPosition(null);
    if (action === "download" && onDownloadAction) {
      onDownloadAction(row, index);

      const rawCategory = (row as any)?.category?.toLowerCase() || "";
      let categoryType: "junior" | "senior" | "non-supervisory" = "junior";
      if (rawCategory.includes("senior")) categoryType = "senior";
      else if (
        rawCategory.includes("non-supervisory") ||
        rawCategory.includes("non supervisory")
      )
        categoryType = "non-supervisory";

      const nomineeId = (row as any)?.nomineeid || (row as any)?.id || "";
      generateNomineePDF(nomineeId, categoryType);
    }
  };

  return (
    <div className="overflow-auto border border-[var(--outline-grey)] rounded-md flex-1 max-h-[420px]">
      <table
        className="w-full text-xs border-collapse"
        style={{
          minWidth:
            typeof minTableWidth === "number"
              ? `${minTableWidth}px`
              : minTableWidth,
        }}
      >
        <colgroup>
          {columns.map((c) =>
            typeof c.width === "number" ? (
              <col key={c.key} style={{ width: `${c.width}px` }} />
            ) : typeof c.width === "string" &&
              /^(?:\d+(?:px|%)|rem|em)$/.test(c.width) ? (
              <col key={c.key} style={{ width: c.width }} />
            ) : (
              <col key={c.key} />
            )
          )}
          {hasActions && <col key="__actions" style={{ width: 72 }} />}
        </colgroup>

        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  "py-3 px-4 font-medium sticky top-0 bg-[var(--maroon)] z-20 text-white",
                  "border-none text-left"
                )}
                style={
                  typeof col.width === "number"
                    ? { width: `${col.width}px` }
                    : undefined
                }
              >
                {col.label}
              </th>
            ))}
            {hasActions && (
              <th className="py-3 px-4 font-medium text-center sticky top-0 right-0 bg-[var(--maroon)] z-30 text-white border-none">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody className="bg-white text-gray-800">
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[var(--outline-grey)] hover:bg-gray-50 transition-colors"
            >
              {columns.map((col, idx) => {
                const isLast = idx === columns.length - 1;
                return (
                  <td
                    key={col.key}
                    className={clsx(
                      "py-3 px-4 align-top",
                      !isLast && "border-r border-[var(--outline-grey)]",
                      "text-left"
                    )}
                    style={
                      typeof col.width === "number"
                        ? { width: `${col.width}px` }
                        : undefined
                    }
                  >
                    {renderCellValue(col, row, i)}
                  </td>
                );
              })}

              {hasActions && (
                <td className="py-3 px-3 text-center sticky right-0 bg-white z-20 border-l border-[var(--outline-grey)]">
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={(e) => handleActionClick(i, e.currentTarget)}
                      className="text-[var(--maroon)] hover:cursor-pointer transition-colors p-1 rounded-full hover:bg-[var(--outline-grey)] focus:outline-none"
                      aria-expanded={openDropdownIndex === i}
                      aria-label="More Actions"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {openDropdownIndex !== null &&
        dropdownPosition &&
        data[openDropdownIndex] && (
          <div
            className="z-[100] w-36 origin-top-right rounded-md shadow-lg bg-white"
            role="menu"
            style={{
              position: "fixed",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
            ref={dropdownRef}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div>
              {onDownloadAction && (
                <button
                  onClick={() =>
                    handleActionSelect(
                      "download",
                      data[openDropdownIndex],
                      openDropdownIndex
                    )
                  }
                  disabled={isDownloadDisabled(data[openDropdownIndex])}
                  className={clsx(
                    "group flex items-center w-full px-4 py-2 text-sm",
                    isDownloadDisabled(data[openDropdownIndex])
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  role="menuitem"
                >
                  Download
                </button>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
