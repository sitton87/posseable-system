"use client";

import React from "react";
import clsx from "clsx";

export default function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "bg-white rounded-xl shadow p-4 border border-gray-200",
        className
      )}
    >
      {children}
    </div>
  );
}
