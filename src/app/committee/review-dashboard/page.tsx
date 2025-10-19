import Section from "@/components/section";
import Card from "@/components/card";
import Button from "@/components/button";
import Table from "@/components/table/review-nomination-table";

export default function ReviewDashboardPage() {
  const nomineeData = [
    {
      nomineeName: "Nominee Name 1",
      category: "Category X",
      nominator: "Nominator 1",
      dateSubmitted: "10/12/2025",
      status: "Complete",
    },
    {
      nomineeName: "Nominee Name 2",
      category: "Category Y",
      nominator: "Nominator 2",
      dateSubmitted: "10/10/2025",
      status: "Pending",
    },
    {
      nomineeName: "Nominee Name 3",
      category: "Category Z",
      nominator: "Nominator 3",
      dateSubmitted: "10/08/2025",
      status: "Not Started",
    },
  ];

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Header */}
      <div className="flex flex-row justify-between items-center w-full my-2">
        <span className="font-bold text-3xl">Committee Review Dashboard</span>
        <Button size="sm" variant="primary">
          <div className="px-5 py-1">Review Nominations</div>
        </Button>
      </div>

      {/* Subtitle */}
      <span className="text-lg w-full">
        Welcome to the committee dashboard. Here you can view and review
        submitted nominations.
      </span>

      {/* Cards section */}
      <div className="w-full flex flex-col gap-2 sm:flex-row mt-4">
        <Card description="Pending Review" number={12} />
        <Card description="Reviewed" number={8} />
        <Card description="Total Nominations" number={20} />
        <Card description="Average Score" number={89} />
      </div>

      {/* Table section */}
      <div className="mt-8 w-full flex justify-center items-center">
        <Table title="Nominations for Review" data={nomineeData} />
      </div>
    </Section>
  );
}
