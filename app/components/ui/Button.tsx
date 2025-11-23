"use client";

import React from "react";
import clsx from "clsx";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
};

export default function Button({
  children,
  onClick,
  className,
  disabled,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "px-4 py-2 rounded-md text-white font-semibold transition bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400",
        className
      )}
    >
      {children}
    </button>
  );
}
