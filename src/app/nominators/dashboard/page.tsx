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
    <Section
      width="w-full"
      height="min-h-screen"
      alignment="items-center p-10 "
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">
            Nominator Dashboard
          </h1>
          <p className="text-base text-[var(--dark-grey)]">
            Welcome to your nomination dashboard. Here you can create new
            nominations and track existing ones.
          </p>
        </div>
        <Button size="sm" variant="primary">
          <div className="px-5 py-1">New Nomination</div>
        </Button>
      </div>

      {/* Cards section */}
      <div className="w-full flex flex-col gap-2 sm:flex-row mb-5">
        <Card description="Draft Nominations" number={10} />
        <Card description="Submitted Entries" number={5} />
        <Card description="Under Review" number={20} />
        <Card description="Finalized Awards" number={20} />
      </div>

      {/* Table section */}
      <div className="mt-8 w-full flex justify-center items-center">
        <Table title="Recent Nominations" data={nominationsData} />
      </div>
    </Section>
  );
}
