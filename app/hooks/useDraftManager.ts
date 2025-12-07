"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type DraftType = "equipmentItem" | "inventoryDocument" | "donor";

export type DraftEntry<T> = {
  id: string;
  type: DraftType;
  payload: T;
  updatedAt: number;
};

const STORAGE_KEY = "posseable-drafts";

function loadDrafts(): DraftEntry<any>[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistDrafts(drafts: DraftEntry<any>[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function useDraftManager<T extends Record<string, any>>(type: DraftType) {
  const [drafts, setDrafts] = useState<DraftEntry<T>[]>([]);

  useEffect(() => {
    setDrafts(loadDrafts().filter((entry) => entry.type === type));
  }, [type]);

  const saveDraft = useCallback(
    (id: string, payload: T) => {
      setDrafts((prev) => {
        const filtered =
          loadDrafts().filter(
            (entry) => !(entry.id === id && entry.type === type)
          ) || [];
        const next: DraftEntry<T>[] = [
          ...filtered,
          { id, type, payload, updatedAt: Date.now() },
        ];
        persistDrafts(next);
        return next.filter((entry) => entry.type === type);
      });
    },
    [type]
  );

  const deleteDraft = useCallback(
    (id: string) => {
      setDrafts((prev) => {
        const filtered = loadDrafts().filter(
          (entry) => !(entry.id === id && entry.type === type)
        );
        persistDrafts(filtered);
        return filtered.filter((entry) => entry.type === type);
      });
    },
    [type]
  );

  const clearDrafts = useCallback(() => {
    setDrafts((prev) => {
      const filtered = loadDrafts().filter((entry) => entry.type !== type);
      persistDrafts(filtered);
      return [];
    });
  }, [type]);

  const getDraft = useCallback(
    (id: string) => drafts.find((entry) => entry.id === id)?.payload,
    [drafts]
  );

  const sortedDrafts = useMemo(
    () => [...drafts].sort((a, b) => b.updatedAt - a.updatedAt),
    [drafts]
  );

  return useMemo(
    () => ({
      drafts: sortedDrafts,
      saveDraft,
      deleteDraft,
      clearDrafts,
      getDraft,
    }),
    [sortedDrafts, saveDraft, deleteDraft, clearDrafts, getDraft]
  );
}

