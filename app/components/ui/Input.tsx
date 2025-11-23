"use client";

import React from "react";
import clsx from "clsx";

export default function Input({
  label,
  value,
  onChange,
  type = "text",
  className,
}: {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="font-medium">{label}</label>}

      <input
        type={type}
        value={value}
        onChange={onChange}
        className={clsx(
          "border p-2 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-400",
          className
        )}
      />
    </div>
  );
}
