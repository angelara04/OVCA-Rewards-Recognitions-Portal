interface InputFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  value?: string; // new controlled value
  onChange?: (value: string) => void; // callback when input changes
  width?: string;
  height?: string;
  type?: string;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
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
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-[8px]">
      <label htmlFor={id} className="text-[var(--black)] font-[15px]">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={`${width} px-4 py-2 border border-[var(--outline-grey)] rounded-md bg-white ${height} focus:outline-0`}
      />
    </div>
  );
}
