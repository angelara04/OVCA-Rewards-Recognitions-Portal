import Card from "@/components/card";
import Button from "@/components/button";
import ProgressCard from "@/components/progressCard";
import Section from "@/components/section";

export default function Page() {
  return (
    <Section
      width="w-full"
      height="min-h-screen"
      alignment="items-center p-10  "
    >
      {/* Title */}
      <div className="flex flex-row justify-between items-center w-full my-2">
        <span className="font-bold text-3xl">HR Dashboard</span>
        <Button size="sm" variant="primary">
          <div className="px-5 py-1">Review Registrations</div>
        </Button>
      </div>

      <span className="text-lg w-full mb-5">
        Manage the Gawad Tsanselor system and oversee all nomination processes
      </span>

      {/* Cards section */}
      <div className="w-full flex flex-col gap-2 sm:flex-row">
        <Card description="Nominations" number={10} />
        <Card description="Active Committee Members" number={5} />
        <Card description="Pending Registrations" number={20} />
        <Card description="Total Registered" number={20} />
      </div>

      {/* Portal Status and Manage Settings  */}
      <Section width="w-full" alignment="p-10  ">
        <span className="font-bold text-2xl">Portal Status</span>
        <div className="flex flex-row justify-center gap-4">
          <ProgressCard
            variant="countdown"
            title="Nomination Process"
            durationDays={10}
            endDate={new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)}
          />

          <ProgressCard
            variant="progress"
            title="Committee Evaluation"
            progress={100}
            durationDays={10}
          />
        </div>
      </Section>
    </Section>
  );
}
