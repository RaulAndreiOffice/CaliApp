import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Drag-and-drop reorder for a list of widget ids.
 *
 * Desktop: drag starts immediately when `editMode` is true.
 * Touch: requires a long-press (default 400 ms) to start. Until the long-press
 * fires, the gesture is treated as a normal scroll, so users can still scroll
 * the page through widgets when editing.
 */

const LONG_PRESS_MS = 400;
const TOUCH_SLOP_PX = 8;
const AUTOSCROLL_EDGE_PX = 72;
const AUTOSCROLL_SPEED_PX = 14;

interface UseWidgetReorderOptions {
  enabled: boolean;
  ids: string[];
  onReorder: (next: string[]) => void;
  /**
   * Optional callback fired when a long-press successfully activates drag
   * on a touch device (e.g. trigger a haptic / toast).
   */
  onLongPressStart?: (id: string) => void;
}

interface DragHandlers {
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
}

export interface UseWidgetReorderResult {
  draggingId: string | null;
  overId: string | null;
  /** Returns event handlers for a draggable item. */
  getItemProps: (id: string) => DragHandlers;
  /** Spread on the same element as `getItemProps`. */
  isPressing: (id: string) => boolean;
}

interface DragState {
  pointerId: number | null;
  startX: number;
  startY: number;
  activated: boolean;
  pointerType: string;
  sourceId: string | null;
  longPressTimer: number | null;
  autoScrollRaf: number | null;
  autoScrollDir: 0 | 1 | -1;
}

