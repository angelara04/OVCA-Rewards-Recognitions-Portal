import React from "react";
import Section from "../section";
import Tabs from "./tabs";

interface SidebarProps {
  role: "hr" | "committee" | "nominator";
}

// Guide to use the Sidebar component:
//<Sidebar role="hr" />
//<Sidebar role="committee" />
//<Sidebar role="nominator" />

export default function Sidebar({ role }: SidebarProps) {
  let tabs: string[] = [];

  switch (role) {
    case "hr":
      tabs = ["Dashboard", "Nominations", "Employees", "Reports", "Settings"];
      break;
    case "committee":
      tabs = ["Overview", "Pending Reviews", "Scoring", "History"];
      break;
    case "nominator":
      tabs = ["Overview", "My Nominations", "Results"];
      break;
    default:
      tabs = ["Overview"];
  }

  return (
    <Section>
      <div className="w-[265px] h-full">
        <Tabs info={tabs} />
      </div>
    </Section>
  );
}
