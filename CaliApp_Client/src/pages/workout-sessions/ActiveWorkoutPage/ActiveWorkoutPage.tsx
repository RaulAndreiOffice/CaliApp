import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Square, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/common/EmptyState/EmptyState';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { SessionTimer } from '../../../components/workout-sessions/SessionTimer/SessionTimer';
import { ActiveExerciseCard } from '../../../components/workout-sessions/ActiveExerciseCard/ActiveExerciseCard';
import { useWorkoutStore } from '../../../stores/workout.store';
import {
  useCancelSession,
  useCompleteSession,
  useWorkoutSession,
} from '../../../hooks/api/useWorkoutSessions';

export function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const activeId = useWorkoutStore((s) => s.activeSessionId);
  const endSession = useWorkoutStore((s) => s.endSession);
  const { data: session, isLoading } = useWorkoutSession(activeId ?? undefined);
  const completeMutation = useCompleteSession();
  const cancelMutation = useCancelSession();

  if (!activeId) {
    return (
      <EmptyState
        title="Niciun antrenament activ"
        description="Mergi la un plan si apasa Incepe."
        action={
          <Button onClick={() => navigate('/workout-tables')}>
            Alege plan
          </Button>
        }
      />
    );
  }

  if (isLoading || !session) return <LoadingSpinner label="Se incarca..." />;

  function handleComplete() {
    if (!activeId) return;
    completeMutation.mutate(activeId, {
      onSuccess: () => {
        endSession();
        navigate(`/workout-sessions/${activeId}`);
      },
      onError: () => toast.error('Eroare la finalizare'),
    });
  }

  function handleCancel() {
    if (!activeId) return;
    cancelMutation.mutate(activeId, {
      onSuccess: () => {
        endSession();
        toast.success('Antrenament anulat');
        navigate('/workout-tables');
      },
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {session.workoutTableName ?? 'Antrenament'}
        </h1>
        <div className="flex items-center gap-2">
          <SessionTimer />
          <Button
            variant="secondary"
            icon={<Square size={16} />}
            onClick={handleCancel}
            loading={cancelMutation.isPending}
          >
            Anuleaza
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
          Finalizeaza antrenament
        </Button>
      </div>
    </div>
  );
}
