"use client"
import { useState, useMemo, useEffect } from "react"
import { FolderX } from "lucide-react"
import Button from "@/components/button"
import { SearchBar } from "@/components/search-bar"
import NominationReportTable, { type Column } from "@/components/table/nomination-report-table"
import PortalStatusBadge from "@/components/portal-status-badge"
import Section from "@/components/section"

interface Nomination {
  nomineeid: string
  nomineename: string
  category: string
  committeescore: string
  averagescore: string | number
  status: "NOT STARTED" | "ON GOING" | "COMPLETED"
  submittedCount?: number
  mixedScores?: (number | "N/A")[]
}

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isClient, setIsClient] = useState(false)

  // per-nominee total committee members
  const totalMembersPerNominee = 15

  // ---------- SAMPLE DATA: 15 rows (1..15) ----------
  const [data, setData] = useState<Nomination[]>(
    // combine 3 groups (NOT STARTED, ON GOING, COMPLETED), each 5 rows => total 15
    // COMMENT OUT THE SECTIONS FOR TESTING DIFFERENT REPORT STATUSES
    // YOU CAN ALSO COMMENT OUT ALL SECTIONS TO SEE EMPTY STATUS
    [
      // 1-5 NOT STARTED
      ...Array(5)
        .fill(null)
        .map((_, i) => ({
          nomineeid: `E0125${1000 + i}`, // E01251000 .. E01251004
          nomineename: `Maria Del Santos ${i + 1}`, // 1..5
          category: "Administrative Excellence",
          committeescore: "",
          averagescore: "",
          status: "NOT STARTED" as const,
          submittedCount: 0,
          mixedScores: ["N/A", "N/A", "N/A"] as (number | "N/A")[],
        })),

      // // 6-10 ON GOING (submittedCount < totalMembersPerNominee)
      // ...Array(5)
      //   .fill(null)
      //   .map((_, i) => {
      //     const idx = i + 5 // to get 5..9 offsets for ids/names
      //     const mixed = [
      //       idx % 2 === 0 ? 85 : "N/A",
      //       idx % 3 === 0 ? "N/A" : 90,
      //       idx % 2 === 1 ? 88 : "N/A",
      //     ] as (number | "N/A")[]
      //     // set submittedCount to something < totalMembersPerNominee (ongoing)
      //     const submitted = 5 + (i % 5) // 5..9
      //     return {
      //       nomineeid: `E0125${1000 + idx}`,
      //       nomineename: `Maria Del Santos ${idx + 1}`, // 6..10
      //       category: "Administrative Excellence",
      //       committeescore: "", // will render mixedScores visually
      //       averagescore: "",
      //       status: "ON GOING" as const,
      //       submittedCount: submitted,
      //       mixedScores: mixed,
      //     }
      //   }),

      // // 11-15 COMPLETED (submittedCount == totalMembersPerNominee)
      // ...Array(5)
      //   .fill(null)
      //   .map((_, i) => {
      //     const idx = i + 10 // 10..14 -> name 11..15
      //     const scores = [85, 90, 88]
      //     const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) // 2 decimal places
      //     return {
      //       nomineeid: `E0125${1000 + idx}`,
      //       nomineename: `Maria Del Santos ${idx + 1}`, // 11..15
      //       category: "Administrative Excellence",
      //       committeescore: scores.join(", "),
      //       averagescore: avg, // string like "87.67"
      //       status: "COMPLETED" as const,
      //       submittedCount: totalMembersPerNominee, // completed => full submissions
      //       mixedScores: scores,
      //     }
      //   }),
    ]
  )

  // ------------- FILTER -------------
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return data
    return data.filter((d) => Object.values(d).join(" ").toLowerCase().includes(q))
  }, [searchQuery, data])

  // ---------- AGGREGATES & STATUS LOGIC ----------
  // total capacity = number of nominees * members per nominee
  const totalCapacity = data.length * totalMembersPerNominee
  const totalSubmitted = data.reduce((sum, d) => sum + (d.submittedCount || 0), 0)

  // counts by row status (nominees)
  const completedNomineeCount = data.filter((d) => d.status === "COMPLETED").length
  const ongoingNomineeCount = data.filter((d) => d.status === "ON GOING").length
  const notStartedNomineeCount = data.filter((d) => d.status === "NOT STARTED").length

  // derive the overall reportStatus from row statuses
  let reportStatus: "NOT STARTED" | "ON GOING" | "COMPLETED"
  if (completedNomineeCount === data.length && data.length > 0) {
    reportStatus = "COMPLETED"
  } else if (ongoingNomineeCount > 0 || (completedNomineeCount > 0 && completedNomineeCount < data.length)) {
    reportStatus = "ON GOING"
  } else {
    reportStatus = "NOT STARTED"
  }

  // UI config
  const getReportUIConfig = (status: string) => {
    switch (status) {
      case "NOT STARTED":
        return {
          bgColor: "bg-[var(--light-red)]",
          buttonDisabled: true,
        }
      case "ON GOING":
        return {
          bgColor: "bg-[var(--light-purple)]",
          buttonDisabled: true,
        }
      case "COMPLETED":
        return {
          bgColor: "bg-[var(--light-green)]",
          buttonDisabled: false,
        }
      default:
        return {
          bgColor: "bg-[var(--settings-grey)]",
          buttonDisabled: true,
        }
    }
  }

  const { bgColor, buttonDisabled } = getReportUIConfig(reportStatus)
  const hasResults = filteredData.length > 0

  // ---------- TABLE COLUMNS ----------
  const columns: Column[] = [
    { key: "nomineeid", label: "Nominee ID", width: 120 },
    { key: "nomineename", label: "Nominee Name", width: 160 },
    { key: "category", label: "Category", width: 200 },
    {
      key: "committeescore",
      label: "Committee Score",
      width: 180,
      render: (value: string, row: Nomination) => {
        if (row.status === "NOT STARTED") return "---"
        const scores = row.mixedScores || ["N/A", "N/A", "N/A"]
        return (
          <div className="flex gap-2">
            {scores.map((score: number | "N/A", idx: number) => (
              // SQUARE DESIGN FOR COMMITTEE SCORES
              <div
                key={idx}
                className={`w-8 h-6 text-xs flex items-center justify-center rounded ${
                  score === "N/A" ? "bg-[var(--settings-grey)] text-black" : "bg-[var(--maroon)] text-white"
                }`}
              >
                {score}
              </div>
            ))}
          </div>
        )
      },
    },
    {
      key: "averagescore",
      label: "Average Score",
      width: 150,
      render: (value: string | number, row: Nomination) => {
        // if numeric string or number, show with max 2 decimals (if number), otherwise show as is
        if (value === "" || value === null || value === undefined) return "---"
        if (typeof value === "number") {
          return (Math.round(value * 100) / 100).toFixed(2)
        }
        // value is string (maybe already toFixed), but ensure two decimals if it's numeric-like
        const parsed = Number(value)
        if (!isNaN(parsed)) {
          return parsed.toFixed(2)
        }
        return value
      },
    },
  ]

  const handleDownload = (row: Nomination, index: number) => {
    console.log("Download", row)
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
          <div>
            <h1 className="text-[28px] font-bold text-[var(--black)]">Nomination Report</h1>
            <p className="text-base text-[var(--dark-grey)]">Generate reports and view committee scoring summaries with full visibility</p>
          </div>
          <Button size="sm" variant="secondary">
            <div className="px-5 py-1">Back to Dashboard</div>
          </Button>
        </div>

        {/* Content */}
        <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] rounded-xl shadow-sm px-6 py-6 min-h-[75vh] flex flex-col relative content-area">
          <h2 className="text-[18px] font-bold text-gray-900 mb-6">Committee Scoring Summary</h2>

          <SearchBar value={searchQuery} onChange={(val: string) => setSearchQuery(val)} placeholder="Search by nominee name" />

          <div className="mt-4 flex flex-col w-full relative">
            {hasResults ? (
              <NominationReportTable columns={columns} data={filteredData} onDownloadClick={(row, index) => handleDownload(row, index)} />
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center text-gray-500 border border-[var(--outline-grey)] rounded-md">
                <FolderX size={100} className="mb-4 opacity-70" />
                <p className="font-bold text-3xl">No Results Found</p>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] rounded-xl shadow-sm mt-10 px-6 py-6 flex flex-col relative content-area">
          <h2 className="text-[18px] font-bold text-gray-900 mb-6">Gawad Tsanselor Final Report</h2>
        </div>
      </Section>
    )
  }

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">Nomination Report</h1>
          <p className="text-base text-[var(--dark-grey)]">Generate reports and view committee scoring summaries with full visibility</p>
        </div>
        <Button size="sm" variant="secondary">
          <div className="px-5 py-1">Back to Dashboard</div>
        </Button>
      </div>

      {/* Content */}
      <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] rounded-xl shadow-sm px-6 py-6 flex flex-col relative content-area">
        <h2 className="text-[18px] font-bold text-gray-900 mb-6">Committee Scoring Summary</h2>

        <SearchBar value={searchQuery} onChange={(val: string) => setSearchQuery(val)} placeholder="Search by nominee name" />

        <div className="mt-4 flex flex-col w-full relative">
          {hasResults ? (
            <NominationReportTable columns={columns} data={filteredData} onDownloadClick={(row, index) => handleDownload(row, index)} />
          ) : (
            <div className="h-[60vh] flex flex-col items-center justify-center text-gray-500 border border-[var(--outline-grey)] rounded-md">
              <FolderX size={100} className="mb-4 opacity-70" />
              <p className="font-bold text-3xl">No Results Found</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] rounded-xl shadow-sm mt-10 px-6 py-6 flex flex-col relative content-area">
        <h2 className="text-[18px] font-bold text-gray-900 mb-6">Gawad Tsanselor Final Report</h2>

        {/* SUMMARY BAR - uses the SAME reportStatus as above */}
        <div className={`w-full ${bgColor} rounded-sm min-h-[10vh] py-4 px-4 mb-2 relative pr-24`}>
          <div className="mb-2">
            <h3 className="text-md font-semibold text-gray-900">Evaluation Status</h3>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <PortalStatusBadge variant="report" totalMembers={totalCapacity} submittedCount={totalSubmitted} />
          </div>

          {/* status text */}
          <p className="text-sm text-[var(--dark-grey)]">
            {reportStatus === "NOT STARTED" && "No committee reviews submitted yet"}
            {reportStatus === "ON GOING" &&
              `${completedNomineeCount} of ${data.length} nominees reviewed`}
            {reportStatus === "COMPLETED" && "All committee reviews completed"}
          </p>
        </div>

        {/* Generate button */}
        <Button size="sm" variant={buttonDisabled ? "disabled" : "primary"} disabled={buttonDisabled} className="w-full">
          <div className="px-4 py-2">Generate Report</div>
        </Button>
      </div>
    </Section>
  )
}
