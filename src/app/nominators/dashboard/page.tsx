import Section from "@/components/section";
import Card from "@/components/card";
import Button from "@/components/button";
import Table from "@/components/table/review-nomination-table";

export default function DashboardPage() {
  const nominationsData = [
    {
      nomineeName: "Nominee Name 1",
      category: "Category A",
      nominator: "Nominator 1",
      dateSubmitted: "10/07/2025",
      status: "Pending",
    },
    {
      nomineeName: "Nominee Name 2",
      category: "Category B",
      nominator: "Nominator 2",
      dateSubmitted: "10/07/2025",
      status: "Complete",
    },
    {
      nomineeName: "Nominee Name 3",
      category: "Category C",
      nominator: "Nominator 3",
      dateSubmitted: "10/07/2025",
      status: "Not Started",
    },
  ];

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      <div className="flex flex-row justify-between items-center w-full my-2">
        <span className="font-bold text-3xl">Nominator Dashboard</span>
        <Button size="sm" variant="primary">
          <div className="px-5 py-1">New Nomination</div>
        </Button>
      </div>

      <span className="text-lg w-full">
        Welcome to your nomination dashboard. Here you can create new
        nominations and track existing ones.
      </span>

      {/* Cards section */}
      <div className="w-full flex flex-col gap-2 sm:flex-row">
        <Card description="Draft" number={10} />
        <Card description="Submitted" number={5} />
        <Card description="Under Review" number={20} />
        <Card description="Finalized" number={20} />
      </div>

      {/* Table section */}
      <div className="mt-8 w-full flex justify-center items-center">
        <Table title="Recent Nominations" data={nominationsData} />
      </div>
    </Section>
  );
}
