"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { Category } from "../app/store/category";

interface Option {
  label: string;
  href: string;
  onClick?: () => void;
}

interface Props {
  displayText: string;
  options: Option[];
  disabled?: boolean; // <- new
}

export default function Dropdown({ displayText, options, disabled = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedCategory, setSelectedCategory } = Category();

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((s) => !s);
  };

  const displayValue =
    selectedCategory === "Select Category" ? displayText : selectedCategory;

  return (
    <div className="relative w-full h-auto">
      {/* Header */}
      <div
        onClick={toggleDropdown}
        role="button"
        aria-disabled={disabled}
        className={clsx(
          "w-full px-4 py-2 outline outline-[var(--outline-grey)] flex justify-between items-center bg-white rounded-md",
          {
            "cursor-pointer": !disabled,
            "cursor-not-allowed opacity-80": disabled,
          }
        )}
      >
        <div
          className={clsx("text-[var(--dark-grey)]", {
            "text-black": displayValue !== "Select Category",
          })}
        >
          {displayValue}
        </div>
        <ChevronDown
          className={clsx("transition-transform", { "rotate-180": isOpen })}
        />
      </div>

      {/* Options */}
      <div
        className={clsx(
          "absolute left-0 w-full flex flex-col bg-[var(--light-grey)] outline-1 outline-[var(--outline-grey)] rounded-md mt-1 transition-all duration-200 z-50 shadow-md",
          { hidden: !isOpen || disabled }
        )}
      >
        {options.map((option, index) => (
          <Link
            key={index}
            href={option.href}
            onClick={(e) => {
              if (disabled) {
                e.preventDefault();
                return;
              }
              // run custom click if provided
              if (option.onClick) {
                e.preventDefault();
                option.onClick();
              }
              setSelectedCategory(option.label);
              setIsOpen(false);
            }}
            className="px-4 py-2 text-[var(--dark-grey)] border-b border-[var(--outline-grey)] last:border-0 hover:bg-[var(--grey)]"
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
