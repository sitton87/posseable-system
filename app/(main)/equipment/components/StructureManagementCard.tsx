"use client";

import { Button, Card } from "@/app/components/ui";
import { tableCellStyle, tableHeaderStyle, tableStyle } from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";

type StructureSummary = {
  code: string;
  name: string;
  itemCount: number;
  family_code?: string;
};

type StructureManagementCardProps = {
  families: StructureSummary[];
  categories: StructureSummary[];
  onCreateFamily: () => void;
  onCreateCategory: () => void;
};

export function StructureManagementCard({
  families,
  categories,
  onCreateFamily,
  onCreateCategory,
}: StructureManagementCardProps) {
  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>ניהול משפחות וקטגוריות</h3>
          <p style={{ margin: 0, color: colors.textMuted, fontSize: 13 }}>
            לא ניתן למחוק או לעדכן מבנים אליהם מקושרים פריטים פעילים
          </p>
        </div>
        <div style={{ display: "flex", gap: spacing.sm }}>
          <Button variant="secondary" onClick={onCreateFamily}>
            משפחה חדשה
          </Button>
          <Button onClick={onCreateCategory}>קטגוריה חדשה</Button>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: spacing.md,
        }}
      >
        <div>
          <h4 style={{ margin: "0 0 8px 0" }}>משפחות קיימות</h4>
          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: spacing.sm,
              maxHeight: 260,
              overflowY: "auto",
            }}
          >
            <table style={{ ...tableStyle }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>קוד</th>
                  <th style={tableHeaderStyle}>שם</th>
                  <th style={tableHeaderStyle}>פריטים</th>
                </tr>
              </thead>
              <tbody>
                {families.map((family) => (
                  <tr key={family.code}>
                    <td style={tableCellStyle}>{family.code}</td>
                    <td style={tableCellStyle}>{family.name}</td>
                    <td style={tableCellStyle}>{family.itemCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h4 style={{ margin: "0 0 8px 0" }}>קטגוריות קיימות</h4>
          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: spacing.sm,
              maxHeight: 260,
              overflowY: "auto",
            }}
          >
            <table style={{ ...tableStyle }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>משפחה</th>
                  <th style={tableHeaderStyle}>קוד</th>
                  <th style={tableHeaderStyle}>שם</th>
                  <th style={tableHeaderStyle}>פריטים</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={`${category.family_code}-${category.code}`}>
                    <td style={tableCellStyle}>{category.family_code}</td>
                    <td style={tableCellStyle}>{category.code}</td>
                    <td style={tableCellStyle}>{category.name}</td>
                    <td style={tableCellStyle}>{category.itemCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}



