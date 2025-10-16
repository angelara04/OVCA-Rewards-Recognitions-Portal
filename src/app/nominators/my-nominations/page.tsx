"use client";

import Section from "@/components/section";
import Button from "@/components/button";
import Table from "@/components/table/review-nomination-table";

export default function MyNominationsPage() {
  const nominationsData = [
    {
      nomineeName: "Nominee Name 1",
      category: "Category A",
      nominator: "Nominator 1",
      dateSubmitted: "10/07/2025",
      status: "Pending",
      score: "80",
      actions: "View",
    },
    {
      nomineeName: "Nominee Name 2",
      category: "Category B",
      nominator: "Nominator 2",
      dateSubmitted: "10/07/2025",
      status: "Complete",
      score: "95",
      actions: "View",
    },
    {
      nomineeName: "Nominee Name 3",
      category: "Category C",
      nominator: "Nominator 3",
      dateSubmitted: "10/07/2025",
      status: "Not Started",
      score: "-",
      actions: "View",
    },
  ];

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Header */}
      <div className="flex flex-row justify-between items-center w-full my-2">
        <span className="font-bold text-3xl">My Nominations</span>
        <Button size="sm" variant="primary">
          <div className="px-5 py-1">New Nomination</div>
        </Button>
      </div>

      {/* Description */}
      <span className="text-lg w-full">
        View and manage all your nominations.
      </span>

      {/* Table */}
      <div className="mt-8 w-full flex justify-center items-center">
        <Table title="Submitted Nominations" data={nominationsData} />
      </div>
    </Section>
  );
}
