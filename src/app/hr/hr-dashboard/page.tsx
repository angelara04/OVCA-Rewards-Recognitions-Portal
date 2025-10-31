"use client";

import React, { useState } from "react";
import Card from "@/components/card";
import Button from "@/components/button";
import ProgressCard from "@/components/progressCard";
import Section from "@/components/section";
import { MoveRight, MoreHorizontal, FolderX } from "lucide-react";
import Table from "@/components/table/employee-registration-table";
import DropdownMenu from "@/components/dropdown-menu";
import ConfirmModal from "@/components/confirm-modal";
import SearchBar from "@/components/search-bar";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  dateRegistered: string;
}

export default function Page() {
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "department", label: "Department" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "dateRegistered", label: "Date Registered" },
  ];

  // Sample data
  const data: Employee[] = [
    {
      id: "E0125",
      name: "Alice Cruz",
      role: "HR",
      department:
        "Office of the Vice Chancellor for Academic Affairs and Community Engagement",
      email: "alice.cruz@example.com",
      status: "pending",
      dateRegistered: "2025-10-01",
    },
    {
      id: "E0126",
      name: "Ben Santos",
      role: "Committee Member",
      department:
        "Office of the Vice Chancellor for Academic Affairs and Community Engagement",
      email: "ben.santos@example.com",
      status: "approved",
      dateRegistered: "2025-09-15",
    },
    {
      id: "E0127",
      name: "Clara Dela Cruz",
      role: "HR",
      department:
        "Office of the Vice Chancellor for Academic Affairs and Community Engagement",
      email: "clara.delacruz@example.com",
      status: "pending",
      dateRegistered: "2025-10-20",
    },
  ];

  const filteredData = data;
  const hasResults = filteredData.length > 0;

  // ✅ Fix: compute dropdown position relative to nearest table container
  function openActionsDropdown(e: React.MouseEvent, index: number) {
    const button = e.currentTarget as HTMLElement;
    const container = button.closest(".table-container") as HTMLElement | null;

    if (!container) return;

    const buttonRect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setDropdownPosition({
      top: buttonRect.bottom - containerRect.top + 4,
      left: buttonRect.left - containerRect.left - 90,
    });

    setOpenDropdownIndex((prev) => (prev === index ? null : index));
  }

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      <div className="content-area w-full flex flex-col gap-2">
        {/* Title */}
        <div className="flex flex-row justify-between items-center w-full my-2">
          <span className="font-bold text-3xl">HR Dashboard</span>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="px-5 py-1">Review Registrations</div>
          </Button>
        </div>

        <span className="text-lg w-full mb-5">
          Manage the Gawad Tsanselor system and oversee all nomination processes
        </span>

        {/* Cards section */}
        <div className="w-full flex flex-col gap-2 md:flex-row mb-5">
          <Card description="Nominations" number={10} />
          <Card description="Active Committee Members" number={5} />
          <Card description="Pending Registrations" number={20} />
          <Card description="Total Registered" number={20} />
        </div>

        {/* Portal Status and Manage Settings */}
        <Section width="w-full" alignment="p-10 mb-5">
          <div className="flex flex-row justify-between">
            <span className="font-bold text-2xl">Portal Status</span>
            <div className="flex flex-row gap-2 rounded-2xl p-2 transition-all duration-200 ease-out hover:scale-103 hover:-translate-y-0 hover:cursor-pointer motion-safe:transform">
              <span className="text-[14px] text-[var(--forest-green)]">
                Manage Settings
              </span>
              <MoveRight className="text-[var(--forest-green)]" />
            </div>
          </div>

          {/* Progress Cards */}
          <div className="flex flex-col justify-center gap-4 mt-4 w-full lg:flex-row items-center">
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

        <Section width="w-full" alignment="p-10">
          <span className="font-bold text-2xl">
            Recent Employee Registrations
          </span>

          {/* Table */}
          <div className="table-container mt-4 border border-[var(--outline-grey)] rounded-md bg-[var(--white)] min-h-[60vh] flex flex-col w-full relative">
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
                          openActionsDropdown(e, i);
                        }}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    );
                  }}
                />
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
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full text-gray-500">
                <FolderX size={100} className="mb-4 opacity-70" />
                <p className="font-bold text-3xl">No Results Found</p>
              </div>
            )}
          </div>
        </Section>

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
