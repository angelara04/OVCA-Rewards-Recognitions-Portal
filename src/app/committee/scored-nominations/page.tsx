"use client";

import React from "react";
import Button from "@/components/button";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  ScrollableTable,
  ActionsMenu,
  StatusBadge,
  TableColumn,
} from "@/components/table/scrollable-table";
import { SearchBar } from "@/components/search-bar";
import Section from "@/components/section";

// Sample data for scored nominations
const SCORED_NOMINATIONS_DATA = [
  {
    nomineeId: "E01250125",
    nomineeName: "Maria Del Santos",
    category: "Administrative Excellence",
    nominatorId: "E01250125",
    nominatorName: "Jose Rizal",
    dateScored: "10/12/2025",
    totalScore: 20,
    status: "Disqualified",
  },
  {
    nomineeId: "E01250126",
    nomineeName: "Juan Dela Cruz",
    category: "Customer Service",
    nominatorId: "E01250126",
    nominatorName: "Maria Santos",
    dateScored: "10/12/2025",
    totalScore: 78,
    status: "Qualified",
  },
  {
    nomineeId: "E01250127",
    nomineeName: "Ana Garcia",
    category: "Innovation",
    nominatorId: "E01250127",
    nominatorName: "Pedro Lopez",
    dateScored: "10/12/2025",
    totalScore: 77,
    status: "Qualified",
  },
  {
    nomineeId: "E01250128",
    nomineeName: "Carlos Reyes",
    category: "Leadership",
    nominatorId: "E01250128",
    nominatorName: "Rosa Flores",
    dateScored: "10/12/2025",
    totalScore: 70,
    status: "Qualified",
  },
  {
    nomineeId: "E01250129",
    nomineeName: "Diana Morales",
    category: "Administrative Excellence",
    nominatorId: "E01250129",
    nominatorName: "Miguel Torres",
    dateScored: "10/12/2025",
    totalScore: 69,
    status: "Disqualified",
  },
  {
    nomineeId: "E01250130",
    nomineeName: "Eduardo Ramos",
    category: "Customer Service",
    nominatorId: "E01250130",
    nominatorName: "Sofia Mendez",
    dateScored: "10/12/2025",
    totalScore: 41,
    status: "Disqualified",
  },
  {
    nomineeId: "E01250131",
    nomineeName: "Francesca Diaz",
    category: "Innovation",
    nominatorId: "E01250131",
    nominatorName: "Antonio Ruiz",
    dateScored: "10/12/2025",
    totalScore: 32,
    status: "Disqualified",
  },
  {
    nomineeId: "E01250132",
    nomineeName: "Gabriel Ortiz",
    category: "Leadership",
    nominatorId: "E01250132",
    nominatorName: "Lucia Vargas",
    dateScored: "10/12/2025",
    totalScore: 25,
    status: "Disqualified",
  },
  {
    nomineeId: "E01250133",
    nomineeName: "Helena Soto",
    category: "Administrative Excellence",
    nominatorId: "E01250133",
    nominatorName: "Ivan Castillo",
    dateScored: "10/12/2025",
    totalScore: 56,
    status: "Disqualified",
  },
  {
    nomineeId: "E01250134",
    nomineeName: "Ignacio Medina",
    category: "Customer Service",
    nominatorId: "E01250134",
    nominatorName: "Juana Herrera",
    dateScored: "10/12/2025",
    totalScore: 45,
    status: "Disqualified",
  },
  {
    nomineeId: "E01250135",
    nomineeName: "Josefina Navarro",
    category: "Innovation",
    nominatorId: "E01250135",
    nominatorName: "Karina Pena",
    dateScored: "10/12/2025",
    totalScore: 82,
    status: "Qualified",
  },
  {
    nomineeId: "E01250136",
    nomineeName: "Leandro Gutierrez",
    category: "Leadership",
    nominatorId: "E01250136",
    nominatorName: "Mariana Acosta",
    dateScored: "10/12/2025",
    totalScore: 88,
    status: "Qualified",
  },
];

export default function ScoredNominationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [nominations, setNominations] = useState(SCORED_NOMINATIONS_DATA);

  const filteredNominations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return nominations;
    return nominations.filter((nomination) =>
      nomination.nomineeName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleEvaluate = (row: any) => {
    // navigate or open modal to evaluate — example:
    console.log("Evaluate nomination:", row);
  };

  const columns: TableColumn[] = [
    { key: "nomineeId", label: "Nominee ID", width: "w-36" },
    { key: "nomineeName", label: "Nominee Name", width: "w-72" },
    { key: "category", label: "Category", width: "w-72" },
    { key: "nominatorId", label: "Nominator ID", width: "w-36" },
    { key: "nominatorName", label: "Nominator Name", width: "w-56" },
    { key: "dateScored", label: "Date Scored", width: "w-36" },
    { key: "totalScore", label: "Total Score", width: "w-28" },
    {
      key: "status",
      label: "Status",
      width: "w-36",
      render: (_value, row) => {
        // ensure the prop matches StatusBadge type
        const status = row.status === "Qualified" ? "Qualified" : "Disqualified";
        return <StatusBadge status={status} />;
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: "w-24",
      render: (_value, row) => <ActionsMenu onEvaluate={() => handleEvaluate(row)} />,
    },
  ];

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Header */}
      <div className="flex flex-row justify-between items-center w-full my-2">
        <span className="font-bold text-3xl">Scored Nominations</span>
        <Button size="sm" variant="secondary">
          <div className="px-5 py-1">Back to Dashboard</div>
        </Button>
      </div>

      {/* Description */}
      <span className="text-lg w-full">
        Nominations that have been scored by the committee.
      </span>

      <div className="w-full bg-white rounded-lg border border-gray-200 p-8 overflow-hidden mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Completed Scored Nominations
        </h2>

        <div className="mb-6">
          <SearchBar
            placeholder="Search by nominee name"
            value={searchQuery}
            onChange={setSearchQuery}
          />
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
