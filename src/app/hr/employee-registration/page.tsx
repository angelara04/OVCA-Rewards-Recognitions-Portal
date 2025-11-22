// employee-registration (updated)
'use client';
import React, { useEffect, useMemo, useState } from "react";
import { FolderX, MoreHorizontal } from "lucide-react";
import TabsLift from "@/components/tabs-lift";
import Button from "@/components/button";
import { SearchBar } from "@/components/search-bar";
import Table, { Column } from "@/components/table/hr-registration-table";
import DropdownMenu from "@/components/dropdown-menu";
import ConfirmModal from "@/components/confirm-modal";
import Section from "@/components/section";
import {
  getPendingRegistrations,
  getApprovedRegistrations,
  getDeniedRegistrations,
  approveRegistration,
  denyRegistration,
  deleteRejectedUser,
  promoteUserRole,
  removeUserRole,
} from "./actions";

type TabKey = "all" | "pending" | "approved" | "rejected";

interface Employee {
  id: string; // registry id
  user_id?: string; 
  name: string;
  role?: string;
  department?: string;
  email?: string;
  status?: TabKey;
  dateRegistered?: string;
  form_data?: any;
  updated_at?: string;
  denied_at?: string;
}
// Main Page Component
export default function Page() {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [modalData, setModalData] = useState<{ action: "approve" | "reject" | "delete"; name: string; id: string } | null>(null);

  const [pending, setPending] = useState<Employee[]>([]);
  const [approved, setApproved] = useState<Employee[]>([]);
  const [rejected, setRejected] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all registration data
  async function loadAll() {
    setLoading(true);
    const [pendingData, approvedData, deniedData] = await Promise.all([
      getPendingRegistrations(),
      getApprovedRegistrations(),
      getDeniedRegistrations(),
    ]);
    // map incoming rows to Employee model (normalize statuses for UI)
    setPending((pendingData ?? []).map((r: any) => ({ ...r, status: "pending", dateRegistered: new Date(r.created_at).toLocaleDateString("en-PH") })));
    setApproved((approvedData ?? []).map((r: any) => ({ ...r, status: "approved", dateRegistered: r.updated_at ? new Date(r.updated_at).toLocaleDateString("en-PH") : undefined })));
    // server uses 'denied' status; map to UI 'rejected'
    setRejected((deniedData ?? []).map((r: any) => ({ ...r, status: "rejected", dateRegistered: r.denied_at ? new Date(r.denied_at).toLocaleDateString("en-PH") : undefined })));
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = useMemo(() => {
    // combine for "all"
    return [...approved, ...pending, ...rejected];
  }, [approved, pending, rejected]);

  // counts for tabs
  const counts = useMemo(() => ({
    all: data.length,
    pending: pending.length,
    approved: approved.length,
    rejected: rejected.length,
  }), [data, pending, approved, rejected]);

  const tabs = [
    { key: "all" as TabKey, label: "All", count: counts.all },
    { key: "pending" as TabKey, label: "Pending", count: counts.pending },
    { key: "approved" as TabKey, label: "Approved", count: counts.approved },
    { key: "rejected" as TabKey, label: "Rejected", count: counts.rejected },
  ];

  // Filtered data based on active tab and search query
  const filteredData = useMemo(() => {
    const base = activeTab === "all" ? data : data.filter((d) => d.status === activeTab);
    if (!searchQuery.trim()) return base;
    return base.filter((d) =>
      Object.values(d).some((val) =>
        String(val ?? '').toLowerCase().includes(searchQuery.toLowerCase())
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

  // Handlers for approve, deny, delete actions
  async function handleApprove(id: string) {
    const res = await approveRegistration(id);
    if ((res as any)?.ok === false) {
      alert('Approve failed')
    } else {
      await loadAll();
      setOpenDropdownIndex(null);
    }
  }

  // Deny registration
  async function handleDeny(id: string) {
    const res = await denyRegistration(id);
    if ((res as any)?.ok === false) {
      alert('Deny failed')
    } else {
      await loadAll();
      setOpenDropdownIndex(null);
    }
  }

  // Delete rejected user
  async function handleDelete(id: string) {
    const res = await deleteRejectedUser(id);
    if ((res as any)?.ok === false) {
      alert('Delete failed: ' + ((res as any).message || 'unknown'))
    } else {
      await loadAll();
      setOpenDropdownIndex(null);
    }
  }

  // Render
  return (
    // Employee Registration Page
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">Employee Registration</h1>
          <p className="text-base text-[var(--dark-grey)]">Review and verify employee registrations for nomination eligibility</p>
        </div>
        <Button size="sm" variant="secondary"><div className="px-5 py-1">Back to Dashboard</div></Button>
      </div>

      <div className="w-full max-w-6xl">
        <TabsLift tabs={tabs} activeKey={activeTab} onChangeAction={(key: TabKey) => setActiveTab(key)} />
      </div>

      <div className="max-w-6xl w-full bg-[var(--white)] border border-[var(--outline-grey)] border-t-0 rounded-b-xl shadow-sm px-6 py-6 min-h-[75vh] flex flex-col relative content-area -mt-[8px]">
        <SearchBar value={searchQuery} onChange={(val: string) => setSearchQuery(val)} placeholder="Search by name, department, or email" />

        <div className="mt-4 border border-[var(--outline-grey)] rounded-md bg-[var(--white)] min-h-[60vh] flex flex-col w-full relative">
          {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
            <div className="w-10 h-10 border-4 border-[var(--maroon)] border-t-transparent rounded-full animate-spin" />
            <p className="text-[var(--dark-grey)] text-sm font-medium">Loading...</p>
          </div>
        ) : hasResults ? (

            <div className="w-full overflow-auto">
              <Table
                columns={columns}
                data={filteredData}
                renderActions={(row, i) => {
                  const employee = filteredData[i] as Employee;
                  const isPending = employee.status === "pending";
                  const isRejected = employee.status === "rejected";
                  const isApproved = employee.status === "approved";
                  const isClickable = isPending || isRejected; // only pending & rejected allow actions
                  // style: pending -> maroon active; rejected -> maroon (delete); approved -> grey disabled
                  const iconColor = isPending || isRejected ? "text-[var(--maroon)]" : "text-[var(--outline-grey)]";
                  const cursor = isClickable ? "cursor-pointer" : "cursor-not-allowed";

                  return (
                    <button
                    disabled={!isClickable}
                    className={`${iconColor} ${cursor} hover:text-[var(--hover-maroon)] transition-colors duration-150`}
                    onClick={(e) => {
                      if (!isClickable) return;
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

        {typeof window !== "undefined" && openDropdownIndex !== null && dropdownPosition && ( // ensure client-side and position exists
          (() => {
            const current = filteredData[openDropdownIndex!];
            if (!current) return null;

            // Build menu items depending on the row's status
            const items: Array<{ label: string; color?: string; onClickAction: () => void }> = [];

            if (current.status === "pending") {
              items.push({
                label: "Approve",
                color: "text-[var(--forest-green)]",
                onClickAction: () => {
                  const id = current.id;
                  setModalData({ action: 'approve', name: current.name, id });
                }
              });
              items.push({
                label: "Reject",
                color: "text-[var(--maroon)]",
                onClickAction: () => {
                  const id = current.id;
                  setModalData({ action: 'reject', name: current.name, id });
                }
              });
            } else if (current.status === "rejected") {
              // delete only allowed for rejected rows
              items.push({
                label: "Delete",
                color: "text-[var(--maroon)]",
                onClickAction: () => {
                  const id = current.id;
                  setModalData({ action: 'delete', name: current.name, id });
                }
              });
            } else {
              // approved: no items (shouldn't open because button is disabled)
              return null;
            }

            return (
              <DropdownMenu
                position={dropdownPosition}
                onCloseAction={() => setOpenDropdownIndex(null)}
                items={items}
              />
            );
          })()
        )}

        {modalData && ( // show confirm modal
          <ConfirmModal
            action={modalData.action === 'approve' ? 'approve' : modalData.action === 'reject' ? 'reject' : 'delete'}
            onCancelAction={() => setModalData(null)}
            onConfirmAction={async () => {
            const { action, id } = modalData;

            // ✅ Close the modal immediately
            setModalData(null);
            setOpenDropdownIndex(null);

            // Continue background action
            if (action === 'approve') {
              await handleApprove(id);
            } else if (action === 'reject') {
              await handleDeny(id);
            } else if (action === 'delete') {
              await handleDelete(id);
            }
          }}

          />
        )}
      </div>
    </Section>
  );
}
