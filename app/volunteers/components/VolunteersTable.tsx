"use client";

import React from "react";

export default function VolunteersTable({ volunteers }: { volunteers: any[] }) {
  return (
    <table className="w-full border-collapse mt-6 shadow-md">
      <thead>
        <tr className="bg-gray-100 border-b">
          <th className="p-3 text-right">ת״ז</th>
          <th className="p-3 text-right">שם מלא</th>
          <th className="p-3 text-right">טלפון</th>
          <th className="p-3 text-right">אימייל</th>
          <th className="p-3 text-right">סוג מתנדב</th>
          <th className="p-3 text-right">סטטוס</th>
        </tr>
      </thead>

      <tbody>
        {volunteers.map((v) => (
          <tr key={v.national_id} className="border-b hover:bg-gray-50">
            <td className="p-3">{v.national_id}</td>
            <td className="p-3">{v.full_name}</td>
            <td className="p-3">{v.phone}</td>
            <td className="p-3">{v.email}</td>
            <td className="p-3">
              {v.kind === "Water" ? "⛵ מתנדב מים" : "📷 מתנדב מדיה"}
            </td>
            <td className="p-3">{v.active ? "פעיל" : "לא פעיל"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
