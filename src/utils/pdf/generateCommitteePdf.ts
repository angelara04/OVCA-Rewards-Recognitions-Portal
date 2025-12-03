import { jsPDF } from "jspdf";

export interface CommitteeMember {
  id?: string;
  name: string;
  scores: Record<string, number | string>;
}

export interface NomineeForPdf {
  nomineeid?: string;
  nomineename?: string;
  category?: string;
}

/**
 * Generate a committee scoring PDF. This is modular and accepts static data.
 * Replace the static arguments with Supabase data later.
 */
export default function generateCommitteePdf(
  nominee: NomineeForPdf,
  committee: CommitteeMember[],
  categories: string[]
) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 12;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Committee Scoring Report`, 10, y);
  y += 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  if (nominee?.nomineename) {
    doc.text(`Nominee: ${nominee.nomineename}`, 10, y);
    y += 6;
  }
  if (nominee?.nomineeid) {
    doc.text(`Nominee ID: ${nominee.nomineeid}`, 10, y);
    y += 6;
  }
  if (nominee?.category) {
    doc.text(`Category: ${nominee.category}`, 10, y);
    y += 8;
  }

  // Table header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  const colX = [10];
  // first column for member name
  colX.push(70);
  // distribute category columns evenly
  const remainingWidth = pageWidth - 80 - 10; // left margin 10, name col 60
  const catWidth = Math.max(25, remainingWidth / Math.max(1, categories.length));

  // draw header titles
  doc.text("Committee Member", 12, y);
  let cx = 70;
  categories.forEach((c) => {
    doc.text(c, cx, y);
    cx += catWidth;
  });
  y += 6;

  // line
  doc.setLineWidth(0.2);
  doc.line(10, y, pageWidth - 10, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Rows
  committee.forEach((m, idx) => {
    if (y > 275) {
      doc.addPage();
      y = 12;
    }

    doc.text(m.name, 12, y);
    let cx2 = 70;
    categories.forEach((cat) => {
      const v = m.scores?.[cat];
      doc.text(String(v ?? "N/A"), cx2, y);
      cx2 += catWidth;
    });

    y += 6;
  });

  // Summary: per-category average
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Category Averages:", 10, y);
  y += 6;
  doc.setFont("helvetica", "normal");

  categories.forEach((cat) => {
    const vals = committee
      .map((m) => m.scores?.[cat])
      .filter((v) => typeof v === "number") as number[];
    const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "N/A";
    doc.text(`${cat}: ${avg}`, 12, y);
    y += 6;
  });

  // Save
  const filename = `${nominee?.nomineename ?? 'committee-report'}`.replace(/\s+/g, "_") + ".pdf";
  doc.save(filename);
}
