import Header from "@/components/header";
import Sidebar from "@/components/sidebar/sidebar";
import Greeting from "@/components/greetings/greeting";

export default function CommitteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = "hr";
  const Fname = "Joan Smith"; // temporary placeholder

  return (
    <div className="flex flex-col w-full h-full min-h-screen">
      {/* Header */}
      <div className="h-auto">
        <Header />
      </div>

      {/* Greeting */}
      <Greeting Fname={Fname} role={role} />

      {/* Sidebar + Main content */}
      <div className="flex flex-row w-full h-full gap-2 p-5">
        {/* Sidebar stays fixed */}
        <Sidebar role={role} />

        {/* Main content */}
        <div className="flex-1 min-w-0 h-full">{children}</div>
      </div>
    </div>
  );
}
