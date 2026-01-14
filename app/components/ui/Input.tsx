"use client";

import React from "react";
import clsx from "clsx";
import { tw } from "@/app/styles/design-system";

type InputProps = {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  centered?: boolean;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  name?: string;
  id?: string;
};

export default function Input({
  label,
  value,
  onChange,
  type = "text",
  className,
  centered = false,
  placeholder,
  disabled = false,
  required = false,
  error,
  name,
  id,
}: InputProps) {
  const inputId = id || name;
  
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label 
          htmlFor={inputId}
          className={clsx(
            "font-medium text-ds-text-secondary text-sm",
            required && "after:content-['*'] after:text-ds-danger after:mr-1"
          )}
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={clsx(
          // Base styles
          "border p-2 rounded-ds-input shadow-ds-xs outline-none",
          "bg-ds-bg-primary text-ds-text-primary",
          "border-ds-border",
          // Focus styles
          "focus:ring-2 focus:ring-ds-brand focus:border-ds-border-focus",
          // Transitions
          "transition-all duration-fast",
          // Centered text
          centered && "text-center",
          // Disabled state
          disabled && "bg-ds-bg-secondary text-ds-text-muted cursor-not-allowed opacity-60",
          // Error state
          error && "border-ds-danger focus:ring-ds-danger",
          // Custom classes
          className
        )}
      />
      
      {error && (
        <span className="text-ds-danger text-xs mt-0.5">{error}</span>
      )}
    </div>
  );
}

// Named export for consistency
export { Input };
