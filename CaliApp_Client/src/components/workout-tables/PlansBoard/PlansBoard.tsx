import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Check, Timer, Plus, RotateCcw, Flag, Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../../utils/cn';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { EmptyState } from '../../common/EmptyState/EmptyState';
import { LoadingSpinner } from '../../common/LoadingSpinner/LoadingSpinner';
import { WorkoutTableForm } from '../WorkoutTableForm/WorkoutTableForm';
import {
  useCreateWorkoutTable,
  useWorkoutTable,
  useWorkoutTables,
} from '../../../hooks/api/useWorkoutTables';
import { useStartSession } from '../../../hooks/api/useWorkoutSessions';
import { useElapsedSeconds, useWorkoutStore } from '../../../stores/workout.store';
import type { WorkoutTable, WorkoutTableRow } from '../../../types/workoutTable.types';

type SetValue = number | null;
type EditingCell = { exerciseId: string; setIndex: number } | null;

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

  const activeSessionId = useWorkoutStore((s) => s.activeSessionId);
  const activeTableId = useWorkoutStore((s) => s.activeTableId);
  const performedSets = useWorkoutStore((s) => s.performedSets);
  const startWorkoutInStore = useWorkoutStore((s) => s.startSession);
  const setPerformedValue = useWorkoutStore((s) => s.setPerformedValue);
  const endWorkoutInStore = useWorkoutStore((s) => s.endSession);
  const elapsed = useElapsedSeconds();
  const isActive = !!activeSessionId;

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedIdLocal, setSelectedIdLocal] = useState<string>('');
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // While a workout is active, force the selected tab to the active table.
  const selectedId = isActive && activeTableId ? activeTableId : selectedIdLocal;

  const activeSelectedId = selectedId || tables?.[0]?.id || '';
  const selectedPlanSummary: WorkoutTable | undefined = tables?.find(
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

  const startWorkout = () => {
    if (!selectedPlan) return;
    startSessionMutation.mutate(
      { workoutTableId: selectedPlan.id },
      {
        onSuccess: (session) => {
          startWorkoutInStore(session.id, selectedPlan.id);
          toast.success(`${selectedPlan.name} started!`);
        },
        onError: () => toast.error('Eroare la pornire'),
      },
    );
  };

  const getSetValue = (exerciseId: string, setIndex: number): SetValue =>
    performedSets[exerciseId]?.[setIndex] ?? null;

  const commitSet = (exerciseId: string, setIndex: number, raw: string) => {
    const num = Number.parseInt(raw, 10);
    if (!Number.isNaN(num) && num >= 0) {
      setPerformedValue(exerciseId, setIndex, num);
    }
    setEditingCell(null);
    setInputValue('');
  };

  const totalSets = sortedRows.reduce((s, r) => s + r.plannedSets, 0);
  const completedSets = sortedRows.reduce((s, r) => {
    const done = (performedSets[r.exerciseId] ?? []).filter(
      (v) => v !== null && v !== undefined,
    ).length;
    return s + done;
  }, 0);
  const progress = totalSets > 0 ? completedSets / totalSets : 0;
  const allDone = totalSets > 0 && completedSets >= totalSets;

  const finishWorkout = () => {
    toast.success(
      `Done! ${formatTime(elapsed)} · ${completedSets}/${totalSets} sets`,
    );
    endWorkoutInStore();
    navigate('/workout');
  };

  if (isLoading) return <LoadingSpinner label="Se incarca planurile..." />;

  if (!tables || tables.length === 0) {
    return (
      <>
        <EmptyState
          title="Niciun plan inca"
          description="Creeaza primul tau plan de antrenament."
          action={
            <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
              Creeaza plan
            </Button>
          }
        />
        <Dialog open={createOpen} title="Creeaza plan" onClose={() => setCreateOpen(false)}>
          <WorkoutTableForm
            onSubmit={(d) =>
              createMutation.mutate(d, {
                onSuccess: (table) => {
                  toast.success('Plan creat');
                  setCreateOpen(false);
                  navigate(`/workout-tables/${table.id}/edit`);
                },
                onError: () => toast.error('Eroare la creare'),
              })
            }
            onCancel={() => setCreateOpen(false)}
            loading={createMutation.isPending}
            submitLabel="Creeaza si editeaza"
          />
        </Dialog>
      </>
    );
  }

  return (
    <div className="space-y-3">
      {/* Plan tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        {tables.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => {
              if (isActive) {
                toast.error('Termina sau anuleaza antrenamentul activ inainte sa schimbi planul');
                return;
              }
              setSelectedIdLocal(plan.id);
              setEditingCell(null);
              setInputValue('');
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
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
          className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-card border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          New
        </button>
      </div>

      {selectedPlan && (
        <>
          {/* Header */}
          <div className="bg-muted/30 border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5">
              <div>
                <h2 className="font-semibold text-sm leading-tight">{selectedPlan.name}</h2>
                {selectedPlan.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedPlan.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
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
                {!isActive ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => navigate(`/workout-tables/${selectedPlan.id}/edit`)}
                      className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={startWorkout}
                      disabled={startSessionMutation.isPending}
                      className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Start
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={reset}
                      className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Reset"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={finishWorkout}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        allDone
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Flag className="w-3 h-3" />
                      Finish
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
              <LoadingSpinner label="Se incarca exercitiile..." />
            </div>
          )}

          {!isSelectedPlanLoading && (
            <div className="space-y-2">
              {sortedRows.map((row) => {
                const exercise = row.exercise;
                if (!exercise) return null;
                const doneCount = (performedSets[exercise.id] ?? []).filter(
                  (v) => v !== null && v !== undefined,
                ).length;
                const isExDone = doneCount >= row.plannedSets;
                const isTime = exercise.measurementType === 'time';
                const unit = isTime ? 's' : '';

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
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-4 h-4 rounded-full flex items-center justify-center transition-all',
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
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {row.plannedSets} x {row.plannedTargetValue}{unit}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {Array.from({ length: row.plannedSets }, (_, i) => i).map((setIndex) => {
                        const val = getSetValue(exercise.id, setIndex);
                        const isDone = val !== null && val !== undefined;
                        const isEditing =
                          editingCell?.exerciseId === exercise.id &&
                          editingCell?.setIndex === setIndex;

                        return (
                          <div key={setIndex} className="flex flex-col items-center gap-0.5">
                            <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                              S{setIndex + 1}
                            </span>
                            {isEditing ? (
                              <input
                                ref={inputRef}
                                type="number"
                                min={0}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') commitSet(exercise.id, setIndex, inputValue);
                                  if (e.key === 'Escape') { setEditingCell(null); setInputValue(''); }
                                }}
                                onBlur={() => commitSet(exercise.id, setIndex, inputValue)}
                                placeholder={String(row.plannedTargetValue)}
                                className="w-12 h-8 text-center bg-primary/10 border border-primary rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isActive) return;
                                  setEditingCell({ exerciseId: exercise.id, setIndex });
                                  setInputValue(isDone ? String(val) : '');
                                }}
                                disabled={!isActive}
                                title={isActive ? `Enter set ${setIndex + 1}` : 'Start workout first'}
                                className={cn(
                                  'w-12 h-8 rounded-md text-sm font-mono transition-all',
                                  isDone
                                    ? 'bg-primary/20 text-primary border border-primary/50 font-semibold'
                                    : isActive
                                      ? 'bg-muted/40 border border-dashed border-border text-muted-foreground hover:border-primary/60 hover:text-foreground cursor-pointer'
                                      : 'bg-muted/20 border border-border/40 text-muted-foreground/40 cursor-default',
                                )}
                              >
                                {isDone ? `${val}${unit}` : '—'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {row.restSeconds && (
                        <div className="flex flex-col items-center gap-0.5 ml-1">
                          <span className="text-[10px] text-muted-foreground/60">rest</span>
                          <div className="h-8 px-2 flex items-center text-xs text-muted-foreground/50 tabular-nums">
                            {row.restSeconds}s
                          </div>
                        </div>
                      )}
                    </div>
                    {row.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">{row.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!isSelectedPlanLoading && sortedRows.length === 0 && !isActive && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <p>Acest plan nu are exercitii inca.</p>
              <button
                type="button"
                onClick={() => navigate(`/workout-tables/${selectedPlan.id}/edit`)}
                className="text-primary hover:underline mt-1 text-sm"
              >
                Adauga exercitii
              </button>
            </div>
          )}
        </>
      )}

      <Dialog open={createOpen} title="Creeaza plan" onClose={() => setCreateOpen(false)}>
        <WorkoutTableForm
          onSubmit={(d) =>
            createMutation.mutate(d, {
              onSuccess: (table) => {
                toast.success('Plan creat');
                setCreateOpen(false);
                navigate(`/workout-tables/${table.id}/edit`);
              },
              onError: () => toast.error('Eroare la creare'),
            })
          }
          onCancel={() => setCreateOpen(false)}
          loading={createMutation.isPending}
          submitLabel="Creeaza si editeaza"
        />
      </Dialog>
    </div>
  );
}