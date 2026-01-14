"use client";

import {
  Card,
  Title,
  Text,
  Button,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";

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
      <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
        <div>
          <Title>ניהול משפחות וקטגוריות</Title>
          <Text style={{ color: cssVar.text.muted }}>
            לא ניתן למחוק או לעדכן מבנים אליהם מקושרים פריטים פעילים
          </Text>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCreateFamily}>
            משפחה חדשה
          </Button>
          <Button onClick={onCreateCategory}>קטגוריה חדשה</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Text className="font-semibold mb-2">משפחות קיימות</Text>
          <div className="border rounded-lg max-h-64 overflow-y-auto" style={{ borderColor: cssVar.border.primary }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>קוד</TableHeaderCell>
                  <TableHeaderCell>שם</TableHeaderCell>
                  <TableHeaderCell>פריטים</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {families.map((family) => (
                  <TableRow key={family.code}>
                    <TableCell>{family.code}</TableCell>
                    <TableCell>{family.name}</TableCell>
                    <TableCell>{family.itemCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div>
          <Text className="font-semibold mb-2">קטגוריות קיימות</Text>
          <div className="border rounded-lg max-h-64 overflow-y-auto" style={{ borderColor: cssVar.border.primary }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>משפחה</TableHeaderCell>
                  <TableHeaderCell>קוד</TableHeaderCell>
                  <TableHeaderCell>שם</TableHeaderCell>
                  <TableHeaderCell>פריטים</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={`${category.family_code}-${category.code}`}>
                    <TableCell>{category.family_code}</TableCell>
                    <TableCell>{category.code}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.itemCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Card>
  );
}
