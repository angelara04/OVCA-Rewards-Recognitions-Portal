import React, { useState, useMemo, useRef, useEffect } from "react";
import Input from "@/components/input";

interface DropdownOption {
  label: string;
  href: string;
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (label: string) => void;
  label: string;
  placeholder: string;
  disabled?: boolean;
  
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  onSelect,
  label,
  placeholder,
  disabled = false,       
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options
  const filteredOptions = useMemo(() => {
    const searchableOptions = options.slice(1);

    if (!value) return searchableOptions;

    return searchableOptions.filter((option) =>
      option.label.toLowerCase().includes(value.toLowerCase())
    );
  }, [value, options]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemSelect = (selectedLabel: string) => {
    if (disabled) return;  
    onSelect(selectedLabel);
    onChange(selectedLabel);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (!disabled) setIsOpen(true); 
  };

  const handleChange = (v: string) => {
    if (disabled) return;
    onChange(v);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[15px] font-medium mb-0.5">{label}</label>

      <Input
        id={label.replace(/\s/g, "")}
        label=""
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        width="w-full"
        disabled={disabled}                   
        onFocus={handleFocus}
        onBlur={() => {}}
      />

      {(isOpen && !disabled && (value || filteredOptions.length > 0)) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-[var(--outline-grey)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.label}
                className="p-3 text-sm cursor-pointer hover:bg-[var(--light-grey)] truncate"
                onMouseDown={() => handleItemSelect(option.label)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-3 text-sm text-[var(--dark-grey)]">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;