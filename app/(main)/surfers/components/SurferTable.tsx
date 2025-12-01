"use client";

import { formatPhoneNumber } from "@/lib/utils/format";

export default function SurferTable({ surfers }: { surfers: any[] }) {
  return (
    <table className="w-full border-collapse mt-4 bg-white shadow rounded">
      <thead className="bg-gray-100 border-b">
        <tr>
          <th className="p-3 text-center">ת"ז</th>
          <th className="p-3 text-center">שם מלא</th>
          <th className="p-3 text-center">טלפון</th>
          <th className="p-3 text-center">אימייל</th>
        </tr>
      </thead>

      <tbody>
        {surfers.map((s) => (
          <tr key={s.national_id} className="border-b hover:bg-gray-50">
            <td className="p-3">{s.national_id}</td>
            <td className="p-3">{s.full_name}</td>
            <td className="p-3 text-center">
              {formatPhoneNumber(s.phone)}
            </td>
            <td className="p-3">{s.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
