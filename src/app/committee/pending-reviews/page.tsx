'use client';

import Button from "@/components/button";
import { useState, useMemo } from "react"
import { ScrollableTable, ActionsMenu } from "@/components/table/scrollable-table"
import { SearchBar } from "@/components/search-bar"
import { StatusBadge } from "@/components/table/status-badge"
import Section from "@/components/section";

// Mock data for Pending Review
const PENDING_NOMINATIONS_DATA = [
  {
    nomineeId: "E01250125",
    nomineeName: "Maria Del Santos",
    category: "Administrative Excellence",
    nominatorId: "E01250125",
    nominatorName: "Jose Rizal",
    dateSubmitted: "10/15/2025",
    department: "Human Resources",
    status: "In Progress" as const,
  },
  {
    nomineeId: "E01250126",
    nomineeName: "Juan Dela Cruz",
    category: "Customer Service",
    nominatorId: "E01250126",
    nominatorName: "Maria Santos",
    dateSubmitted: "10/14/2025",
    department: "Operations",
    status: "In Progress" as const,
  },
  {
    nomineeId: "E01250127",
    nomineeName: "Ana Garcia",
    category: "Innovation",
    nominatorId: "E01250127",
    nominatorName: "Pedro Lopez",
    dateSubmitted: "10/13/2025",
    department: "Technology",
    status: "In Progress" as const,
  },
  {
    nomineeId: "E01250128",
    nomineeName: "Carlos Reyes",
    category: "Leadership",
    nominatorId: "E01250128",
    nominatorName: "Rosa Flores",
    dateSubmitted: "10/12/2025",
    department: "Finance",
    status: "In Progress" as const,
  },
  {
    nomineeId: "E01250129",
    nomineeName: "Diana Morales",
    category: "Administrative Excellence",
    nominatorId: "E01250129",
    nominatorName: "Miguel Torres",
    dateSubmitted: "10/11/2025",
    department: "Human Resources",
    status: "Not Started" as const,
  },
  {
    nomineeId: "E01250130",
    nomineeName: "Eduardo Ramos",
    category: "Customer Service",
    nominatorId: "E01250130",
    nominatorName: "Sofia Mendez",
    dateSubmitted: "10/10/2025",
    department: "Operations",
    status: "Not Started" as const,
  },
  {
    nomineeId: "E01250131",
    nomineeName: "Francesca Diaz",
    category: "Innovation",
    nominatorId: "E01250131",
    nominatorName: "Antonio Ruiz",
    dateSubmitted: "10/09/2025",
    department: "Technology",
    status: "Not Started" as const,
  },
  {
    nomineeId: "E01250132",
    nomineeName: "Gabriel Ortiz",
    category: "Leadership",
    nominatorId: "E01250132",
    nominatorName: "Lucia Vargas",
    dateSubmitted: "10/08/2025",
    department: "Finance",
    status: "In Progress" as const,
  },
  {
    nomineeId: "E01250133",
    nomineeName: "Helena Soto",
    category: "Administrative Excellence",
    nominatorId: "E01250133",
    nominatorName: "Ivan Castillo",
    dateSubmitted: "10/07/2025",
    department: "Marketing",
    status: "Not Started" as const,
  },
  {
    nomineeId: "E01250134",
    nomineeName: "Ignacio Medina",
    category: "Customer Service",
    nominatorId: "E01250134",
    nominatorName: "Juana Herrera",
    dateSubmitted: "10/06/2025",
    department: "Operations",
    status: "Not Started" as const,
  },
  {
    nomineeId: "E01250135",
    nomineeName: "Josefina Navarro",
    category: "Innovation",
    nominatorId: "E01250135",
    nominatorName: "Karina Pena",
    dateSubmitted: "10/05/2025",
    department: "Technology",
    status: "In Progress" as const,
  },
  {
    nomineeId: "E01250136",
    nomineeName: "Leandro Gutierrez",
    category: "Leadership",
    nominatorId: "E01250136",
    nominatorName: "Mariana Acosta",
    dateSubmitted: "10/04/2025",
    department: "Finance",
    status: "Not Started" as const,
  },
]

export default function PendingNominationsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredNominations = useMemo(() => {
    if (!searchQuery.trim()) return PENDING_NOMINATIONS_DATA

    const query = searchQuery.toLowerCase()
    return PENDING_NOMINATIONS_DATA.filter(
      (nomination) =>
        nomination.nomineeName.toLowerCase().includes(query) || nomination.department.toLowerCase().includes(query),
    )
  }, [searchQuery])

  const handleEvaluate = (row: any) => {
    console.log("Evaluate nomination:", row)
    // Add evaluation logic here
  }

  const columns = [
    { key: "nomineeId", label: "Nominee ID", width: "w-32" },
    { key: "nomineeName", label: "Nominee Name", width: "w-40" },
    { key: "category", label: "Category", width: "w-48" },
    { key: "nominatorId", label: "Nominator ID", width: "w-32" },
    { key: "nominatorName", label: "Nominator Name", width: "w-40" },
    { key: "dateSubmitted", label: "Date Submitted", width: "w-32" },
    {
      key: "status",
      label: "Status",
      width: "w-32",
      render: (_: any, row: any) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      width: "w-20",
      render: (_: any, row: any) => <ActionsMenu onEvaluate={() => handleEvaluate(row)} />,
    },
  ]

  return (
      <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
        {/* Header */}
        <div className="flex flex-row justify-between items-center w-full my-2">
          <span className="font-bold text-3xl">Pending Review</span>
          <Button size="sm" variant="secondary">
            <div className="px-5 py-1">Back to Dashboard</div>
          </Button>
        </div>

        {/* Description */}
        <span className="text-lg w-full">
          Nominations awaiting committee review and scoring.
        </span>

      <div className="w-full bg-white rounded-lg border border-gray-200 p-8 overflow-hidden mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nominations for Review</h2>

        <div className="mb-6">
          <SearchBar placeholder="Search by nominee name" value={searchQuery} onChange={setSearchQuery} />
        </div>

      <div className="w-full overflow-hidden">
        <ScrollableTable
          columns={columns}
          data={filteredNominations}
          onActionClick={handleEvaluate}
          headerBgColor="bg-[#8B1538]"
          headerTextColor="text-white"
        />
      </div>
      </div>
      </Section>
  );
}