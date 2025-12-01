"use client";
import React, { useMemo, useState, useEffect } from "react";
import Section from "@/components/section";

import Button from "@/components/button";
import Table, { Column } from "@/components/table/committee-table";
import { MoreHorizontal, FolderX } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import DropdownMenu from "@/components/dropdown-menu";
import { getMyNominations, deleteNomination } from "../action";
import AlertBanner from "@/components/alertBanner";
import ConfirmModal from "@/components/confirm-modal";

export default function MyNominationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // fetched nominations from server
  const [nominations, setNominations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [banner, setBanner] = useState<{
    title?: string;
    message?: string;
    variant?: "error" | "warning" | "success";
    duration?: number;
  } | null>(null);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await getMyNominations();

        const mapped = (data || []).map((n: any) => ({
          // map backend nomination fields to the table-friendly shape
          id: n.id,
          nomineename: n.nominee_name ?? "",
          category: n.category ?? "",
          datesubmitted: n.created_at
            ? new Date(n.created_at).toLocaleDateString()
            : "",
          status:
            n.status === "completed"
              ? "Completed"
              : n.status === "in_progress"
              ? "In Progress"
              : n.status || "",
        }));

        if (mounted) setNominations(mapped);
      } catch (err) {
        console.error("Failed to load nominations:", err);
        if (mounted) setNominations([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function reload() {
    setLoading(true);
    try {
      const data = await getMyNominations();
      const mapped = (data || []).map((n: any) => ({
        id: n.id,
        nomineename: n.nominee_name ?? "",
        category: n.category ?? "",
        datesubmitted: n.created_at
          ? new Date(n.created_at).toLocaleDateString()
          : "",
        status:
          n.status === "completed"
            ? "Completed"
            : n.status === "in_progress"
            ? "In Progress"
            : n.status || "",
      }));
      setNominations(mapped);
    } catch (err) {
      console.error("Failed to reload nominations:", err);
      setNominations([]);
    } finally {
      setLoading(false);
    }
  }

  function promptDelete(id: string | null) {
    if (!id) return;
    setPendingDeleteId(id);
    setBanner({
      title: "Confirm Deletion",
      message: "Do you want to delete this nomination? This cannot be undone.",
      variant: "warning",
      duration: 600000,
    });
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    setLoading(true);
    try {
      const res = await deleteNomination(pendingDeleteId);
      if (res?.success) {
        setBanner({
          title: "Deleted",
          message: "Draft deleted.",
          variant: "success",
          duration: 4000,
        });
        await reload();
      } else {
        setBanner({
          title: "Delete Failed",
          message: res?.message || "Delete failed",
          variant: "error",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error(err);
      setBanner({
        title: "Delete Failed",
        message: "Delete failed",
        variant: "error",
        duration: 4000,
      });
    } finally {
      setPendingDeleteId(null);
      setLoading(false);
    }
  }

  function cancelDelete() {
    setPendingDeleteId(null);
    setBanner(null);
  }

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return nominations;
    return nominations.filter((item) =>
      Object.values(item).join(" ").toLowerCase().includes(q)
    );
  }, [searchQuery, nominations]);

  const hasResults = filteredData.length > 0 && !loading;

  // Table columns - adapted for My Nominations (hide Nominee ID if not needed)
  const columns: Column[] = [
    { key: "nomineename", label: "Nominee Name" },
    { key: "category", label: "Category" },
    { key: "datesubmitted", label: "Date Submitted" },
    { key: "status", label: "Status" },
  ];

  function openActionsDropdown(e: React.MouseEvent, index: number) {
    const button = e.currentTarget as HTMLElement;

    // prefer the closest table container (same behavior as dashboard/review pages)
    const tableContainer =
      (button.closest(".table-container") as HTMLElement | null) ??
      (document.querySelector(".table-container") as HTMLElement | null);

    // fallback to content-area if table container not found
    const fallbackContainer =
      (button.closest(".content-area") as HTMLElement | null) ??
      (document.querySelector(".content-area") as HTMLElement | null);

    const container = tableContainer || fallbackContainer;
    const buttonRect = button.getBoundingClientRect();

    if (!container) {
      // viewport fallback
      setDropdownPosition({
        top: buttonRect.bottom + 4,
        left: buttonRect.left - 90,
      });
      setOpenDropdownIndex((prev) => (prev === index ? null : index));
      return;
    }

    const containerRect = container.getBoundingClientRect();
    setDropdownPosition({
      top: buttonRect.bottom - containerRect.top + 4,
      left: buttonRect.left - containerRect.left - 70,
    });
    setOpenDropdownIndex((prev) => (prev === index ? null : index));
  }

  const dropdownItems = useMemo(() => {
    if (openDropdownIndex === null) return [];
    const item = filteredData[openDropdownIndex];
    if (!item) return [];

    const nid = item?.id || item?.nomination_id || item?.nomineeid;
    if (item.status === "Completed") {
      return [
        {
          label: "View",
          color: "text-black",
          onClickAction: () => {
            // open in view-only mode
            if (nid) window.location.href = `/nominators/nomination-forms?nomination_id=${nid}&view=1`;
            setOpenDropdownIndex(null);
          },
        },
      ];
    }

    if (item.status === "In Progress") {
      return [
        {
          label: "Continue",
          color: "text-black",
          onClickAction: () => {
            // editable mode
            if (nid) window.location.href = `/nominators/nomination-forms?nomination_id=${nid}`;
            setOpenDropdownIndex(null);
          },
        },
        {
          label: "Delete",
          color: "text-red-600",
          onClickAction: () => {
            setPendingDeleteId(
              item?.id || item?.nomination_id || item?.nomineeid || null
            );
            setBanner({
              title: "Confirm Deletion",
              message:
                "Do you want to delete this nomination? This cannot be undone.",
              variant: "warning",
              duration: 600000,
            });
            setOpenDropdownIndex(null);
          },
        },
      ];
    }

  // fallback
  return [
    {
      label: "Continue",
      color: "text-black",
      onClickAction: () => {
        if (nid) window.location.href = `/nominators/nomination-forms?nomination_id=${nid}`;
        setOpenDropdownIndex(null);
      },
    },
  ];
}, [openDropdownIndex, filteredData]);


  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--black)]">
            My Nominations
          </h1>
          <p className="text-base text-[var(--dark-grey)]">
            View and manage all your nominations.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() =>
            (window.location.href = "/nominators/nomination-forms")
          }
        >
          <div className="px-5 py-1">New Nomination</div>
        </Button>
      </div>

      {/* Confirmation modal (warning) or banner (success/error) */}
      {pendingDeleteId && (
        <ConfirmModal
          action="delete"
          onCancelAction={cancelDelete}
          onConfirmAction={confirmDelete}
        />
      )}

      {banner && (!pendingDeleteId || banner.variant !== "warning") && (
        <div className="max-w-6xl mx-auto mb-4">
          <AlertBanner
            title={banner.title}
            message={banner.message}
            variant={banner.variant as any}
            duration={banner.duration}
            onClose={() => {
              setBanner(null);
              setPendingDeleteId(null);
            }}
          />
        </div>
      )}

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={(val: string) => setSearchQuery(val)}
        placeholder="Search by nominee name"
      />

      {/* Table */}
      <div className="table-container mt-4 border border-[var(--outline-grey)] rounded-md bg-[var(--white)] min-h-[60vh] flex flex-col w-full relative justify-center">
        {loading ? (
          <div className="flex items-center justify-center p-4 flex-col gap-2">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-4 border-t-[var(--maroon)] rounded-full animate-spin"></div>
            <span className="text-[var(--dark-grey)]">Loading...</span>
          </div>
        ) : hasResults ? (
          <div className="w-full overflow-auto">
            <Table
              columns={columns}
              data={filteredData}
              renderActions={(_row, i) => {
                const row = filteredData[i];
                const isInteractive =
                  row.status === "In Progress" || row.status === "Completed";
                const iconColor = isInteractive
                  ? "text-[var(--maroon)]"
                  : "text-[var(--outline-grey)]";
                const cursor = isInteractive
                  ? "cursor-pointer"
                  : "cursor-not-allowed";

                return (
                  <button
                    disabled={!isInteractive}
                    className={`${iconColor} ${cursor}`}
                    onClick={(e) => {
                      if (!isInteractive) return;
                      openActionsDropdown(e, i);
                    }}
                    aria-label="Actions"
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
                  items={dropdownItems}
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
  );
}
