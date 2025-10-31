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
    <div className="w-full flex justify-center bg-[var(--white)]">
      <div className="flex w-full max-w-6xl relative">
        {tabs.map((tab) => {
          const isActive = activeKey === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChangeAction(tab.key)}
              className={clsx(
                "flex-1 text-center py-4 text-[19px] rounded-t-xl relative font-bold transition-all duration-150 ease-out",
                isActive
                  ? "bg-[var(--white)] text-[var(--maroon)] border border-[var(--outline-grey)] border-b-0 z-10"
                  : "bg-[var(--white)] text-[var(--black)] hover:text-[var(--maroon)]"
              )}
              style={{
                borderBottom: isActive ? "none" : "2px solid var(--outline-grey)",
              }}
            >
              {tab.label}
              <span
                className={clsx(
                  "ml-1 text-[19px] transition-colors duration-150 ease-out font-bold",
                  isActive ? "text-[var(--maroon)]" : "text-[var(--black)]"
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
