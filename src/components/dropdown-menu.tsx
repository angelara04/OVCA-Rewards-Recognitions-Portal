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
  maxWidth?: string; // optional max width
  fontSize?: string; // optional font size
}

export default function DropdownMenu({
  items,
  position,
  onCloseAction,
  maxWidth = "24rem", // default max width
  fontSize = "text-sm", // default font size
}: DropdownMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCloseAction();
      }
    };

    // This catches: mouse wheel, trackpad, scrollbars, keyboard scrolls
    const handleScroll = () => {
      onCloseAction();
    };

    // Mouse wheel (fires even if scroll doesn’t happen)
    const handleWheel = () => {
      onCloseAction();
    };

    // Touch scrolling (mobile)
    const handleTouchMove = () => {
      onCloseAction();
    };

    // Keyboard scroll keys
    const handleKeyDown = (e: KeyboardEvent) => {
      const keysThatScroll = [
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

      if (keysThatScroll.includes(e.key)) {
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
      className={`absolute left-0 top-0 bg-white border border-gray-200 rounded-md shadow-md z-50 inline-block max-w-[${maxWidth}]`}
      style={{ top: position.top, left: position.left }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          className={`block px-4 py-2 text-left hover:bg-gray-50 whitespace-nowrap overflow-hidden overflow-ellipsis ${
            item.color || "text-gray-700"
          } ${fontSize}`}
          onClick={item.onClickAction}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
