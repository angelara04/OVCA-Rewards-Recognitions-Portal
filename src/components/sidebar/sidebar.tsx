import React from "react";
import Tabs from "./tabs";
import Section from "../section";

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
    <Section height="h-full" width="max-w-[20%] w-full min-w-[150px]">
      <div className=" w-full h-full">
        <Tabs info={tabs} role={role} />
      </div>
    </Section>
  );
}
