import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Pencil, Archive } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Dialog } from '../../../components/ui/Dialog';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog/ConfirmDialog';
import { ExerciseForm } from '../../../components/exercises/ExerciseForm/ExerciseForm';
import { ProgressChart } from '../../../components/stats/ProgressChart/ProgressChart';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  useArchiveExercise,
  useExercise,
  useUpdateExercise,
} from '../../../hooks/api/useExercises';
import { useExerciseProgress } from '../../../hooks/api/useStats';

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: exercise, isLoading } = useExercise(id);
  const { data: progress } = useExerciseProgress(id);
  const updateMutation = useUpdateExercise(id ?? '');
  const archiveMutation = useArchiveExercise();
  const { t } = useLanguage();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading || !exercise) return <LoadingSpinner label={t('common.loading')} />;

  function handleArchive() {
    if (!id) return;
    archiveMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t('exercises.detail.archive.toast.success'));
        navigate('/exercises');
      },
      onError: () => toast.error(t('exercises.detail.archive.toast.failed')),
    });
  }

  const measurementBadgeKey =
    exercise.measurementType === 'reps' ? 'exercises.filter.reps' : 'exercises.filter.time';

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            type="button"
            variant="ghost"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate(-1)}
            aria-label={t('common.back')}
          >
            {t('common.back')}
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold truncate">{exercise.name}</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            icon={<Pencil size={16} />}
            onClick={() => setEditOpen(true)}
          >
            {t('common.edit')}
          </Button>
          <Button
            variant="danger"
            icon={<Archive size={16} />}
            onClick={() => setConfirmOpen(true)}
          >
            {t('exercises.detail.archive')}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant={exercise.measurementType === 'reps' ? 'default' : 'info'}>
              {t(measurementBadgeKey)}
            </Badge>
            {exercise.category && <span>{exercise.category}</span>}
            {exercise.defaultSets && exercise.defaultTargetValue ? (
              <span>
                {t('exercises.detail.default', {
                  sets: exercise.defaultSets,
                  target: exercise.defaultTargetValue,
                  unit: exercise.measurementType === 'time' ? t('common.seconds') : ` ${t('common.reps')}`,
                })}
              </span>
            ) : null}
          </div>
          {exercise.description && (
            <p className="mt-3 text-sm text-muted-foreground">{exercise.description}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold mb-3">{t('exercises.detail.progress')}</h3>
          <ProgressChart
            data={progress?.weeks ?? []}
            measurementType={exercise.measurementType}
          />
        </CardContent>
      </Card>

      <Dialog
        open={editOpen}
        title={t('exercises.detail.editDialog.title')}
        onClose={() => setEditOpen(false)}
      >
        <ExerciseForm
          defaultValues={{
            name: exercise.name,
            measurementType: exercise.measurementType,
            category: exercise.category ?? undefined,
            description: exercise.description ?? undefined,
            defaultSets: exercise.defaultSets ?? undefined,
            defaultTargetValue: exercise.defaultTargetValue ?? undefined,
            defaultRestSeconds: exercise.defaultRestSeconds ?? undefined,
          }}
          onSubmit={(payload) =>
            updateMutation.mutate(payload, {
              onSuccess: () => {
                toast.success(t('exercises.detail.update.toast.success'));
                setEditOpen(false);
                navigate(-1);
              },
              onError: () => toast.error(t('exercises.detail.update.toast.failed')),
            })
          }
          onCancel={() => setEditOpen(false)}
          loading={updateMutation.isPending}
        />
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title={t('exercises.detail.archiveConfirm.title')}
        description={t('exercises.detail.archiveConfirm.desc')}
        variant="danger"
        confirmLabel={t('exercises.detail.archive')}
        onConfirm={() => {
          setConfirmOpen(false);
          handleArchive();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
