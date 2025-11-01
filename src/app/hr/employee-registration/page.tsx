"use client";
import React, { useState, useMemo } from "react";
import { FolderX, MoreHorizontal } from "lucide-react";
import TabsLift from "@/components/tabs-lift";
import Button from "@/components/button";
import { SearchBar } from "@/components/search-bar";
import Table, { Column } from "@/components/table/hr-registration-table";
import DropdownMenu from "@/components/dropdown-menu";
import ConfirmModal from "@/components/confirm-modal";
import Section from "@/components/section";

type TabKey = "all" | "pending" | "approved" | "rejected";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: TabKey;
  dateRegistered: string;
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [modalData, setModalData] = useState<{
    action: "approve" | "reject";
    name: string;
  } | null>(null);

  // Sample Data (only Nominator roles)
  const data: Employee[] = Array(25)
    .fill(null)
    .map((_, i) => {
      const status: TabKey = i % 8 === 0 ? "approved" : "pending";
      const date = new Date(Date.now() - i * 86400000);
      const dateRegistered = date.toLocaleDateString("en-PH");
      return {
        id: `E0125${1000 + i}`,
        name: `Maria Del Santos ${i + 1}`,
        role: "Nominator",
        department:
          "Office of the Vice Chancellor for Academic Affairs and Community Engagement",
        email: `maria.delsantos${i + 1}@up.edu.ph`,
        status,
        dateRegistered,
      };
    });

  // Counts
  const counts = useMemo(
    () => ({
      all: data.length,
      pending: data.filter((d) => d.status === "pending").length,
      approved: data.filter((d) => d.status === "approved").length,
      rejected: data.filter((d) => d.status === "rejected").length,
    }),
    [data]
  );

  // Tabs
  const tabs = [
    { key: "all" as TabKey, label: "All", count: counts.all },
    { key: "pending" as TabKey, label: "Pending", count: counts.pending },
    { key: "approved" as TabKey, label: "Approved", count: counts.approved },
    { key: "rejected" as TabKey, label: "Rejected", count: counts.rejected },
  ];

  // Filtered Data
  const filteredData = useMemo(() => {
    const base =
      activeTab === "all" ? data : data.filter((d) => d.status === activeTab);
    if (!searchQuery.trim()) return base;
    return base.filter((d) =>
      Object.values(d).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [activeTab, searchQuery, data]);

  const hasResults = filteredData.length > 0;

  const columns: Column[] = [
    { key: "id", label: "Employee ID" },
    { key: "name", label: "Employee Name" },
    { key: "role", label: "Role" },
    { key: "department", label: "Department" },
    { key: "email", label: "Email" },
    { key: "dateRegistered", label: "Date Registered" },
    { key: "status", label: "Status" },
  ];

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">
            Employee Registration
          </h1>
          <p className="text-base text-[var(--dark-grey)]">
            Review and verify employee registrations for nomination eligibility
          </p>
        </div>
        <Button variant="secondary" size="md">
          Back to Dashboard
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

      {/* Content */}
      <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] border-t-0 rounded-b-xl shadow-sm px-6 py-6 min-h-[75vh] flex flex-col relative content-area -mt-[8px]">
        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChange={(val: string) => setSearchQuery(val)}
          placeholder="Search by name, department, or email"
        />

        {/* Table Container */}
        <div className="mt-4 border border-[var(--outline-grey)] rounded-md bg-[var(--white)] min-h-[60vh] flex flex-col w-full relative">
          {hasResults ? (
            <div className="w-full overflow-auto">
              <Table
                columns={columns}
                data={filteredData}
                renderActions={(row, i) => {
                  const employee = filteredData[i];
                  const isPending = employee.status === "pending";
                  const iconColor = isPending
                    ? "text-[var(--maroon)]"
                    : "text-[var(--outline-grey)]";
                  const cursor = isPending
                    ? "cursor-pointer"
                    : "cursor-not-allowed";

                  return (
                    <button
                      disabled={!isPending}
                      className={`${iconColor} ${cursor}`}
                      onClick={(e) => {
                        if (!isPending) return;
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
                        setOpenDropdownIndex(
                          openDropdownIndex === i ? null : i
                        );
                      }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  );
                }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full text-gray-500">
              <FolderX size={100} className="mb-4 opacity-70" />
              <p className="font-bold text-3xl">No Results Found</p>
            </div>
          )}
        </div>

        {/* Dropdown */}
        {typeof window !== "undefined" &&
          openDropdownIndex !== null &&
          dropdownPosition && (
            <DropdownMenu
              position={dropdownPosition}
              onCloseAction={() => setOpenDropdownIndex(null)}
              items={[
                {
                  label: "Approve",
                  color: "text-[var(--forest-green)]",
                  onClickAction: () =>
                    setModalData({
                      action: "approve",
                      name: filteredData[openDropdownIndex!].name,
                    }),
                },
                {
                  label: "Reject",
                  color: "text-[var(--maroon)]",
                  onClickAction: () =>
                    setModalData({
                      action: "reject",
                      name: filteredData[openDropdownIndex!].name,
                    }),
                },
              ]}
            />
          )}

        {/* Confirm Modal */}
        {modalData && (
          <ConfirmModal
            action={modalData.action}
            onCancelAction={() => setModalData(null)}
            onConfirmAction={() => {
              alert(
                `${modalData.action === "approve" ? "Approved" : "Rejected"} ${
                  modalData.name
                }`
              );
              setModalData(null);
            }}
          />
        )}
      </div>
    </Section>
  );
}
