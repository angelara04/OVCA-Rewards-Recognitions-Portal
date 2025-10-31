"use client";
import React from "react";
import clsx from "clsx";

type TabKey = "all" | "pending" | "approved" | "rejected";

interface Tab {
  key: TabKey;
  label: string;
  count: number;
}

interface TabsLiftProps {
  tabs: Tab[];
  activeKey: TabKey;
  onChangeAction: (key: TabKey) => void;
}

export default function TabsLift({ tabs, activeKey, onChangeAction }: TabsLiftProps) {
  return (
    <div className="w-full bg-[#fafafa] flex justify-center">
      <div className="flex w-full max-w-6xl">
        {tabs.map((tab) => {
          const isActive = activeKey === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChangeAction(tab.key)}
              className={clsx(
                "flex-1 text-center py-4 text-[19px] font-semibold rounded-t-xl transition-all relative",
                isActive
                  ? "bg-white text-[#7b1020] shadow-[0_-1px_3px_rgba(0,0,0,0.05)] z-10"
                  : "bg-[#fafafa] text-[var(--black)] hover:text-[#7b1020]"
              )}
              style={{
                borderBottom: isActive ? "none" : "2px solid #e5e5e5",
              }}
            >
              {tab.label}
              <span
                className={clsx(
                  "ml-1 text-[19px] font-semibold",
                  isActive ? "text-[#7b1020]" : "text-gray-600"
                )}
              >
                ({tab.count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
