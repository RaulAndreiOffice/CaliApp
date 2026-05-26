import { useCallback, useMemo, useState } from 'react';

interface UseEditableWidgetsOptions {
  initial: string[];
  catalog: Record<string, unknown>;
}

/**
 * Shared state for the dashboard-style widget grids that ship on both the
 * home Dashboard and the Plans & Progress page. Each surface keeps its own
 * catalog and render; this hook just owns the list, edit-mode flag, add
 * panel visibility, and the add/remove/reorder helpers so both pages stay
 * in lockstep without copy-pasting the logic.
 */
export function useEditableWidgets({ initial, catalog }: UseEditableWidgetsOptions) {
  const [widgets, setWidgets] = useState<string[]>(initial);
  const [editMode, setEditMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const availableToAdd = useMemo(
    () => Object.keys(catalog).filter((id) => !widgets.includes(id)),
    [catalog, widgets],
  );

  const addWidget = useCallback((id: string) => {
    setWidgets((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w !== id));
  }, []);

  const moveWidget = useCallback((id: string, delta: number) => {
    setWidgets((prev) => {
      const from = prev.indexOf(id);
      if (from === -1) return prev;
      const to = Math.max(0, Math.min(prev.length - 1, from + delta));
      if (from === to) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, id);
      return next;
    });
  }, []);

  const toggleEditMode = useCallback(() => {
    setEditMode((v) => !v);
    setAddOpen(false);
  }, []);

  return {
    widgets,
    setWidgets,
    editMode,
    setEditMode,
    toggleEditMode,
    addOpen,
    setAddOpen,
    availableToAdd,
    addWidget,
    removeWidget,
    moveWidget,
  };
}
