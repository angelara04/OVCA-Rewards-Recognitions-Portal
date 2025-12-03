// components/dropdown-menu.tsx
"use client";
import React, { useRef, useEffect } from "react";

interface DropdownItem {
  label: string;
  value?: string; // optional value for controlled selection
  color?: string;
  onClickAction?: () => void;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  position: { top: number; left: number };
  onCloseAction: () => void;
  maxWidth?: string; // optional max width
  fontSize?: string; // optional font size
  selectedValue?: string | null; // controls which item is selected (optional)
  onSelect?: (value?: string) => void; // optional generic select handler
  showCheck?: boolean; // whether to show a checkmark for selected item
}

export default function DropdownMenu({
  items,
  position,
  onCloseAction,
  maxWidth = "24rem", // default max width
  fontSize = "text-sm", // default font size
  selectedValue = null,
  onSelect,
  showCheck = true,
}: DropdownMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCloseAction();
      }
    };

    const handleScroll = () => {
      onCloseAction();
    };

    const handleWheel = () => {
      onCloseAction();
    };

    const handleTouchMove = () => {
      onCloseAction();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const keysThatClose = [
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ];

      if (keysThatClose.includes(e.key)) {
        onCloseAction();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCloseAction]);

  return (
    <div
      ref={ref}
      className={`absolute left-0 top-0 bg-white border border-gray-200 rounded-md shadow-md z-50 inline-block`}
      style={{
        top: position.top,
        left: position.left,
        maxWidth: maxWidth,
      }}
      role="menu"
      aria-orientation="vertical"
    >
      {items.map((item, index) => {
        const isSelected = selectedValue !== null && item.value === selectedValue;
        return (
          <button
            key={index}
            role="menuitem"
            aria-checked={isSelected}
            className={`flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 whitespace-nowrap overflow-hidden overflow-ellipsis ${
              item.color || "text-gray-700"
            } ${fontSize}`}
            onClick={() => {
              // 1) Prefer onSelect (generic)
              if (onSelect) {
                onSelect(item.value);
              }
              // 2) Then run the specific click action if provided
              if (item.onClickAction) {
                try {
                  item.onClickAction();
                } catch (e) {
                  // swallow any errors from consumer action to avoid leaving menu stuck open
                  // consumer actions should handle their own errors
                }
              }
              // 3) close the menu
              onCloseAction();
            }}
          >
            <span className="truncate">{item.label}</span>
            {showCheck && isSelected ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-3"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
