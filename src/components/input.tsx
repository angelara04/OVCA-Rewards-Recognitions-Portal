interface InputFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  width?: string;
  height?: string;
  type?: string;
  disabled?: boolean; 
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  name?: string;
}

export default function InputField({
  id,
  label,
  placeholder = "",
  value,
  onChange,
  width = "w-full",
  height = "h-[38px]",
  type = "text",
  disabled = false,
  name, // <--- 1. ADD THIS to the destructuring list
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-[8px]">
      <label htmlFor={id} className="text-[var(--black)] font-[15px]">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name || id} // <--- 2. UPDATE THIS (Use the prop, fallback to id)
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={`${width} px-4 py-2 border border-[var(--outline-grey)] rounded-md ${
          disabled ? 'bg-gray-100 cursor-not-allowed text-[var(--black)]' : 'bg-white'
        } ${height} focus:outline-0`}
        disabled={disabled} 
      />
    </div>
  );
}