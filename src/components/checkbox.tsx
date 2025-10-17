import React from "react";

interface Option {
  label: string;
  name: string;
  onChange: (value: string, checked: boolean) => void;
  options: { label: string; value: string }[];
  values: string[];
}

export default function CheckboxGroup({
  label,
  name,
  options,
  onChange,
  values,
}: Option) {
  return (
    <div className="flex flex-col">
      {/* Label */}
      <span className="mb-2 text-[15px]">{label}</span>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <div key={index} className="flex flex-row gap-2 items-center">
            <input
              type="checkbox"
              id={`${name}-${index}`}
              name={name}
              value={option.value}
              checked={values.includes(option.value)}
              onChange={(e) => onChange(e.target.value, e.target.checked)}
              className="appearance-auto w-4 h-4 border-1 border-[var(--outline-grey)] rounded-none bg-[var(--white)] checked:bg-[var(--grey)]"
            />
            <label htmlFor={`${name}-${index}`} className="text-[15px]">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
