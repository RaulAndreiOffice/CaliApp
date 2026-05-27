import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Check, Timer, Plus, RotateCcw, Pencil, ArrowUp, ArrowDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../../utils/cn';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { EmptyState } from '../../common/EmptyState/EmptyState';
import { LoadingSpinner } from '../../common/LoadingSpinner/LoadingSpinner';
import { WorkoutTableForm } from '../WorkoutTableForm/WorkoutTableForm';
import { AddSessionExerciseDialog } from '../../workout-sessions/AddSessionExerciseDialog/AddSessionExerciseDialog';
import {
  useCreateWorkoutTable,
  useWorkoutTable,
  useWorkoutTables,
} from '../../../hooks/api/useWorkoutTables';
import { useReorderRows } from '../../../hooks/api/useWorkoutTableRows';
import { useStartSession, useWorkoutSession } from '../../../hooks/api/useWorkoutSessions';
import { useUpsertPerformedSet } from '../../../hooks/api/usePerformedSets';
import { useElapsedSeconds, useWorkoutStore } from '../../../stores/workout.store';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getServerErrorMessage } from '../../../utils/errors';
import type { WorkoutTable, WorkoutTableRow } from '../../../types/workoutTable.types';
import type { WorkoutSessionRow } from '../../../types/workoutSession.types';

type SetValue = number | null;
type EditingCell = { rowId: string; setIndex: number } | null;

