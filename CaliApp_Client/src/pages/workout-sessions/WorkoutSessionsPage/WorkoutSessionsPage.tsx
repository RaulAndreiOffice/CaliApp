import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Moon, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { EmptyState } from '../../../components/common/EmptyState/EmptyState';
import { Pagination } from '../../../components/common/Pagination/Pagination';
import {
  useDeleteSession,
  useLogRestDay,
  useWorkoutSessions,
} from '../../../hooks/api/useWorkoutSessions';
import { useWorkoutStore } from '../../../stores/workout.store';
import { useLanguage } from '../../../contexts/LanguageContext';
import { formatDate } from '../../../utils/formatters';
import type { TranslationKey } from '../../../i18n/translations';
import type { WorkoutSessionStatus } from '../../../types/workoutSession.types';

const STATUS_KEY: Record<WorkoutSessionStatus, TranslationKey> = {
  started: 'sessions.status.started',
  completed: 'sessions.status.completed',
  cancelled: 'sessions.status.cancelled',
  rest: 'sessions.status.rest',
};

function statusVariant(status: WorkoutSessionStatus): 'success' | 'info' | 'danger' | 'default' {
  if (status === 'completed') return 'success';
  if (status === 'started') return 'info';
  if (status === 'cancelled') return 'danger';
  return 'default';
}

export function WorkoutSessionsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useWorkoutSessions(page, limit);
  const logRestDay = useLogRestDay();
  const deleteSession = useDeleteSession();
  const activeSessionId = useWorkoutStore((s) => s.activeSessionId);
  const endWorkoutInStore = useWorkoutStore((s) => s.endSession);
  const { t } = useLanguage();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const totalPages = data ? Math.ceil(data.meta.total / data.meta.limit) : 1;

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    deleteSession.mutate(id, {
      onSuccess: () => {
        if (activeSessionId === id) endWorkoutInStore();
        toast.success(t('sessions.toast.deleted'));
        setPendingDeleteId(null);
      },
      onError: () => toast.error(t('sessions.toast.deleteFailed')),
    });
  };

  const handleRestDay = () => {
    logRestDay.mutate(
      {},
      {
        onSuccess: () => toast.success(t('sessions.toast.restLogged')),
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message;
          toast.error(msg ?? t('sessions.toast.restFailed'));
        },
      }
    );
  };

  if (isLoading) return <LoadingSpinner label={t('common.loading')} />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('sessions.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t('sessions.subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRestDay}
          disabled={logRestDay.isPending}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border text-muted-foreground text-sm font-medium hover:text-foreground hover:border-[#06b6d4]/60 hover:bg-[#06b6d4]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-start"
        >
          <Moon className="w-4 h-4" />
          {t('sessions.markRestDay')}
        </button>
      </div>

      {!data || data.items.length === 0 ? (
        <EmptyState
          title={t('sessions.empty.title')}
          description={t('sessions.empty.desc')}
        />
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {data.items.map((session) => {
              const rows = session.rows ?? [];
              const isRest = session.status === 'rest';
              const totalSets = rows.reduce(
                (acc, r) => acc + (r.performedSets?.length ?? 0),
                0,
              );
              const duration =
                !isRest && session.completedAt
                  ? Math.floor(
                      (new Date(session.completedAt).getTime() -
                        new Date(session.startedAt).getTime()) /
                        60000,
                    )
                  : null;

              return (
                <Card
                  key={session.id}
                  className="hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/workout-sessions/${session.id}`)}
                >
                  <div className="p-4 space-y-3 sm:space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {isRest && <Moon className="w-4 h-4 text-[#06b6d4] shrink-0" />}
                          <h3 className="font-medium text-base sm:text-lg truncate">
                            {isRest
                              ? t('sessions.card.restDay')
                              : (session.workoutTableName ?? t('sessions.card.freeWorkout'))}
                          </h3>
                          <Badge
                            variant={statusVariant(session.status)}
                            className="shrink-0"
                          >
                            {t(STATUS_KEY[session.status])}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {formatDate(session.startedAt)}
                        </p>
                        {isRest && session.notes && (
                          <p className="text-xs sm:text-sm text-muted-foreground/80 mt-1 italic">
                            {session.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-start gap-2 shrink-0">
                        {duration !== null && (
                          <div className="text-left sm:text-right">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {t('sessions.card.duration')}
                            </p>
                            <p className="font-medium">{duration} {t('common.minutes')}</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingDeleteId(session.id);
                          }}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"
                          title={t('sessions.card.delete.tooltip')}
                          aria-label={t('sessions.card.delete.tooltip')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Exercise breakdowns */}
                    {!isRest && rows.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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
                          const unitLabel = isTime ? t('common.seconds') : t('common.reps');

                          return (
                            <div
                              key={row.id}
                              className="p-2.5 sm:p-3 bg-muted/30 rounded-lg"
                            >
                              <p className="font-medium text-sm mb-1.5 truncate">
                                {name}
                              </p>
                              <div className="space-y-0.5">
                                {sets.map((set) => (
                                  <p
                                    key={set.id}
                                    className="text-xs text-muted-foreground"
                                  >
                                    {t('sessions.card.set')} {set.setNumber}: {set.actualValue} {unitLabel}
                                  </p>
                                ))}
                              </div>
                              {sets.length > 0 && (
                                <p className="text-xs text-primary mt-1.5 font-medium">
                                  {t('sessions.card.total')}: {totalValue} {unitLabel}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Footer */}
                    {!isRest && (
                      <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground pt-2 border-t border-border">
                        <span>{t('sessions.card.totalSets')}: {totalSets}</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <Dialog
        open={!!pendingDeleteId}
        title={t('sessions.confirmDelete.title')}
        onClose={() => (deleteSession.isPending ? undefined : setPendingDeleteId(null))}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPendingDeleteId(null)}
              disabled={deleteSession.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDelete}
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
    </div>
  );
}
