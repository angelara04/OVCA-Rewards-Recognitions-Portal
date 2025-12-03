import { jsPDF } from "jspdf";

export interface CommitteeRow {
  id: string;
  name: string;
  date: string;
  scores: Record<string, number | string>;
}

// nominee: object with nomineeid, nomineename, category, etc.
export function generateNominationPdf(nominee: any, committeeData?: CommitteeRow[]) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 10;

  // If no committee data provided, create static mock rows using nominee.mixedScores when available
  // Build category labels from nominee.rubric.criteria when available, otherwise use fallbacks
  const categoryLabels: string[] =
    (nominee && nominee.rubric && Array.isArray(nominee.rubric.criteria))
      ? nominee.rubric.criteria.map((c: any) => c.label || c.name || String(c))
      : ["IPCR Average Rating", "Awards Received", "Quality of Output"];

  const mockCommittee = committeeData ?? [
    {
      id: "C001",
      name: "John Doe",
      date: new Date().toISOString().slice(0, 10),
      scores: Object.fromEntries(categoryLabels.map((k, i) => [k, [43, 1, 4][i] ?? 0])),
    },
    {
      id: "C002",
      name: "Jane Smith",
      date: new Date().toISOString().slice(0, 10),
      scores: Object.fromEntries(categoryLabels.map((k, i) => [k, [44, 2, 5][i] ?? 0])),
    },
    {
      id: "C003",
      name: "Alice Tan",
      date: new Date().toISOString().slice(0, 10),
      scores: Object.fromEntries(categoryLabels.map((k, i) => [k, [42, 0, 4][i] ?? 0])),
    },
  ];

  // Header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Committee Scoring Report", 10, y);
  y += 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Nominee: ${nominee?.nomineename ?? nominee?.nominee_name ?? "-"}`, 10, y);
  y += 6;
  doc.text(`Nominee ID: ${nominee?.nomineeid ?? nominee?.id ?? "-"}`, 10, y);
  y += 6;
  doc.text(`Category: ${nominee?.category ?? "-"}`, 10, y);
  y += 8;

  // Collect all category labels across committee rows to build table columns
  const categorySet = new Set<string>();
  mockCommittee.forEach((c) => Object.keys(c.scores).forEach((k) => categorySet.add(k)));
  const categories = Array.from(categorySet);

  // Table header
  doc.setFont("helvetica", "bold");
  doc.text("Committee ID", 10, y);
  doc.text("Name", 40, y);
  let x = 110;
  categories.forEach((cat) => {
    doc.text(cat, x, y);
    x += 40;
  });
  doc.text("Date", pageWidth - 30, y);
  y += 6;

  doc.setLineWidth(0.2);
  doc.line(10, y, pageWidth - 10, y);
  y += 4;

  doc.setFont("helvetica", "normal");

  // Rows
  mockCommittee.forEach((c) => {
    doc.text(c.id, 10, y);
    doc.text(c.name, 40, y);
    let cx = 110;
    categories.forEach((cat) => {
      const v = c.scores[cat];
      doc.text(String(v ?? "-"), cx, y);
      cx += 40;
    });
    doc.text(c.date, pageWidth - 30, y);
    y += 6;

    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });

  // Averages per committee (simple numeric average across numeric scores)
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Averages", 10, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  mockCommittee.forEach((c) => {
    const numericScores = Object.values(c.scores).filter((v) => typeof v === "number") as number[];
    const avg = numericScores.length ? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(2) : "N/A";
    doc.text(`${c.id} (${c.name}): ${avg}`, 10, y);
    y += 6;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save(`${nominee?.nomineeid ?? nominee?.id ?? "nomination"}-committee-report.pdf`);
}

export default generateNominationPdf;
