import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, Calendar, Pencil, Trash2, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { EmptyState } from '../../../components/common/EmptyState/EmptyState';
import {
  useDeleteSession,
  useUpdateSession,
  useWorkoutSession,
} from '../../../hooks/api/useWorkoutSessions';
import { useDeleteSet, useUpdateSet } from '../../../hooks/api/usePerformedSets';
import { useWorkoutStore } from '../../../stores/workout.store';
import { useLanguage } from '../../../contexts/LanguageContext';
import { formatDate } from '../../../utils/formatters';

type EditingCell = { rowId: string; setId: string } | null;

export function WorkoutSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading } = useWorkoutSession(id);
  const deleteSession = useDeleteSession();
  const updateSession = useUpdateSession();
  const activeSessionId = useWorkoutStore((s) => s.activeSessionId);
  const endWorkoutInStore = useWorkoutStore((s) => s.endSession);
  const { t } = useLanguage();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
    }
  }, [editingCell]);

  if (isLoading) return <LoadingSpinner label={t('common.loading')} />;

  if (!session) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Button variant="ghost" onClick={() => navigate('/workout-sessions')} size="sm">
          <ArrowLeft className="w-4 h-4" />
          {t('sessionDetail.back')}
        </Button>
        <EmptyState
          title={t('sessionDetail.notFound.title')}
          description={t('sessionDetail.notFound.desc')}
        />
      </div>
    );
  }

  const sessionId = session.id;
  const rows = session.rows ?? [];
  const totalSets = rows.reduce(
    (acc, r) => acc + (r.performedSets?.length ?? 0),
    0,
  );
  const totalReps = rows.reduce((acc, r) => {
    return (
      acc +
      (r.performedSets ?? []).reduce((s, set) => s + set.actualValue, 0)
    );
  }, 0);

  const duration = session.completedAt
    ? Math.floor(
        (new Date(session.completedAt).getTime() -
          new Date(session.startedAt).getTime()) /
          60000,
      )
    : null;

  const openNotes = () => {
    setNotesValue(session.notes ?? '');
    setNotesOpen(true);
  };

  const saveNotes = () => {
    updateSession.mutate(
      { id: sessionId, data: { notes: notesValue } },
      {
        onSuccess: () => {
          toast.success(t('sessionDetail.notes.toast.saved'));
          setNotesOpen(false);
        },
        onError: () => toast.error(t('sessionDetail.notes.toast.failed')),
      },
    );
  };

  const handleDeleteSession = () => {
    deleteSession.mutate(sessionId, {
      onSuccess: () => {
        if (activeSessionId === sessionId) endWorkoutInStore();
        toast.success(t('sessions.toast.deleted'));
        navigate('/workout-sessions');
      },
      onError: () => toast.error(t('sessions.toast.deleteFailed')),
    });
  };

  let statusVariant: 'success' | 'info' | 'danger';
  if (session.status === 'completed') statusVariant = 'success';
  else if (session.status === 'started') statusVariant = 'info';
  else statusVariant = 'danger';

  return (
    <div className="space-y-4 sm:space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/workout-sessions')}
        size="sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('sessionDetail.back')}</span>
      </Button>

      {/* Title + status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 truncate">
            {session.workoutTableName ?? t('workout.title')}
          </h1>
          {session.notes && (
            <p className="text-sm sm:text-base text-muted-foreground">
              {session.notes}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Badge variant={statusVariant}>{session.status}</Badge>
          <Button
            variant="secondary"
            size="sm"
            icon={<Pencil size={14} />}
            onClick={openNotes}
          >
            {t('sessionDetail.notes.button')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={() => setConfirmDeleteOpen(true)}
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-3 sm:pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{t('sessionDetail.stat.date')}</span>
            </div>
            <p className="text-lg sm:text-xl font-bold">
              {formatDate(session.startedAt)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-3 sm:pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{t('sessionDetail.stat.duration')}</span>
            </div>
            <p className="text-lg sm:text-xl font-bold">
              {duration !== null ? `${duration} ${t('common.minutes')}` : '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-3 sm:pt-4">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              {t('sessionDetail.stat.totalSets')}
            </p>
            <p className="text-lg sm:text-xl font-bold">{totalSets}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-3 sm:pt-4">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              {t('sessionDetail.stat.totalReps')}
            </p>
            <p className="text-lg sm:text-xl font-bold">{totalReps}</p>
          </CardContent>
        </Card>
      </div>

      {/* Exercises performed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {t('sessionDetail.exercises.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {rows.map((row) => {
              const name =
                row.exercise?.name ?? row.exerciseName ?? t('sessions.card.exercise.fallback');
              const sets = row.performedSets ?? [];
              const totalValue = sets.reduce(
                (acc, s) => acc + s.actualValue,
                0,
              );
              const isTime =
                (row.exercise?.measurementType ??
                  row.measurementTypeSnapshot) === 'time';
              const unitLabel = isTime
                ? t('sessionDetail.exercises.unit.seconds')
                : t('sessionDetail.exercises.unit.reps');
              const unitShort = isTime ? t('common.seconds') : '';
              const plannedSets =
                row.plannedSetsSnapshot ?? row.plannedSets ?? 0;
              const plannedTarget =
                row.plannedTargetValueSnapshot ?? row.plannedTargetValue ?? 0;

              return (
                <div
                  key={row.id}
                  className="border border-border rounded-lg p-3 sm:p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-base sm:text-lg truncate">
                        {name}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('sessionDetail.exercises.planned', {
                          sets: plannedSets,
                          target: plannedTarget,
                          unit: unitLabel,
                        })}
                      </p>
                    </div>
                    <Badge variant="default" className="shrink-0">
                      {sets.length} / {plannedSets} {t('common.sets')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {sets.map((set) => (
                      <PerformedSetCell
                        key={set.id}
                        sessionId={sessionId}
                        rowId={row.id}
                        setId={set.id}
                        setNumber={set.setNumber}
                        value={set.actualValue}
                        unitShort={unitShort}
                        isEditing={
                          editingCell?.rowId === row.id &&
                          editingCell?.setId === set.id
                        }
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        inputRef={inputRef}
                        startEdit={() => {
                          setEditingCell({ rowId: row.id, setId: set.id });
                          setInputValue(String(set.actualValue));
                        }}
                        endEdit={() => {
                          setEditingCell(null);
                          setInputValue('');
                        }}
                      />
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">{t('sessions.card.total')}:</span>
                    <span className="font-medium text-primary">
                      {totalValue} {unitLabel}
                    </span>
                  </div>
                </div>
              );
            })}

            {rows.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('sessionDetail.exercises.empty')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={confirmDeleteOpen}
        title={t('sessions.confirmDelete.title')}
        onClose={() =>
          deleteSession.isPending ? undefined : setConfirmDeleteOpen(false)
        }
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={deleteSession.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteSession}
              loading={deleteSession.isPending}
            >
              {t('common.delete')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {t('sessions.confirmDelete.desc')}
        </p>
      </Dialog>

      <Dialog
        open={notesOpen}
        title={t('sessionDetail.notes.title')}
        onClose={() => (updateSession.isPending ? undefined : setNotesOpen(false))}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setNotesOpen(false)}
              disabled={updateSession.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              size="sm"
              onClick={saveNotes}
              loading={updateSession.isPending}
            >
              {t('common.save')}
            </Button>
          </>
        }
      >
        <textarea
          value={notesValue}
          onChange={(e) => setNotesValue(e.target.value)}
          rows={5}
          placeholder={t('sessionDetail.notes.placeholder')}
          aria-label={t('sessionDetail.notes.title')}
          className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
        />
      </Dialog>
    </div>
  );
}

interface PerformedSetCellProps {
  sessionId: string;
  rowId: string;
  setId: string;
  setNumber: number;
  value: number;
  unitShort: string;
  isEditing: boolean;
  inputValue: string;
  setInputValue: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  startEdit: () => void;
  endEdit: () => void;
}

function PerformedSetCell({
  sessionId,
  rowId,
  setId,
  setNumber,
  value,
  unitShort,
  isEditing,
  inputValue,
  setInputValue,
  inputRef,
  startEdit,
  endEdit,
}: Readonly<PerformedSetCellProps>) {
  const updateSet = useUpdateSet(sessionId, rowId, setId);
  const deleteSet = useDeleteSet(sessionId, rowId);
  const { t } = useLanguage();

  const commit = (raw: string) => {
    const num = Number.parseInt(raw, 10);
    if (Number.isNaN(num) || num < 0 || num === value) {
      endEdit();
      return;
    }
    updateSet.mutate(
      { actualValue: num },
      {
        onSuccess: () => endEdit(),
        onError: () => {
          toast.error(t('sessionDetail.set.updateFailed'));
          endEdit();
        },
      },
    );
  };

  const remove = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSet.mutate(setId, {
      onSuccess: () => toast.success(t('sessionDetail.set.deleted')),
      onError: () => toast.error(t('sessionDetail.set.deleteFailed')),
    });
  };

  return (
    <div className="relative p-2.5 sm:p-3 bg-muted/30 rounded-lg text-center group">
      <p className="text-xs text-muted-foreground mb-0.5">
        {t('sessions.card.set')} {setNumber}
      </p>
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          min={0}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit(inputValue);
            if (e.key === 'Escape') endEdit();
          }}
          onBlur={() => commit(inputValue)}
          className="w-full h-9 text-center bg-primary/10 border border-primary rounded-md text-base sm:text-lg font-bold focus:outline-none focus:ring-1 focus:ring-primary text-primary"
          aria-label={t('sessionDetail.set.editTitle')}
        />
      ) : (
        <button
          type="button"
          onClick={startEdit}
          className="w-full text-base sm:text-lg font-bold text-primary hover:underline"
          title={t('sessionDetail.set.editTitle')}
        >
          {value}
          {unitShort && <span className="text-xs ml-0.5">{unitShort}</span>}
        </button>
      )}
      <button
        type="button"
        onClick={remove}
        disabled={deleteSet.isPending}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-40"
        title={t('sessionDetail.set.deleteTooltip')}
        aria-label={`${t('sessionDetail.set.deleteTooltip')} ${setNumber}`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
