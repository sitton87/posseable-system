"use client";

import { formatPhoneNumber } from "@/lib/utils/format";
import { tw, cssVar } from "@/app/styles/design-system";

export default function SurferTable({ surfers }: { surfers: any[] }) {
  return (
    <table
      className="w-full border-collapse mt-4 rounded-ds-card-radius overflow-hidden"
      style={{
        background: cssVar.bg.primary,
        boxShadow: cssVar.shadow.sm,
      }}
    >
      <thead
        style={{
          background: cssVar.bg.secondary,
          borderBottom: `1px solid ${cssVar.border.primary}`,
        }}
      >
        <tr>
          <th className={`p-3 text-center ${tw.text.label}`}>ת"ז</th>
          <th className={`p-3 text-center ${tw.text.label}`}>שם מלא</th>
          <th className={`p-3 text-center ${tw.text.label}`}>טלפון</th>
          <th className={`p-3 text-center ${tw.text.label}`}>אימייל</th>
        </tr>
      </thead>

      <tbody>
        {surfers.map((s) => (
          <tr
            key={s.national_id}
            className="transition-colors"
            style={{
              borderBottom: `1px solid ${cssVar.border.primary}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = cssVar.bg.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <td className="p-3 text-center" style={{ color: cssVar.text.secondary }}>
              {s.national_id}
            </td>
            <td className="p-3 text-center font-medium" style={{ color: cssVar.text.primary }}>
              {s.full_name}
            </td>
            <td className="p-3 text-center" style={{ color: cssVar.text.secondary }}>
              {formatPhoneNumber(s.phone)}
            </td>
            <td className="p-3 text-center" style={{ color: cssVar.text.secondary }}>
              {s.email}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
