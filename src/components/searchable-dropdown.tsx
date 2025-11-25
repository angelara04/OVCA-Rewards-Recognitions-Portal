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
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  onSelect,
  label,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); 

  // Filter options based on input value
  const filteredOptions = useMemo(() => {
    const searchableOptions = options.slice(1);
    
    // Show all options if value is empty
    if (!value) return searchableOptions;
    
    return searchableOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(value.toLowerCase())
    );
  }, [value, options]);


  // Implement Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the click is outside the component (and the ref exists)
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleItemSelect = (selectedLabel: string) => {
    onSelect(selectedLabel);
    onChange(selectedLabel);
    setIsOpen(false);
  };
  
  // Open dropdown on focus
  const handleFocus = () => {
    setIsOpen(true);
  };
  
  // Handle text input change
  const handleChange = (v: string) => {
    onChange(v);
    if (!isOpen) {
        setIsOpen(true);
    }
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
        onFocus={handleFocus}
        onBlur={() => {}} // Click-outside logic handles closing
      />
      
      {(isOpen && (value || filteredOptions.length > 0)) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-[var(--outline-grey)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.label}
                className="p-3 text-sm cursor-pointer hover:bg-[var(--light-grey)] truncate"
                // Use onMouseDown to trigger before the input loses focus
                onMouseDown={() => handleItemSelect(option.label)} 
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-3 text-sm text-[var(--dark-grey)]">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;