import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { EmptyState } from '../../../components/common/EmptyState/EmptyState';
import { useWorkoutSession } from '../../../hooks/api/useWorkoutSessions';
import { formatDate } from '../../../utils/formatters';

export function WorkoutSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading } = useWorkoutSession(id);

  if (isLoading) return <LoadingSpinner label="Se incarca sesiunea..." />;

  if (!session) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Button variant="ghost" onClick={() => navigate('/workout-sessions')} size="sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </Button>
        <EmptyState
          title="Sesiunea nu a fost gasita"
          description="Verifica istoricul antrenamentelor si incearca din nou."
        />
      </div>
    );
  }

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/workout-sessions')}
        size="sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Sessions</span>
      </Button>

      {/* Title + status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 truncate">
            {session.workoutTableName ?? 'Antrenament'}
          </h1>
          {session.notes && (
            <p className="text-sm sm:text-base text-muted-foreground">
              {session.notes}
            </p>
          )}
        </div>
        <Badge
          variant={
            session.status === 'completed'
              ? 'success'
              : session.status === 'started'
                ? 'info'
                : 'danger'
          }
          className="shrink-0"
        >
          {session.status}
        </Badge>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-3 sm:pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Date</span>
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
              <span className="text-xs sm:text-sm">Duration</span>
            </div>
            <p className="text-lg sm:text-xl font-bold">
              {duration !== null ? `${duration} min` : '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-3 sm:pt-4">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              Total Sets
            </p>
            <p className="text-lg sm:text-xl font-bold">{totalSets}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-3 sm:pt-4">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              Total Reps/Time
            </p>
            <p className="text-lg sm:text-xl font-bold">{totalReps}</p>
          </CardContent>
        </Card>
      </div>

      {/* Exercises performed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Exercises Performed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {rows.map((row) => {
              const name =
                row.exercise?.name ?? row.exerciseName ?? 'Exercitiu';
              const sets = row.performedSets ?? [];
              const totalValue = sets.reduce(
                (acc, s) => acc + s.actualValue,
                0,
              );
              const isTime =
                (row.exercise?.measurementType ??
                  row.measurementTypeSnapshot) === 'time';
              const unitLabel = isTime ? 'seconds' : 'reps';
              const unitShort = isTime ? 's' : '';
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
                        Planned: {plannedSets} sets × {plannedTarget}{' '}
                        {unitLabel}
                      </p>
                    </div>
                    <Badge variant="default" className="shrink-0">
                      {sets.length} / {plannedSets} sets
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {sets.map((set) => (
                      <div
                        key={set.id}
                        className="p-2.5 sm:p-3 bg-muted/30 rounded-lg text-center"
                      >
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Set {set.setNumber}
                        </p>
                        <p className="text-base sm:text-lg font-bold text-primary">
                          {set.actualValue}
                          {unitShort && (
                            <span className="text-xs ml-0.5">
                              {unitShort}
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium text-primary">
                      {totalValue} {unitLabel}
                    </span>
                  </div>
                </div>
              );
            })}

            {rows.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No exercises recorded for this session.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
