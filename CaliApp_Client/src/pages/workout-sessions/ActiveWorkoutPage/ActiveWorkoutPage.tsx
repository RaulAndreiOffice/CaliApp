import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Square, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/common/EmptyState/EmptyState';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { SessionTimer } from '../../../components/workout-sessions/SessionTimer/SessionTimer';
import { ActiveExerciseCard } from '../../../components/workout-sessions/ActiveExerciseCard/ActiveExerciseCard';
import { useWorkoutStore } from '../../../stores/workout.store';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  useCancelSession,
  useCompleteSession,
  useWorkoutSession,
} from '../../../hooks/api/useWorkoutSessions';

export function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const activeId = useWorkoutStore((s) => s.activeSessionId);
  const endSession = useWorkoutStore((s) => s.endSession);
  const { data: session, isLoading, isError } = useWorkoutSession(activeId ?? undefined);
  const completeMutation = useCompleteSession();
  const cancelMutation = useCancelSession();
  const { t } = useLanguage();

  // Auto-recover from stale state: if the persisted session no longer exists on
  // the server, or was already completed/cancelled elsewhere, clear it so the
  // app stops thinking a workout is in progress.
  const staleStatus = session?.status && session.status !== 'started';
  useEffect(() => {
    if (!activeId) return;
    if (isError || staleStatus) endSession();
  }, [activeId, isError, staleStatus, endSession]);

  if (!activeId || isError || staleStatus) {
    return (
      <EmptyState
        title={t('workout.empty.title')}
        description={t('workout.empty.desc')}
        action={
          <Button onClick={() => navigate('/workout-tables')}>
            {t('workout.empty.pick')}
          </Button>
        }
      />
    );
  }

  if (isLoading || !session) return <LoadingSpinner label={t('common.loading')} />;

  function handleComplete() {
    if (!activeId) return;
    completeMutation.mutate(activeId, {
      onSuccess: () => {
        endSession();
        navigate(`/workout-sessions/${activeId}`);
      },
      onError: () => toast.error(t('workout.toast.completeFailed')),
    });
  }

  function handleCancel() {
    if (!activeId) return;
    cancelMutation.mutate(activeId, {
      onSuccess: () => {
        endSession();
        toast.success(t('workout.toast.cancelled'));
        navigate('/workout-tables');
      },
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-3xl font-bold truncate min-w-0">
          {session.workoutTableName ?? t('workout.title')}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <SessionTimer />
          <Button
            variant="secondary"
            icon={<Square size={16} />}
            onClick={handleCancel}
            loading={cancelMutation.isPending}
          >
            {t('workout.cancel')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {session.rows?.map((row) => (
          <ActiveExerciseCard key={row.id} sessionId={session.id} row={row} />
        ))}
      </div>

      <div className="sticky bottom-4 mt-4">
        <Button
          size="lg"
          fullWidth
          icon={<Check size={18} />}
          onClick={handleComplete}
          loading={completeMutation.isPending}
        >
          {t('workout.finish')}
        </Button>
      </div>
    </div>
  );
}
