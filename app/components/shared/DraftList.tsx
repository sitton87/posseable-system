"use client";

import type { ReactNode } from "react";
import { Button } from "@/app/components/ui";
import type { DraftEntry } from "@/app/hooks/useDraftManager";
import { draft as draftPresets, cssVar, numericValues } from "@/app/styles/design-system";

type DraftListProps<TPayload> = {
  drafts: DraftEntry<TPayload>[];
  title?: string;
  description?: string;
  emptyMessage?: string;
  onResume?: (draftId: string) => void;
  onDelete?: (draftId: string) => void;
  resumeLabel?: string;
  renderDraftContent?: (draft: DraftEntry<TPayload>) => ReactNode;
  disableResume?: boolean;
  badgeLabel?: string;
  getTitle?: (draft: DraftEntry<TPayload>) => ReactNode;
  getSubtitle?: (draft: DraftEntry<TPayload>) => ReactNode;
};

export function DraftList<TPayload>({
  drafts,
  title = "טיוטות",
  description,
  emptyMessage = "אין טיוטות להצגה.",
  onResume,
  onDelete,
  resumeLabel = "המשך",
  renderDraftContent,
  disableResume = false,
  badgeLabel = "טיוטה",
  getTitle,
  getSubtitle,
}: DraftListProps<TPayload>) {
  if (!drafts.length) {
    return null;
  }

  return (
    <div className={draftPresets.container} dir="rtl">
      <div className={draftPresets.header}>
        <div className="flex items-center gap-2">
          <strong className={draftPresets.title}>{title}</strong>
          {description && (
            <>
              <span style={{ color: cssVar.border.primary, fontWeight: 300 }}>|</span>
              <span className={draftPresets.description}>
                {description}
              </span>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: cssVar.spacing[3] }}>
        {drafts.length === 0 ? (
          <div className={draftPresets.empty}>
            {emptyMessage}
          </div>
        ) : (
          drafts.map((draft, index) => (
            <div
              key={draft.id}
              className={draftPresets.row}
              style={{
                borderBottom:
                  index === drafts.length - 1
                    ? "none"
                    : undefined,
              }}
            >
              <div className={draftPresets.rowContent}>
                {renderDraftContent ? (
                  renderDraftContent(draft)
                ) : (
                  <DefaultDraftContent
                    draft={draft}
                    badgeLabel={badgeLabel}
                    getTitle={getTitle}
                    getSubtitle={getSubtitle}
                  />
                )}
              </div>
              <div className={draftPresets.actions}>
                {onResume && (
                  <Button
                    size="sm"
                    onClick={() => onResume(draft.id)}
                    disabled={disableResume}
                  >
                    {resumeLabel}
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onDelete(draft.id)}
                  >
                    🗑️
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

type DefaultDraftContentProps<TPayload> = {
  draft: DraftEntry<TPayload>;
  badgeLabel: string;
  getTitle?: (draft: DraftEntry<TPayload>) => ReactNode;
  getSubtitle?: (draft: DraftEntry<TPayload>) => ReactNode;
};

function DefaultDraftContent<TPayload>({
  draft,
  badgeLabel,
  getTitle,
  getSubtitle,
}: DefaultDraftContentProps<TPayload>) {
  const titleNode = getTitle ? getTitle(draft) : draft.id;
  const subtitleNode = getSubtitle
    ? getSubtitle(draft)
    : new Date(draft.updatedAt).toLocaleString("he-IL");

  return (
    <div className="flex items-center gap-2" dir="rtl">
      <span className={draftPresets.badge}>
        {badgeLabel}
      </span>
      <strong className={draftPresets.itemTitle}>{titleNode}</strong>
      <span style={{ color: cssVar.border.primary, fontWeight: 300 }}>|</span>
      <span className={draftPresets.itemSubtitle}>
        {subtitleNode}
      </span>
    </div>
  );
}
