"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { Category } from "../app/store/category";
interface Option {
  label: string;
  href: string;
}

interface Props {
  displayText: string; // default placeholder
  options: Option[];
}

export default function Dropdown({ displayText, options }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedCategory, setSelectedCategory } = Category();

  const toggleDropdown = () => setIsOpen(!isOpen);

  // if nothing has been selected yet, show displayText
  const displayValue =
    selectedCategory === "Select Category" ? displayText : selectedCategory;

  return (
    <div className="w-full h-auto">
      {/* Dropdown Header */}
      <div
        onClick={toggleDropdown}
        className="w-full px-4 py-2  outline-1 outline-[var(--outline-grey)] flex justify-between items-center cursor-pointer"
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

      {/* Dropdown Options */}
      <div
        className={clsx(
          "flex flex-col bg-[var(--light-grey)]  outline-1 outline-[var(--outline-grey)] transition-all duration-200",
          { hidden: !isOpen }
        )}
      >
        {options.map((option, index) => (
          <Link
            key={index}
            href={option.href}
            onClick={() => {
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
