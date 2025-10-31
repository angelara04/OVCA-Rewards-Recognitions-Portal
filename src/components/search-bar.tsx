"use client";
import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChangeAction: (val: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeAction, placeholder }: SearchBarProps) {
  return (
    <div className="mb-5">
      <div className="w-full bg-[#f4f4f4] border border-gray-200 rounded-md px-4 py-2 flex items-center">
        <Search size={18} className="text-gray-500 mr-3" />
        <input
          type="text"
          placeholder={placeholder || "Search..."}
          value={value}
          onChange={(e) => onChangeAction(e.target.value)}
          className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500"
        />
      </div>
    </div>
  );
}