export function useWidgetReorder({
  enabled,
  ids,
  onReorder,
  onLongPressStart,
}: UseWidgetReorderOptions): UseWidgetReorderResult {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [pressingId, setPressingId] = useState<string | null>(null);

  // Refs syncing latest values into stable handlers
  const idsRef = useRef(ids);
  const enabledRef = useRef(enabled);
  const onReorderRef = useRef(onReorder);
  const onLongPressStartRef = useRef(onLongPressStart);

  useEffect(() => { idsRef.current = ids; }, [ids]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { onReorderRef.current = onReorder; }, [onReorder]);
  useEffect(() => { onLongPressStartRef.current = onLongPressStart; }, [onLongPressStart]);

  const stateRef = useRef<DragState>({
    pointerId: null,
    startX: 0,
    startY: 0,
    activated: false,
    pointerType: 'mouse',
    sourceId: null,
    longPressTimer: null,
    autoScrollRaf: null,
    autoScrollDir: 0,
  });

  const clearLongPress = useCallback(() => {
    const s = stateRef.current;
    if (s.longPressTimer !== null) {
      window.clearTimeout(s.longPressTimer);
      s.longPressTimer = null;
    }
  }, []);

  const stopAutoScroll = useCallback(() => {
    const s = stateRef.current;
    if (s.autoScrollRaf !== null) {
      cancelAnimationFrame(s.autoScrollRaf);
      s.autoScrollRaf = null;
    }
    s.autoScrollDir = 0;
  }, []);

  // Named function so it can self-reference for the RAF loop
  const tickAutoScroll = useCallback(function tick() {
    const s = stateRef.current;
    if (s.autoScrollDir === 0) {
      s.autoScrollRaf = null;
      return;
    }
    window.scrollBy(0, AUTOSCROLL_SPEED_PX * s.autoScrollDir);
    s.autoScrollRaf = requestAnimationFrame(tick);
  }, []);

  const maybeAutoScroll = useCallback(
    (clientY: number) => {
      const s = stateRef.current;
      const h = window.innerHeight;
      let dir: 0 | 1 | -1 = 0;
      if (clientY < AUTOSCROLL_EDGE_PX) dir = -1;
      else if (clientY > h - AUTOSCROLL_EDGE_PX) dir = 1;
      if (dir !== s.autoScrollDir) {
        s.autoScrollDir = dir;
        if (dir !== 0 && s.autoScrollRaf === null) {
          s.autoScrollRaf = requestAnimationFrame(tickAutoScroll);
        }
        if (dir === 0) stopAutoScroll();
      }
    },
    [stopAutoScroll, tickAutoScroll],
  );

  const findClosestWidgetId = (clientX: number, clientY: number, sourceId: string): string | null => {
    const widgets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-widget-id]')
    ).filter((element) => {
      const id = element.dataset.widgetId;
      return id && id !== sourceId;
    });

    let closestId: string | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const widget of widgets) {
      const rect = widget.getBoundingClientRect();
      const inside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

      if (!inside) continue;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(clientX - centerX, clientY - centerY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestId = widget.dataset.widgetId ?? null;
      }
    }

    return closestId;
  };

  const reorderNow = useCallback((sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    const list = idsRef.current;
    const from = list.indexOf(sourceId);
    const to = list.indexOf(targetId);
    if (from === -1 || to === -1 || from === to) return;

    const next = [...list];
    next.splice(from, 1);
    next.splice(to, 0, sourceId);
    idsRef.current = next;
    onReorderRef.current(next);
  }, []);

  const endDrag = useCallback(() => {
    const s = stateRef.current;
    clearLongPress();
    stopAutoScroll();
    s.pointerId = null;
    s.sourceId = null;
    s.activated = false;
    setDraggingId(null);
    setOverId(null);
    setPressingId(null);
    document.body.style.userSelect = '';
    document.body.style.touchAction = '';
  }, [clearLongPress, stopAutoScroll]);

  // Global listeners while a pointer is captured
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.pointerId === null || e.pointerId !== s.pointerId) return;

      if (!s.activated) {
        const dx = Math.abs(e.clientX - s.startX);
        const dy = Math.abs(e.clientY - s.startY);
        if (s.pointerType === 'touch') {
          // Scroll intent before long-press fires → abort drag.
          if (dx > TOUCH_SLOP_PX || dy > TOUCH_SLOP_PX) {
            clearLongPress();
            s.pointerId = null;
            s.sourceId = null;
            setPressingId(null);
          }
        } else if (dx > TOUCH_SLOP_PX || dy > TOUCH_SLOP_PX) {
          // Mouse: activate immediately past the slop.
          s.activated = true;
          setDraggingId(s.sourceId);
          document.body.style.userSelect = 'none';
          document.body.style.touchAction = 'none';
        }
        return;
      }

      e.preventDefault();
      if (s.sourceId) {
        const id = findClosestWidgetId(e.clientX, e.clientY, s.sourceId);
        setOverId(id);
        if (id) reorderNow(s.sourceId, id);
      }
      maybeAutoScroll(e.clientY);
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.pointerId === null || e.pointerId !== s.pointerId) return;

      endDrag();
    };

    const onCancel = () => endDrag();

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [endDrag, maybeAutoScroll, clearLongPress, reorderNow]);

  // Cancel any active drag when editing is turned off.
  useEffect(() => {
    if (enabled) return;
    // Defer to next tick so we don't synchronously cascade state during an effect.
    const t = window.setTimeout(() => endDrag(), 0);
    return () => window.clearTimeout(t);
  }, [enabled, endDrag]);

  const getItemProps = useCallback(
    (id: string): DragHandlers => ({
      onPointerDown: (e) => {
        if (!enabledRef.current) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const target = e.target as HTMLElement;
        if (target.closest('[data-no-drag]')) return;

        const s = stateRef.current;
        clearLongPress();
        s.pointerId = e.pointerId;
        s.pointerType = e.pointerType;
        s.startX = e.clientX;
        s.startY = e.clientY;
        s.sourceId = id;
        s.activated = false;

        if (e.pointerType === 'touch') {
          setPressingId(id);
          s.longPressTimer = window.setTimeout(() => {
            const cur = stateRef.current;
            if (cur.pointerId !== e.pointerId) return;
            cur.activated = true;
            setDraggingId(id);
            setPressingId(null);
            document.body.style.userSelect = 'none';
            document.body.style.touchAction = 'none';
            if ('vibrate' in navigator) {
              try { navigator.vibrate(15); } catch { /* ignore */ }
            }
            onLongPressStartRef.current?.(id);
          }, LONG_PRESS_MS);
        }
      },
    }),
    [clearLongPress],
  );

  const isPressing = useCallback((id: string) => pressingId === id, [pressingId]);

  return { draggingId, overId, getItemProps, isPressing };
}
