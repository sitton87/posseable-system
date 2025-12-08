"use client";

import type { ReactNode } from "react";
import { Button } from "@/app/components/ui";
import type { DraftEntry } from "@/app/hooks/useDraftManager";
import { colors, spacing } from "@/app/styles/foundations";

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
    <div
      style={{
        border: `1px solid ${draftBorderColor}`,
        borderRadius: spacing.md,
        padding: spacing.md,
        background: draftSurfaceColor,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacing.xs,
        }}
      >
        <strong>{title}</strong>
        {description && (
          <p style={{ margin: 0, color: colors.textMuted, fontSize: 12 }}>
            {description}
          </p>
        )}
      </div>

      <div style={{ marginTop: spacing.sm }}>
        {drafts.length === 0 ? (
          <div
            style={{
              padding: spacing.sm,
              color: colors.textMuted,
              textAlign: "center",
            }}
          >
            {emptyMessage}
          </div>
        ) : (
          drafts.map((draft, index) => (
            <div
              key={draft.id}
              style={{
                ...draftRowStyle,
                borderBottom:
                  index === drafts.length - 1
                    ? "none"
                    : draftRowStyle.borderBottom,
              }}
            >
              <div style={{ minWidth: 0 }}>
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
              <div
                style={{
                  display: "flex",
                  gap: spacing.sm,
                  flexWrap: "wrap",
                }}
              >
                {onResume && (
                  <Button
                    onClick={() => onResume(draft.id)}
                    disabled={disableResume}
                  >
                    {resumeLabel}
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="secondary"
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

const draftBorderColor = "#8bd4a1";
const draftSurfaceColor = "#e6f5ec";
const draftRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: spacing.md,
  padding: `${spacing.sm} 0`,
  borderBottom: `1px solid ${draftBorderColor}`,
};

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
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: spacing.sm,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2px 8px",
            borderRadius: spacing.sm,
            background: colors.success,
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {badgeLabel}
        </span>
        <strong style={{ fontSize: 14 }}>{titleNode}</strong>
      </div>
      <p style={{ margin: 0, color: colors.textMuted, fontSize: 12 }}>
        {subtitleNode}
      </p>
    </div>
  );
}

