"use client";
import React, { useState, useMemo } from "react";
import { FolderX, MoreHorizontal } from "lucide-react";
import TabsLift from "@/components/tabs-lift";
import Button from "@/components/button";
import SearchBar from "@/components/search-bar";
import Table, { Column } from "@/components/table/employee-registration-table";
import DropdownMenu from "@/components/dropdown-menu";
import ConfirmModal from "@/components/confirm-modal";

type TabKey = "all" | "pending" | "approved" | "rejected";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: TabKey;
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [modalData, setModalData] = useState<{ action: "approve" | "reject"; name: string } | null>(null);

  // Sample Data
  const data: Employee[] = Array(25).fill(null).map((_, i) => ({
    id: `E0125${1000 + i}`,
    name: `Maria Del Santos ${i + 1}`,
    role: "Nominator",
    department: "Office of the Vice Chancellor for Academic Affairs and Community Engagement",
    email: `maria.delsantos${i + 1}@up.edu.ph`,
    status: i % 8 === 0 ? "approved" : "pending", // rejected intentionally empty
  }));

  // Counts
  const counts = useMemo(() => ({
    all: data.length,
    pending: data.filter(d => d.status === "pending").length,
    approved: data.filter(d => d.status === "approved").length,
    rejected: data.filter(d => d.status === "rejected").length,
  }), [data]);

  // Tabs
  const tabs = [
    { key: "all" as TabKey, label: "All", count: counts.all },
    { key: "pending" as TabKey, label: "Pending", count: counts.pending },
    { key: "approved" as TabKey, label: "Approved", count: counts.approved },
    { key: "rejected" as TabKey, label: "Rejected", count: counts.rejected },
  ];

  // Filtered Data
  const filteredData = useMemo(() => {
    const base = activeTab === "all" ? data : data.filter(d => d.status === activeTab);
    if (!searchQuery.trim()) return base;
    return base.filter(d => Object.values(d).some(val => String(val).toLowerCase().includes(searchQuery.toLowerCase())));
  }, [activeTab, searchQuery, data]);

  const hasResults = filteredData.length > 0;

  const columns: Column[] = [
    { key: "id", label: "Employee ID" },
    { key: "name", label: "Employee Name" },
    { key: "role", label: "Role" },
    { key: "department", label: "Department" },
    { key: "email", label: "Email" },
  ];

  return (
    <div className="w-full bg-[#fafafa] px-12 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">Employee Registration</h1>
          <p className="text-base text-gray-600">
            Review and verify employee registrations for nomination eligibility
          </p>
        </div>
        <Button variant="secondary" size="md">Back to Dashboard</Button>
      </div>

      {/* Tabs */}
      <TabsLift
        tabs={tabs}
        activeKey={activeTab}
        onChangeAction={(key: TabKey) => setActiveTab(key)}
      />

      {/* Content */}
      <div className="max-w-6xl mx-auto w-full bg-white border border-gray-200 rounded-b-xl shadow-sm -mt-[1px] px-6 py-6 min-h-[75vh] flex flex-col relative content-area">
        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChangeAction={setSearchQuery}
          placeholder="Search by name, department, or email"
        />

        {/* Table */}
        {hasResults ? (
          <Table
            columns={columns}
            data={filteredData}
            renderActions={(row, i) => (
              <button
                className="text-gray-700 hover:text-gray-900"
                onClick={(e) => {
                  const buttonRect = (e.target as HTMLElement).closest("button")!.getBoundingClientRect();
                  const containerRect = document.querySelector(".content-area")!.getBoundingClientRect();
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
          <div className="flex flex-col items-center justify-center flex-1 text-gray-500 mt-20">
            <FolderX size={64} className="mb-4 opacity-70" />
            <p className="text-lg font-medium">No Results Found</p>
          </div>
        )}

        {/* Dropdown */}
        {typeof window !== "undefined" && openDropdownIndex !== null && dropdownPosition && (
          <DropdownMenu
            position={dropdownPosition}
            onCloseAction={() => setOpenDropdownIndex(null)}
            items={[
              {
                label: "Approve",
                color: "text-[var(--forest-green)]",
                onClickAction: () => setModalData({
                  action: "approve",
                  name: filteredData[openDropdownIndex!].name
                })
              },
              {
                label: "Reject",
                color: "text-red-600",
                onClickAction: () => setModalData({
                  action: "reject",
                  name: filteredData[openDropdownIndex!].name
                })
              }
            ]}
          />
        )}


        {/* Confirm Modal */}
        {modalData && (
          <ConfirmModal
            action={modalData.action}
            onCancelAction={() => setModalData(null)}
            onConfirmAction={() => {
              alert(`${modalData.action === "approve" ? "Approved" : "Rejected"} ${modalData.name}`);
              setModalData(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
