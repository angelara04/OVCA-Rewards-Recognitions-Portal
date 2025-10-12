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
      tabs = [
        "Review Dashboard",
        "Pending Reviews",
        "Scored Nominations",
        "Committee Scoring",
      ];
      break;
    case "committee":
      tabs = [
        "Dashboard",
        "Committee Review",
        "HR Reports",
        "Final Evaluation",
      ];
      break;
    case "nominator":
      tabs = ["Dashboard", "Nomination Forms", "My Nominations"];
      break;
  }

  return (
    <Section>
      <div className="w-[265px] h-full">
        <Tabs info={tabs} role={role} />
      </div>
    </Section>
  );
}
