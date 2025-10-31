"use client";
import React, { useRef, useEffect } from "react";

interface DropdownItem {
  label: string;
  color?: string;
  onClickAction: () => void;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  position: { top: number; left: number };
  onCloseAction: () => void;
}

export default function DropdownMenu({ items, position, onCloseAction }: DropdownMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCloseAction();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCloseAction]);

  return (
    <div
      ref={ref}
      className="absolute bg-white border border-gray-200 rounded-md shadow-md text-sm z-50"
      style={{ top: position.top, left: position.left }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          className={`block w-full text-left px-4 py-2 hover:bg-gray-50 ${item.color || "text-gray-700"}`}
          onClick={item.onClickAction}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
