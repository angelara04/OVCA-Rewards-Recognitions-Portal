import { jsPDF } from "jspdf"

type RubricItem = {
  id: string
  label: string
  max: number
}

type CommitteeMember = {
  id?: string
  name: string
  updated_at?: string
  // scores keyed by rubric id
  scores: Record<string, number | string>
}

type NomineeInfo = {
  nomineeid?: string
  nomineename: string
  category?: string
}

/**
 * Generate a PDF showing per-member scores per rubric category.
 * Uses static layout similar to other report generator in the app.
 * Keep this modular so static data can later be replaced with Supabase results.
 */
export function generateCommitteeMemberPdf(
  nominee: NomineeInfo,
  members: CommitteeMember[],
  rubric: RubricItem[]
) {
  const doc = new jsPDF("p", "mm", "a4")
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 12

  const title = `Committee Scoring — ${nominee.nomineename}`
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(title, 10, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(`Nominee ID: ${nominee.nomineeid ?? "-"}`, 10, y)
  doc.text(`Category: ${nominee.category ?? "-"}`, 110, y)
  y += 8

  // Render per-member breakdown
  members.forEach((m, mi) => {
    if (y > 270) {
      doc.addPage()
      y = 12
    }

    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    doc.text(`${mi + 1}. ${m.name}`, 10, y)
    if (m.updated_at) {
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text(`Scored on: ${m.updated_at}`, 140, y)
    }
    y += 7

    // Table header
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Category", 12, y)
    doc.text("Score", 110, y)
    doc.text("Max", 140, y)
    y += 4
    doc.setLineWidth(0.2)
    doc.line(10, y, pageWidth - 10, y)
    y += 6

    // Rows
    doc.setFont("helvetica", "normal")
    let memberTotal = 0
    let memberMaxTotal = 0
    rubric.forEach((r) => {
      const val = m.scores?.[r.id]
      const numeric = typeof val === "number" ? val : Number(val)
      const display = isNaN(numeric) ? String(val ?? "-") : String(numeric)
      doc.text(r.label, 12, y)
      doc.text(display, 110, y)
      doc.text(String(r.max), 140, y)
      if (!isNaN(numeric)) {
        memberTotal += numeric
      }
      memberMaxTotal += r.max
      y += 6
      if (y > 270) {
        doc.addPage()
        y = 12
      }
    })

    // Member summary
    const pct = memberMaxTotal > 0 ? (memberTotal / memberMaxTotal) * 100 : 0
    y += 2
    doc.setFont("helvetica", "bold")
    doc.text(`Total: ${memberTotal} / ${memberMaxTotal}`, 12, y)
    doc.text(`(${pct.toFixed(1)}%)`, 110, y)
    y += 10
  })

  // Final summary page
  doc.addPage()
  y = 16
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("SUMMARY", 10, y)
  y += 10

  // Create a summary per member
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  members.forEach((m, idx) => {
    const total = rubric.reduce((s, r) => {
      const v = m.scores?.[r.id]
      const n = typeof v === "number" ? v : Number(v)
      return s + (isNaN(n) ? 0 : n)
    }, 0)
    const max = rubric.reduce((s, r) => s + r.max, 0)
    const pct = max > 0 ? (total / max) * 100 : 0
    doc.text(`${idx + 1}. ${m.name} — ${total} / ${max} (${pct.toFixed(1)}%)`, 10, y)
    y += 7
    if (y > 270) {
      doc.addPage()
      y = 12
    }
  })

  const filename = `${nominee.nomineeid ?? "nominee"}-committee-scores.pdf`
  doc.save(filename)
}

export default generateCommitteeMemberPdf
