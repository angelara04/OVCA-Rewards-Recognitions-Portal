"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FolderX, MoreHorizontal } from "lucide-react";
import TabsLift from "@/components/tabs-lift";
import Button from "@/components/button";
import { SearchBar } from "@/components/search-bar";
import Table, { Column } from "@/components/table/hr-registration-table";
import DropdownMenu from "@/components/dropdown-menu";
import Section from "@/components/section";

import {
  getCommitteeMembers,
  getNominators,
  promoteToCommittee,
  removeFromCommittee,
  Profile,
} from "../committee-management/actions";

interface Employee {
  keyId: string;
  displayId: string;
  name: string;
  role: "Committee" | "Nominator";
  department?: string;
  email?: string;
  dateRegistered?: string;
  isCommittee: boolean;
}

type TabKey = "all" | "committee" | "nominator";

export default function CommitteeManagementPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function loadAll() {
  setLoading(true);
  try {
    const [committees, nominators] = await Promise.all([
      getCommitteeMembers(),
      getNominators(),
    ]);

    const committeeRows: Employee[] = committees.map((c) => ({
      keyId: c.id,
      displayId: c.id,
      name: c.name || "-",
      role: "Committee" as const,   // ✅ FIXED
      department: undefined,
      email: c.email,
      dateRegistered: undefined,
      isCommittee: true,
    }));

    const nominatorRows: Employee[] = nominators
      .map((n) => ({
        keyId: n.id,
        displayId: n.id,
        name: n.name || "-",
        role: "Nominator" as const,  // ✅ FIXED
        department: undefined,
        email: n.email,
        dateRegistered: undefined,
        isCommittee: false,
      }))
      .filter((n) => !committeeRows.some((c) => c.keyId === n.keyId));

    setData([...committeeRows, ...nominatorRows]);
  } catch (err) {
    console.error("Error loading committee/nominators", err);
    setData([]);
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    loadAll();
  }, []);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: data.length },
    { key: "committee", label: "Committee", count: data.filter((d) => d.role === "Committee").length },
    { key: "nominator", label: "Nominator", count: data.filter((d) => d.role === "Nominator").length },
  ];

  const filteredData = useMemo(() => {
    let base = data;
    if (activeTab === "committee") base = base.filter((d) => d.role === "Committee");
    if (activeTab === "nominator") base = base.filter((d) => d.role === "Nominator");
    if (searchQuery.trim()) {
      base = base.filter((d) =>
        [d.name, d.email, d.department, d.displayId].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return base;
  }, [activeTab, searchQuery, data]);

  const hasResults = filteredData.length > 0;

  const columns: Column[] = [
    { key: "displayId", label: "Employee ID" },
    { key: "name", label: "Employee Name" },
    { key: "role", label: "Role" },
    { key: "department", label: "Department" },
    { key: "email", label: "Email" },
    { key: "dateRegistered", label: "Date Registered" },
  ];

  async function handlePromote(userKeyId: string) {
    try {
      const res = await promoteToCommittee(userKeyId);
      if (!res.success) return alert(res.message || "Failed to promote user.");
      setData((prev) =>
        prev.map((d) => (d.keyId === userKeyId ? { ...d, role: "Committee", isCommittee: true } : d))
      );
    } catch (err) {
      console.error(err);
      alert("Promotion failed");
    }
  }

  async function handleRemove(userKeyId: string) {
    try {
      const res = await removeFromCommittee(userKeyId);
      if (!res.success) return alert(res.message || "Failed to remove user from committee.");
      setData((prev) =>
        prev.map((d) => (d.keyId === userKeyId ? { ...d, role: "Nominator", isCommittee: false } : d))
      );
    } catch (err) {
      console.error(err);
      alert("Remove failed");
    }
  }

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">Committee Management</h1>
          <p className="text-base text-[var(--dark-grey)]">
            Add or remove committee members who will review and score nominations.
          </p>
        </div>
        <Button size="sm" variant="secondary">
          <div className="px-5 py-1">Back to Dashboard</div>
        </Button>
      </div>

      <div className="w-full max-w-6xl">
        <TabsLift tabs={tabs} activeKey={activeTab} onChangeAction={(key: TabKey) => setActiveTab(key)} />
      </div>

      <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] border-t-0 rounded-b-xl shadow-sm px-6 py-6 min-h-[75vh] flex flex-col relative content-area -mt-[8px]">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, department, or email" />

        <div className="mt-4 flex-1 relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
              <div className="w-10 h-10 border-4 border-[var(--maroon)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[var(--dark-grey)] text-sm font-medium">Loading...</p>
            </div>
          ) : hasResults ? (
            <Table
              columns={columns}
              data={filteredData}
              renderActions={(row, i) => (
                <button
                  className="text-[var(--maroon)] cursor-pointer"
                  onClick={(e) => {
                    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
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
            <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full text-gray-500">
              <FolderX size={100} className="mb-4 opacity-70" />
              <p className="font-bold text-3xl">No Results Found</p>
            </div>
          )}
        </div>

        {openDropdownIndex !== null && dropdownPosition && (
          <DropdownMenu
            position={dropdownPosition}
            onCloseAction={() => setOpenDropdownIndex(null)}
            items={[
              filteredData[openDropdownIndex].isCommittee
                ? {
                    label: "Remove from Committee",
                    color: "text-[var(--black)]",
                    onClickAction: () => {
                      handleRemove(filteredData[openDropdownIndex].keyId);
                      setOpenDropdownIndex(null);
                    },
                  }
                : {
                    label: "Add as Committee",
                    color: "text-[var(--black)]",
                    onClickAction: () => {
                      handlePromote(filteredData[openDropdownIndex].keyId);
                      setOpenDropdownIndex(null);
                    },
                  },
            ]}
          />
        )}
      </div>
    </Section>
  );
}