// Ad-hoc extras (session rows without a workoutTableRowId) get their own
// inline editor so the planned-row state machine stays untouched — the
// underlying performed-set upsert is the same, just keyed straight off the
// session row.
function ExtraExerciseRow({
  sessionRow,
  sessionId,
}: Readonly<{ sessionRow: WorkoutSessionRow; sessionId: string }>) {
  const { t } = useLanguage();
  const upsertSet = useUpsertPerformedSet(sessionId);
  const [editing, setEditing] = useState<number | null>(null);
  const [input, setInput] = useState('');

  const isTime = sessionRow.measurementTypeSnapshot === 'time';
  const unit = isTime ? t('common.seconds') : '';
  const plannedSets = sessionRow.plannedSetsSnapshot ?? 0;
  const plannedTarget = sessionRow.plannedTargetValueSnapshot ?? 0;
  const exerciseName = sessionRow.exercise?.name ?? sessionRow.exerciseName ?? '—';

  const getVal = (setIndex: number): SetValue => {
    const set = sessionRow.performedSets?.find((s) => s.setNumber === setIndex + 1);
    return set?.actualValue ?? null;
  };

  const commit = (setIndex: number, raw: string) => {
    setEditing(null);
    setInput('');
    const num = Number.parseInt(raw, 10);
    if (Number.isNaN(num) || num < 0) return;
    const existing = sessionRow.performedSets?.find((s) => s.setNumber === setIndex + 1);
    if (existing?.actualValue === num) return;
    upsertSet.mutate(
      {
        rowId: sessionRow.id,
        setNumber: setIndex + 1,
        actualValue: num,
        existingSetId: existing?.id,
      },
      { onError: () => toast.error(t('plans.toast.setSaveFailed')) },
    );
  };

  return (
    <div className="bg-muted/20 border border-primary/20 rounded-lg px-3 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{exerciseName}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {plannedSets} × {plannedTarget}{unit}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: plannedSets }, (_, i) => i).map((setIndex) => {
          const val = getVal(setIndex);
          const isDone = val !== null;
          const isEditing = editing === setIndex;
          return (
            <div key={setIndex} className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                S{setIndex + 1}
              </span>
              {isEditing ? (
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commit(setIndex, input);
                    if (e.key === 'Escape') {
                      setEditing(null);
                      setInput('');
                    }
                  }}
                  onBlur={() => commit(setIndex, input)}
                  placeholder={String(plannedTarget)}
                  autoFocus
                  aria-label={t('plans.cell.enter', { n: setIndex + 1 })}
                  className="w-14 h-11 sm:w-12 sm:h-9 text-center bg-primary/10 border border-primary rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(setIndex);
                    setInput(isDone ? String(val) : '');
                  }}
                  title={t('plans.cell.enter', { n: setIndex + 1 })}
                  className={cn(
                    'w-14 h-11 sm:w-12 sm:h-9 rounded-md text-sm font-mono transition-all touch-manipulation',
                    isDone
                      ? 'bg-primary/20 text-primary border border-primary/50 font-semibold'
                      : 'bg-muted/40 border border-dashed border-border text-muted-foreground hover:border-primary/60 hover:text-foreground cursor-pointer',
                  )}
                >
                  {isDone ? `${val}${unit}` : '—'}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {sessionRow.notes && (
        <p className="text-xs text-muted-foreground mt-2 italic">{sessionRow.notes}</p>
      )}
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function PlansBoard() {
  const navigate = useNavigate();
  const { data: tables, isLoading } = useWorkoutTables();
  const createMutation = useCreateWorkoutTable();
  const startSessionMutation = useStartSession();
  const { t } = useLanguage();

  const activeSessionId = useWorkoutStore((s) => s.activeSessionId);
  const activeTableId = useWorkoutStore((s) => s.activeTableId);
  const startWorkoutInStore = useWorkoutStore((s) => s.startSession);
  const endWorkoutInStore = useWorkoutStore((s) => s.endSession);
  const elapsed = useElapsedSeconds();

  // Verify the persisted active session is still valid server-side. If it was
  // deleted, completed, or cancelled (e.g. from another device), drop the
  // stale local state so the UI unlocks editing/deleting/starting plans.
  const { data: activeSession, isError: activeSessionError } = useWorkoutSession(
    activeSessionId ?? undefined,
  );
  const staleActiveSession = Boolean(
    activeSessionId &&
      (activeSessionError || (activeSession && activeSession.status !== 'started')),
  );
  useEffect(() => {
    if (staleActiveSession) endWorkoutInStore();
  }, [staleActiveSession, endWorkoutInStore]);

  const isActive = !!activeSessionId && !staleActiveSession;
  const upsertSet = useUpsertPerformedSet(isActive ? activeSessionId : null);

  // Map the active session's rows by their planning row id so we can resolve
  // each table row to the server-side WorkoutSessionRow (with its performed
  // sets) without relying on exerciseId, which may repeat in a plan.
  const sessionRowByTableRowId = useMemo(() => {
    const map = new Map<string, WorkoutSessionRow>();
    if (!isActive) return map;
    for (const r of activeSession?.rows ?? []) {
      if (r.workoutTableRowId) map.set(r.workoutTableRowId, r);
    }
    return map;
  }, [isActive, activeSession]);

  const [createOpen, setCreateOpen] = useState(false);
  const [addExtraOpen, setAddExtraOpen] = useState(false);
  const [selectedIdLocal, setSelectedIdLocal] = useState<string>('');
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Ad-hoc rows added mid-session (workoutTableRowId === null). Sorted by
  // orderIndex so the order the user added them in is preserved.
  const extraSessionRows = useMemo<WorkoutSessionRow[]>(() => {
    if (!isActive) return [];
    return (activeSession?.rows ?? [])
      .filter((r) => !r.workoutTableRowId)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [isActive, activeSession]);

  // While a workout is active, force the selected tab to the active table.
  const selectedId = isActive && activeTableId ? activeTableId : selectedIdLocal;

  // Sort plans so the active workout's plan is always first in the tab bar.
  // Depend on activeTableId (Zustand, instant) rather than isActive (gated by
  // the useWorkoutSession staleness check) so the reorder is visible the
  // moment Start succeeds, not after the session query resolves.
  const sortedTables = useMemo(() => {
    if (!tables) return tables;
    if (!activeTableId) return tables;
    const idx = tables.findIndex((t) => t.id === activeTableId);
    if (idx <= 0) return tables;
    const next = [...tables];
    const [active] = next.splice(idx, 1);
    next.unshift(active);
    return next;
  }, [tables, activeTableId]);

  // After Start (or when the active plan changes), scroll the tab bar back to
  // the start so the user actually sees the active plan in the first slot —
  // overflow-x-auto preserves scrollLeft across re-renders, so without this
  // someone who started from a tab on the right would still be looking at
  // the right edge and miss that the reorder happened.
  useEffect(() => {
    if (!activeTableId) return;
    tabsRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }, [activeTableId]);

  const activeSelectedId = selectedId || sortedTables?.[0]?.id || '';
  const reorderRowsMutation = useReorderRows(activeSelectedId);
  const selectedPlanSummary: WorkoutTable | undefined = sortedTables?.find(
    (t) => t.id === activeSelectedId,
  );
  const { data: selectedPlanDetail, isLoading: isSelectedPlanLoading } =
    useWorkoutTable(activeSelectedId || undefined);
  const selectedPlan = selectedPlanDetail ?? selectedPlanSummary;
  const sortedRows: WorkoutTableRow[] = [
    ...(selectedPlan?.rows ?? []),
  ].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

  useEffect(() => {
    if (editingCell) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
    }
  }, [editingCell]);

  const reset = () => {
    endWorkoutInStore();
    setEditingCell(null);
    setInputValue('');
  };

  const moveRow = (rowIndex: number, direction: -1 | 1) => {
    if (!selectedPlan || isActive || reorderRowsMutation.isPending) return;
    const targetIndex = rowIndex + direction;
    if (targetIndex < 0 || targetIndex >= sortedRows.length) return;

    const nextRows = [...sortedRows];
    const [moved] = nextRows.splice(rowIndex, 1);
    nextRows.splice(targetIndex, 0, moved);

    reorderRowsMutation.mutate(
      { orderedIds: nextRows.map((row) => row.id) },
      {
        onSuccess: () => toast.success(t('plans.detail.toast.saved')),
        onError: () => toast.error(t('plans.row.toast.failed')),
      },
    );
  };

  const startWorkout = () => {
    if (!selectedPlan) return;
    const planId = selectedPlan.id;
    const planName = selectedPlan.name;
    startSessionMutation.mutate(
      { workoutTableId: planId },
      {
        onSuccess: (session) => {
          // Pin the local selection too so Reset/end keeps the user on the
          // plan they just trained, not whatever they were browsing before.
          setSelectedIdLocal(planId);
          startWorkoutInStore(session.id, planId);
          toast.success(t('plans.toast.started', { name: planName }));
        },
        onError: (err) => toast.error(getServerErrorMessage(err, t('plans.toast.startFailed'))),
      },
    );
  };

  const getSetValue = (tableRowId: string, setIndex: number): SetValue => {
    const sessionRow = sessionRowByTableRowId.get(tableRowId);
    const set = sessionRow?.performedSets?.find((s) => s.setNumber === setIndex + 1);
    return set?.actualValue ?? null;
  };

  const commitSet = (tableRowId: string, setIndex: number, raw: string) => {
    const num = Number.parseInt(raw, 10);
    setEditingCell(null);
    setInputValue('');
    if (Number.isNaN(num) || num < 0) return;
    const sessionRow = sessionRowByTableRowId.get(tableRowId);
    if (!sessionRow) {
      toast.error(t('plans.toast.sessionLoading'));
      return;
    }
    const existing = sessionRow.performedSets?.find((s) => s.setNumber === setIndex + 1);
    if (existing?.actualValue === num) return;
    upsertSet.mutate(
      {
        rowId: sessionRow.id,
        setNumber: setIndex + 1,
        actualValue: num,
        existingSetId: existing?.id,
      },
      { onError: () => toast.error(t('plans.toast.setSaveFailed')) },
    );
  };

  const plannedTotalSets = sortedRows.reduce((s, r) => s + r.plannedSets, 0);
  const plannedCompletedSets = sortedRows.reduce((s, r) => {
    const sessionRow = sessionRowByTableRowId.get(r.id);
    return s + (sessionRow?.performedSets?.length ?? 0);
  }, 0);
  const extraTotalSets = extraSessionRows.reduce(
    (s, r) => s + (r.plannedSetsSnapshot ?? r.plannedSets ?? 0),
    0,
  );
  const extraCompletedSets = extraSessionRows.reduce(
    (s, r) => s + (r.performedSets?.length ?? 0),
    0,
  );
  const totalSets = plannedTotalSets + extraTotalSets;
  const completedSets = plannedCompletedSets + extraCompletedSets;
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  if (isLoading) return <LoadingSpinner label={t('common.loading')} />;

  if (!tables || tables.length === 0) {
    return (
      <>
        <EmptyState
          title={t('plans.empty.title')}
          description={t('plans.empty.desc')}
          action={
            <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
              {t('plans.empty.create')}
            </Button>
          }
        />
        <Dialog open={createOpen} title={t('plans.create.title')} onClose={() => setCreateOpen(false)}>
          <WorkoutTableForm
            onSubmit={(d) =>
              createMutation.mutate(d, {
                onSuccess: (table) => {
                  toast.success(t('plans.toast.created'));
                  setCreateOpen(false);
                  navigate(`/workout-tables/${table.id}/edit`);
                },
                onError: () => toast.error(t('plans.toast.createFailed')),
              })
            }
            onCancel={() => setCreateOpen(false)}
            loading={createMutation.isPending}
            submitLabel={t('plans.create.submit')}
          />
        </Dialog>
      </>
    );
  }

  return (
    <div className="space-y-3">
      {/* Plan tabs — horizontal scroll, larger touch targets */}
      <div
        ref={tabsRef}
        className="-mx-1 px-1 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1"
      >
        {(sortedTables ?? tables).map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => {
              if (isActive) {
                toast.error(t('plans.toast.switchBlocked'));
                return;
              }
              setSelectedIdLocal(plan.id);
              setEditingCell(null);
              setInputValue('');
            }}
            className={cn(
              'px-3.5 min-h-[36px] rounded-lg text-sm font-medium whitespace-nowrap transition-all touch-manipulation',
              activeSelectedId === plan.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
            )}
          >
            {plan.name}
            {plan.isActive && (
              <span className="ml-1.5 text-[10px] text-primary-foreground/70">●</span>
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="px-3.5 min-h-[36px] rounded-lg text-sm font-medium bg-card border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center gap-1.5 whitespace-nowrap touch-manipulation"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('plans.tab.new')}
        </button>
      </div>

      {selectedPlan && (
        <>
          {/* Header — stacks on small screens */}
          <div className="bg-muted/30 border border-border rounded-lg overflow-hidden">
            <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="font-semibold text-sm leading-tight truncate">{selectedPlan.name}</h2>
                {selectedPlan.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{selectedPlan.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                {isActive && (
                  <div className="flex items-center gap-1.5 font-mono text-sm text-primary tabular-nums">
                    <Timer className="w-3.5 h-3.5" />
                    {formatTime(elapsed)}
                  </div>
                )}
                {isActive && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {completedSets}/{totalSets}
                  </span>
                )}
                {isActive ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAddExtraOpen(true)}
                      className="flex items-center gap-1.5 bg-card border border-primary/30 text-primary px-3 min-h-[36px] rounded-lg text-xs font-medium hover:bg-primary/10 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t('plans.addExtra.button')}
                    </button>
                    <button
                      type="button"
                      onClick={reset}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title={t('plans.reset')}
                      aria-label={t('plans.reset')}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/workout')}
                      className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 min-h-[36px] rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {t('plans.continue')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => navigate(`/workout-tables/${selectedPlan.id}/edit`)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title={t('plans.edit')}
                      aria-label={t('plans.edit')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={startWorkout}
                      disabled={startSessionMutation.isPending}
                      className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 min-h-[36px] rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {t('plans.start')}
                    </button>
                  </div>
                )}
              </div>
            </div>
            {isActive && (
              <div className="h-0.5 bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Exercises */}
          {isSelectedPlanLoading && (
            <div className="bg-card border border-border rounded-xl px-4 py-6">
              <LoadingSpinner label={t('common.loading')} />
            </div>
          )}

          {!isSelectedPlanLoading && (
            <div className="space-y-2">
              {sortedRows.map((row, rowIndex) => {
                const exercise = row.exercise;
                if (!exercise) return null;
                const sessionRow = sessionRowByTableRowId.get(row.id);
                const doneCount = sessionRow?.performedSets?.length ?? 0;
                const isExDone = doneCount >= row.plannedSets;
                const isTime = exercise.measurementType === 'time';
                const unit = isTime ? t('common.seconds') : '';

                return (
                  <div
                    key={row.id}
                    className={cn(
                      'bg-muted/20 border rounded-lg px-3 py-2.5 transition-all duration-200',
                      isExDone && isActive
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            'w-4 h-4 rounded-full flex items-center justify-center transition-all shrink-0',
                            isExDone && isActive ? 'bg-primary' : 'border-2 border-border',
                          )}
                        >
                          {isExDone && isActive && (
                            <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-sm">{exercise.name}</span>
                          {exercise.category && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {exercise.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isActive && sortedRows.length > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveRow(rowIndex, -1)}
                              disabled={rowIndex === 0 || reorderRowsMutation.isPending}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              aria-label={`${t('common.previous')}: ${exercise.name}`}
                              title={t('common.previous')}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveRow(rowIndex, 1)}
                              disabled={rowIndex === sortedRows.length - 1 || reorderRowsMutation.isPending}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              aria-label={`${t('common.next')}: ${exercise.name}`}
                              title={t('common.next')}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {row.plannedSets} x {row.plannedTargetValue}{unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {Array.from({ length: row.plannedSets }, (_, i) => i).map((setIndex) => {
                        const val = getSetValue(row.id, setIndex);
                        const isDone = val !== null && val !== undefined;
                        const isEditing =
                          editingCell?.rowId === row.id &&
                          editingCell?.setIndex === setIndex;
                        let cellState: 'done' | 'active' | 'idle';
                        if (isDone) cellState = 'done';
                        else if (isActive) cellState = 'active';
                        else cellState = 'idle';

                        return (
                          <div key={setIndex} className="flex flex-col items-center gap-0.5">
                            <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                              S{setIndex + 1}
                            </span>
                            {isEditing ? (
                              <input
                                ref={inputRef}
                                type="number"
                                inputMode="numeric"
                                min={0}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') commitSet(row.id, setIndex, inputValue);
                                  if (e.key === 'Escape') { setEditingCell(null); setInputValue(''); }
                                }}
                                onBlur={() => commitSet(row.id, setIndex, inputValue)}
                                placeholder={String(row.plannedTargetValue)}
                                className="w-14 h-11 sm:w-12 sm:h-9 text-center bg-primary/10 border border-primary rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isActive) return;
                                  setEditingCell({ rowId: row.id, setIndex });
                                  setInputValue(isDone ? String(val) : '');
                                }}
                                disabled={!isActive}
                                title={isActive ? t('plans.cell.enter', { n: setIndex + 1 }) : t('plans.cell.placeholderHint')}
                                className={cn(
                                  'w-14 h-11 sm:w-12 sm:h-9 rounded-md text-sm font-mono transition-all touch-manipulation',
                                  cellState === 'done' && 'bg-primary/20 text-primary border border-primary/50 font-semibold',
                                  cellState === 'active' && 'bg-muted/40 border border-dashed border-border text-muted-foreground hover:border-primary/60 hover:text-foreground cursor-pointer',
                                  cellState === 'idle' && 'bg-muted/20 border border-border/40 text-muted-foreground/40 cursor-default',
                                )}
                              >
                                {isDone ? `${val}${unit}` : '—'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {row.restSeconds ? (
                        <div className="flex flex-col items-center gap-0.5 ml-1">
                          <span className="text-[10px] text-muted-foreground/60">{t('plans.rest')}</span>
                          <div className="h-8 px-2 flex items-center text-xs text-muted-foreground/50 tabular-nums">
                            {row.restSeconds}{t('common.seconds')}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    {row.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">{row.notes}</p>
                    )}
                  </div>
                );
              })}

              {isActive && extraSessionRows.length > 0 && (
                <section className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-normal">
                      {t('plans.addExtra.section')}
                    </h3>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {extraCompletedSets}/{extraTotalSets}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {extraSessionRows.map((row) => (
                      <ExtraExerciseRow
                        key={row.id}
                        sessionRow={row}
                        sessionId={activeSessionId!}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {!isSelectedPlanLoading && sortedRows.length === 0 && !isActive && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <p>{t('plans.empty.exercises')}</p>
              <button
                type="button"
                onClick={() => navigate(`/workout-tables/${selectedPlan.id}/edit`)}
                className="text-primary hover:underline mt-1 text-sm"
              >
                {t('plans.empty.exercises.add')}
              </button>
            </div>
          )}
        </>
      )}

      <Dialog open={createOpen} title={t('plans.create.title')} onClose={() => setCreateOpen(false)}>
        <WorkoutTableForm
          onSubmit={(d) =>
            createMutation.mutate(d, {
              onSuccess: (table) => {
                toast.success(t('plans.toast.created'));
                setCreateOpen(false);
                navigate(`/workout-tables/${table.id}/edit`);
              },
              onError: () => toast.error(t('plans.toast.createFailed')),
            })
          }
          onCancel={() => setCreateOpen(false)}
          loading={createMutation.isPending}
          submitLabel={t('plans.create.submit')}
        />
      </Dialog>
      <AddSessionExerciseDialog
        sessionId={isActive ? activeSessionId : null}
        open={addExtraOpen}
        onClose={() => setAddExtraOpen(false)}
      />
    </div>
  );
}
