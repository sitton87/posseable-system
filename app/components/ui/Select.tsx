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
  placeholder?: string;
  error?: string;
  name?: string;
  id?: string;
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
  placeholder,
  error,
  name,
  id,
}: SelectProps) {
  const selectId = id || name;

  return (
    <div className="flex flex-col gap-1" style={style}>
      {label && (
        <label
          htmlFor={selectId}
          className={clsx(
            "font-medium text-ds-text-secondary text-sm",
            required && "after:content-['*'] after:text-ds-danger after:mr-1"
          )}
        >
          {label}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={clsx(
          // Base styles
          "border p-2 rounded-ds-input shadow-ds-xs outline-none",
          "bg-ds-bg-primary text-ds-text-primary",
          "border-ds-border",
          // Focus styles
          "focus:ring-2 focus:ring-ds-brand focus:border-ds-border-focus",
          // Transitions
          "transition-all duration-fast",
          // Disabled state
          disabled && "bg-ds-bg-secondary text-ds-text-muted cursor-not-allowed opacity-60",
          // Error state
          error && "border-ds-danger focus:ring-ds-danger",
          // Custom classes
          className
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <span className="text-ds-danger text-xs mt-0.5">{error}</span>
      )}
    </div>
  );
}

// Named export for consistency
export { Select };
