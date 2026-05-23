import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Share2, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { WorkoutTableView } from '../../../components/workout-tables/WorkoutTableView/WorkoutTableView';
import { ShareDialog } from '../../../components/sharing/ShareDialog/ShareDialog';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { useWorkoutTable } from '../../../hooks/api/useWorkoutTables';
import { useStartSession } from '../../../hooks/api/useWorkoutSessions';
import { useWorkoutStore } from '../../../stores/workout.store';
import { useLanguage } from '../../../contexts/LanguageContext';

export function WorkoutTableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: table, isLoading } = useWorkoutTable(id);
  const startSession = useStartSession();
  const startSessionInStore = useWorkoutStore((s) => s.startSession);
  const { t } = useLanguage();
  const [shareOpen, setShareOpen] = useState(false);

  if (isLoading || !table) return <LoadingSpinner label={t('common.loading')} />;

  function handleStart() {
    if (!id) return;
    startSession.mutate(
      { workoutTableId: id },
      {
        onSuccess: (session) => {
          startSessionInStore(session.id, id);
          navigate('/workout');
        },
        onError: () => toast.error(t('plans.detail.toast.startFailed')),
      }
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold truncate">{table.name}</h1>
          {table.description && (
            <p className="text-xs sm:text-base text-muted-foreground mt-1 line-clamp-2">{table.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            icon={<Pencil size={16} />}
            onClick={() => navigate(`/workout-tables/${table.id}/edit`)}
          >
            {t('common.edit')}
          </Button>
          <Button
            variant="secondary"
            icon={<Share2 size={16} />}
            onClick={() => setShareOpen(true)}
          >
            {t('plans.detail.share')}
          </Button>
          <Button
            icon={<Play size={16} />}
            onClick={handleStart}
            loading={startSession.isPending}
          >
            {t('plans.detail.start')}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <WorkoutTableView rows={table.rows ?? []} />
        </CardContent>
      </Card>

      {id && (
        <ShareDialog
          open={shareOpen}
          tableId={id}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
