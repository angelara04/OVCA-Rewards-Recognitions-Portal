// TabsLift.tsx
"use client";
import React from "react";
import clsx from "clsx";

export interface Tab<T extends string> {
  key: T;
  label: string;
  count: number;
}

interface TabsLiftProps<T extends string> {
  tabs: Tab<T>[];
  activeKey: T;
  onChangeAction: (key: T) => void;
}

export default function TabsLift<T extends string>({
  tabs,
  activeKey,
  onChangeAction,
}: TabsLiftProps<T>) {
  return (
    <div className="w-full flex justify-center bg-[var(--white)] relative">
      <div className="absolute bottom-0 left-0 w-full border-b border-[var(--outline-grey)] z-0"></div>

      <div className="flex w-full max-w-6xl relative z-10">
        {tabs.map((tab) => {
          const isActive = activeKey === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChangeAction(tab.key)}
              className={clsx(
                "w-1/4 text-center py-4 text-[19px] font-bold transition-all duration-150 ease-out",
                isActive
                  ? "bg-[var(--white)] text-[var(--maroon)] border border-[var(--outline-grey)] border-b-0 z-20 rounded-t-xl"
                  : "bg-[var(--white)] text-[var(--black)] hover:text-[var(--maroon)] border-b-1 border-[var(--outline-grey)]"
              )}
            >
              {tab.label}
              <span
                className={clsx(
                  "ml-1 text-[19px] font-bold",
                  isActive ? "text-[var(--maroon)]" : "text-[var(--black)]"
                )}
              >
                ({tab.count})
              </span>
            </button>
          );
        })}

        {Array(4 - tabs.length).fill(null).map((_, i) => <div key={i} className="w-1/4"></div>)}
      </div>
    </div>
  );
}
