import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Moon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { EmptyState } from '../../../components/common/EmptyState/EmptyState';
import { Pagination } from '../../../components/common/Pagination/Pagination';
import { useLogRestDay, useWorkoutSessions } from '../../../hooks/api/useWorkoutSessions';
import { formatDate } from '../../../utils/formatters';
import type { WorkoutSessionStatus } from '../../../types/workoutSession.types';

const STATUS_LABEL: Record<WorkoutSessionStatus, string> = {
  started: 'inceput',
  completed: 'completat',
  cancelled: 'anulat',
  rest: 'rest day',
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

  const totalPages = data ? Math.ceil(data.meta.total / data.meta.limit) : 1;

  const handleRestDay = () => {
    logRestDay.mutate(
      {},
      {
        onSuccess: () => toast.success('Rest day inregistrat pentru azi'),
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message;
          toast.error(msg ?? 'Nu am putut inregistra rest day-ul');
        },
      }
    );
  };

  if (isLoading) return <LoadingSpinner label="Se incarca..." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Workout History</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            View your past workout sessions
          </p>
        </div>
        <button
          type="button"
          onClick={handleRestDay}
          disabled={logRestDay.isPending}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border text-muted-foreground text-sm font-medium hover:text-foreground hover:border-[#06b6d4]/60 hover:bg-[#06b6d4]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-start"
        >
          <Moon className="w-4 h-4" />
          Marcheaza rest day azi
        </button>
      </div>

      {!data || data.items.length === 0 ? (
        <EmptyState
          title="Niciun antrenament inca"
          description="Antrenamentele tale vor aparea aici."
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
                              ? 'Rest day'
                              : (session.workoutTableName ?? 'Antrenament liber')}
                          </h3>
                          <Badge
                            variant={statusVariant(session.status)}
                            className="shrink-0"
                          >
                            {STATUS_LABEL[session.status] ?? session.status}
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
                      {duration !== null && (
                        <div className="text-left sm:text-right shrink-0">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Duration
                          </p>
                          <p className="font-medium">{duration} min</p>
                        </div>
                      )}
                    </div>

                    {/* Exercise breakdowns */}
                    {!isRest && rows.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {rows.map((row) => {
                          const name =
                            row.exercise?.name ?? row.exerciseName ?? 'Exercise';
                          const sets = row.performedSets ?? [];
                          const totalValue = sets.reduce(
                            (acc, s) => acc + s.actualValue,
                            0,
                          );
                          const isTime =
                            (row.exercise?.measurementType ??
                              row.measurementTypeSnapshot) === 'time';
                          const unitLabel = isTime ? 's' : 'reps';

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
                                    Set {set.setNumber}: {set.actualValue}{' '}
                                    {unitLabel}
                                  </p>
                                ))}
                              </div>
                              {sets.length > 0 && (
                                <p className="text-xs text-primary mt-1.5 font-medium">
                                  Total: {totalValue} {unitLabel}
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
                        <span>Total sets: {totalSets}</span>
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
    </div>
  );
}