"use client";

import React from "react";
import clsx from "clsx";

type SelectOption = {
  value: string | number;
  label: string;
};

type SelectProps = {
  label?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  className?: string;
  required?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
};

export default function Select({
  label,
  value,
  onChange,
  options,
  className,
  required,
  disabled,
  style,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1" style={style}>
      {label && <label className="font-medium">{label}</label>}

      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={clsx(
          "border p-2 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white",
          className
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}



