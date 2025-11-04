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
    case "committee":
      tabs = [
        "Review Dashboard",
        "Pending Reviews",
        "Scored Nominations",
        "Committee Scoring",
      ];
      break;
    case "hr":
      tabs = [
        "HR Dashboard",
        "Employee Registration",
        "Committee Management",
        "Portal Settings",
        "Nomination Report",
      ];
      break;
    case "nominator":
      tabs = ["Dashboard", "Nomination Forms", "My Nominations"];
      break;
  }

  return (
    <Section
      height="h-full"
      width="max-w-[20%] w-full min-w-[300px] flex min-h-screen sticky top-0"
      alignment=""
    >
      <div className=" w-full h-full">
        <Tabs info={tabs} role={role} />
      </div>
    </Section>
  );
}
