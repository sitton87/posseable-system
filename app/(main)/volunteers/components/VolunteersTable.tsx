"use client";

import React from "react";
import { formatPhoneNumber } from "@/lib/utils/format";
import { tw } from "@/app/styles/design-system";

export default function VolunteersTable({ volunteers }: { volunteers: any[] }) {
  return (
    <table className={tw.table.base}>
      <thead className={tw.table.head}>
        <tr>
          <th className={tw.table.th}>ת״ז</th>
          <th className={tw.table.th}>שם מלא</th>
          <th className={tw.table.th}>טלפון</th>
          <th className={tw.table.th}>אימייל</th>
          <th className={tw.table.th}>סוג מתנדב</th>
          <th className={tw.table.th}>סטטוס</th>
        </tr>
      </thead>

      <tbody>
        {volunteers.map((v) => (
          <tr key={v.national_id} className={tw.table.tr}>
            <td className={tw.table.td}>{v.national_id}</td>
            <td className={tw.table.td}>{v.full_name}</td>
            <td className={`${tw.table.td} text-center`}>
              {formatPhoneNumber(v.phone)}
            </td>
            <td className={tw.table.td}>{v.email}</td>
            <td className={tw.table.td}>
              {v.kind === "Water" ? "⛵ מתנדב מים" : "📷 מתנדב מדיה"}
            </td>
            <td className={tw.table.td}>{v.active ? "פעיל" : "לא פעיל"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
