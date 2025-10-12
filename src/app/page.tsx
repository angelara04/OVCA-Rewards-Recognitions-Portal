import Image from "next/image";
import Header from "@/components/header";
import Section from "@/components/section";
import Card from "@/components/card";
import Sidebar from "@/components/sidebar/sidebar";
import Button from "@/components/button";
import Table from "@/components/table/review-nomination-table";
import Greeting from "@/components/greetings/greeting";

export default function Home() {
  // Sample table data
  const role = "nominator"; // Change this to "hr", "committee", or "nominator" to test different sidebars

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
    <div className="min-h-screen">
      <Header />
      <Greeting Fname="John Doe" role={role} />

      <div className="flex flex-row gap-3 mt-3">
        <Sidebar role={role} />
        {/* sidebar have a fixed width */}

        <div className="w-[80%] h-full ">
          {/* to edit the section width need to wrap it because width==full  */}

          <Section>
            <div className="w-full flex flex-row justify-center items-center gap-4">
              <Card description="Total Nominations" number={10} />
              <Card description="Total Awards" number={5} />
              <Card description="Total Participants" number={20} />
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="primary">Review Nomination</Button>
              <Button variant="secondary">Logout</Button>
              <Button variant="action">Action</Button>
              <Button variant="status">Status</Button>
            </div>

            {/* ✅ Table section */}
            <div className="mt-8 w-[95%] ">
              {/* to edit the table width need to wrap it because width==full  */}
              <Table title="Nominations for Review" data={nominationsData} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
