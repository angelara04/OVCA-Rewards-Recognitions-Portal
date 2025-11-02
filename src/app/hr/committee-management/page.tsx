"use client";
import React, { useState, useMemo } from "react";
import { FolderX, MoreHorizontal } from "lucide-react";
import TabsLift from "@/components/tabs-lift";
import Button from "@/components/button";
import { SearchBar } from "@/components/search-bar";
import Table, { Column } from "@/components/table/hr-registration-table";
import DropdownMenu from "@/components/dropdown-menu";
import Section from "@/components/section";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  dateRegistered: string;
  isCommittee: boolean;
}

type TabKey = "all" | "committee" | "nominator";

export default function CommitteeManagementPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [data, setData] = useState<Employee[]>(() =>
    Array(20)
      .fill(null)
      .map((_, i) => {
        const role = i % 2 === 0 ? "Committee" : "Nominator";
        const date = new Date(2025, 10, 1 - i);
        return {
          id: `E${1000 + i}`,
          name: `Employee ${i + 1}`,
          role,
          department: "Office of the Vice Chancellor",
          email: `employee${i + 1}@up.edu.ph`,
          dateRegistered: date.toLocaleDateString("en-PH"),
          isCommittee: role === "Committee",
        };
      })
  );

  // Tabs
  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: data.length },
    {
      key: "committee",
      label: "Committee",
      count: data.filter((d) => d.role === "Committee").length,
    },
    {
      key: "nominator",
      label: "Nominator",
      count: data.filter((d) => d.role === "Nominator").length,
    },
  ];

  // Filtered data
  const filteredData = useMemo(() => {
    let base = data;
    if (activeTab === "committee")
      base = data.filter((d) => d.role === "Committee");
    if (activeTab === "nominator")
      base = data.filter((d) => d.role === "Nominator");
    if (searchQuery.trim()) {
      base = base.filter((d) =>
        Object.values(d).some((val) =>
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    return base;
  }, [activeTab, searchQuery, data]);

  const hasResults = filteredData.length > 0;

  const columns: Column[] = [
    { key: "id", label: "Employee ID" },
    { key: "name", label: "Employee Name" },
    { key: "role", label: "Role" },
    { key: "department", label: "Department" },
    { key: "email", label: "Email" },
    { key: "dateRegistered", label: "Date Registered" },
  ];

  // Handle Add/Remove Committee
  const handleCommitteeAction = (index: number) => {
    const employee = filteredData[index];
    const updatedData = data.map((d) =>
      d.id === employee.id
        ? {
            ...d,
            role: d.isCommittee ? "Nominator" : "Committee",
            isCommittee: !d.isCommittee,
          }
        : d
    );
    setData(updatedData);
    setOpenDropdownIndex(null); // close dropdown
  };

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">
            Committee Management
          </h1>
          <p className="text-base text-[var(--dark-grey)]">
            Add or remove committee members who will review and score
            nominations.
          </p>
        </div>
        <Button size="sm" variant="secondary">
          <div className="px-5 py-1">Back to Dashboard</div>
        </Button>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-6xl">
        <TabsLift
          tabs={tabs}
          activeKey={activeTab}
          onChangeAction={(key: TabKey) => setActiveTab(key)}
        />
      </div>

      {/* Table & Content */}
      <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] border-t-0 rounded-b-xl shadow-sm px-6 py-6 min-h-[75vh] flex flex-col relative content-area -mt-[8px]">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, department, or email"
        />

        <div className="mt-4 flex-1 relative">
          {hasResults ? (
            <Table
              columns={columns}
              data={filteredData}
              renderActions={(row, i) => (
                <button
                  className="text-[var(--maroon)] cursor-pointer"
                  onClick={(e) => {
                    const buttonRect = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    const containerRect = document
                      .querySelector(".content-area")!
                      .getBoundingClientRect();
                    setDropdownPosition({
                      top: buttonRect.bottom - containerRect.top + 4,
                      left: buttonRect.left - containerRect.left - 90,
                    });
                    setOpenDropdownIndex(openDropdownIndex === i ? null : i);
                  }}
                >
                  <MoreHorizontal size={18} />
                </button>
              )}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full text-gray-500">
              <FolderX size={100} className="mb-4 opacity-70" />
              <p className="font-bold text-3xl">No Results Found</p>
            </div>
          )}
        </div>

        {/* Dropdown */}
        {openDropdownIndex !== null && dropdownPosition && (
          <DropdownMenu
            position={dropdownPosition}
            onCloseAction={() => setOpenDropdownIndex(null)}
            items={
              [
                filteredData[openDropdownIndex].role === "Nominator" && {
                  label: "Add as Committee",
                  color: "text-[var(--black)]",
                  onClickAction: () => handleCommitteeAction(openDropdownIndex),
                },
                filteredData[openDropdownIndex].role === "Committee" && {
                  label: "Remove from Committee",
                  color: "text-[var(--black)]",
                  onClickAction: () => handleCommitteeAction(openDropdownIndex),
                },
              ].filter(Boolean) as {
                label: string;
                color: string;
                onClickAction: () => void;
              }[]
            }
          />
        )}
      </div>
    </Section>
  );
}
