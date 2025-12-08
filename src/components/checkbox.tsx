import React from "react";

interface Option {
  label: string;
  name: string;
  onChange: (value: string, checked: boolean) => void;
  options: { label: string; value: string }[];
  values: string[];
  disabled?: boolean; // ⬅ added
}

export default function CheckboxGroup({
  label,
  name,
  options,
  onChange,
  values,
  disabled = false, // ⬅ default false
}: Option) {
  return (
    <div className="flex flex-col">
      <span className="mb-2 text-[15px]">{label}</span>

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
              disabled={disabled} // ⬅ now supports disabled
              className={`appearance-auto w-4 h-4 border-1 border-[var(--outline-grey)] rounded-none bg-[var(--white)] 
                ${
                  disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
            />

            <label
              htmlFor={`${name}-${index}`}
              className={`text-[15px] ${disabled ? "opacity-50" : ""}`}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
