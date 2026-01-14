"use client";

import {
  Card,
  Title,
  Text,
  Button,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@tremor/react";
import { DraftList } from "@/app/components/shared";
import { cssVar, numericValues } from "@/app/styles/design-system";
import type { DraftEntry } from "@/app/hooks/useDraftManager";
import type {
  InventoryDocumentFormState,
  InventoryDocumentSummary,
} from "../types";
import { formatCurrency, formatDate } from "../utils";
import {
  PlusIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  EyeIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

type InventoryTabProps = {
  documents: InventoryDocumentSummary[];
  documentsLoading: boolean;
  canEdit: boolean;
  drafts?: DraftEntry<InventoryDocumentFormState>[];
  onResumeDraft?: (draftId: string) => void;
  onDeleteDraft?: (draftId: string) => void;
  onOpenDocumentModal: () => void;
  onViewDocument: (documentId: string) => void;
  onEditDocument: (documentId: string) => void;
  onRefreshDocuments: () => void;
  onGoToStructure: () => void;
};

const ACTION_LABELS: Record<string, string> = {
  RECEIPT: "קליטת ספק",
  DONATION: "תרומה נכנסת",
  DISPOSAL: "השמדה",
  TRANSFER: "העברה",
  STOCKTAKE_ADJUST: "התאמת מלאי",
};

export function InventoryTab({
  documents,
  documentsLoading,
  canEdit,
  drafts,
  onResumeDraft,
  onDeleteDraft,
  onOpenDocumentModal,
  onViewDocument,
  onEditDocument,
  onRefreshDocuments,
  onGoToStructure,
}: InventoryTabProps) {
  return (
    <>
      <Card>
        <div className="flex justify-between items-center flex-wrap gap-ds-spacing-2 mb-ds-spacing-4">
          <div>
            <Title>מסמכי מלאי</Title>
            <Text className="mt-1">
              יצירת תעודה חדשה ותיעוד כל תנועות המלאי
            </Text>
          </div>
          <div className="flex gap-ds-spacing-2 flex-wrap">
            <Button variant="secondary" icon={ArrowPathIcon} onClick={onRefreshDocuments}>
              רענן נתונים
            </Button>
            <Button variant="secondary" icon={Cog6ToothIcon} onClick={onGoToStructure}>
              הגדרות מחסנים
            </Button>
            <Button icon={PlusIcon} onClick={onOpenDocumentModal} disabled={!canEdit}>
              תעודת מלאי חדשה
            </Button>
          </div>
        </div>

        {drafts && drafts.length > 0 && (
          <div className="mb-ds-spacing-5">
            <DraftList
              drafts={drafts}
              title={`טיוטות תעודות (${drafts.length})`}
              description="טיוטות אלו זמינות רק לך עד להשלמה רשמית."
              onResume={onResumeDraft}
              onDelete={onDeleteDraft}
              disableResume={!canEdit}
              getTitle={(draft) =>
                ACTION_LABELS[draft.payload.action_type] ||
                draft.payload.action_type
              }
              getSubtitle={(draft) =>
                `עודכן ${new Date(draft.updatedAt).toLocaleString("he-IL")}`
              }
            />
          </div>
        )}

        <div>
          <Text className="font-semibold mb-2">תעודות אחרונות</Text>
          {documentsLoading ? (
            <div className="p-ds-spacing-4 text-center" style={{ color: cssVar.text.muted }}>
              טוען נתונים...
            </div>
          ) : documents.length === 0 ? (
            <div className="p-ds-spacing-4 text-center" style={{ color: cssVar.text.muted }}>
              עדיין לא נרשמו תעודות במערכת.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>תעודה</TableHeaderCell>
                  <TableHeaderCell>תאריך</TableHeaderCell>
                  <TableHeaderCell>סוג פעולה</TableHeaderCell>
                  <TableHeaderCell>ספק / תורם</TableHeaderCell>
                  <TableHeaderCell>מחסן שולח</TableHeaderCell>
                  <TableHeaderCell>מחסן מקבל</TableHeaderCell>
                  <TableHeaderCell>סה"כ כמות</TableHeaderCell>
                  <TableHeaderCell>ערך כספי</TableHeaderCell>
                  <TableHeaderCell>משתמש</TableHeaderCell>
                  <TableHeaderCell>פעולות</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.document_number}</TableCell>
                    <TableCell>
                      {formatDate(entry.document_date)}
                    </TableCell>
                    <TableCell>
                      {ACTION_LABELS[entry.action_type] || entry.action_type}
                    </TableCell>
                    <TableCell>
                      {entry.supplier_name ||
                        entry.donor_name ||
                        entry.external_party ||
                        "—"}
                      {entry.action_type === "RECEIPT" &&
                        entry.supplier_document_type && (
                          <Text className="text-xs mt-0.5">
                            {entry.supplier_document_type}
                          </Text>
                        )}
                    </TableCell>
                    <TableCell>
                      {entry.source_warehouse_name || "—"}
                    </TableCell>
                    <TableCell>
                      {entry.target_warehouse_name || "—"}
                    </TableCell>
                    <TableCell>
                      {entry.total_quantity?.toLocaleString("he-IL") || "0"}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(entry.total_value)}
                    </TableCell>
                    <TableCell>
                      {entry.created_by_name || entry.created_by || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={EyeIcon}
                          onClick={() => onViewDocument(entry.id)}
                        />
                        {canEdit && (
                          <Button
                            variant="secondary"
                            size="xs"
                            icon={PencilIcon}
                            onClick={() => onEditDocument(entry.id)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
      <Text className="text-sm mt-4" style={{ color: cssVar.text.muted }}>
        ניהול המחסנים מתבצע דרך &quot;הגדרות מחסנים&quot; בטאב "הגדרות מבנה".
      </Text>
    </>
  );
}
