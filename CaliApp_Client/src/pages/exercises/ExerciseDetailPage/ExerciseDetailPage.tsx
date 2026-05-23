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
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading || !exercise) return <LoadingSpinner label="Se incarca..." />;

  function handleArchive() {
    if (!id) return;
    archiveMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Exercitiu arhivat');
        navigate('/exercises');
      },
      onError: () => toast.error('Eroare la arhivare'),
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            type="button"
            variant="ghost"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate(-1)}
            aria-label="Inapoi"
          >
            Inapoi
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold truncate">{exercise.name}</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            icon={<Pencil size={16} />}
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            icon={<Archive size={16} />}
            onClick={() => setConfirmOpen(true)}
          >
            Arhiveaza
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant={exercise.measurementType === 'reps' ? 'default' : 'info'}>
              {exercise.measurementType}
            </Badge>
            {exercise.category && <span>{exercise.category}</span>}
            {exercise.defaultSets && exercise.defaultTargetValue && (
              <span>
                Default: {exercise.defaultSets} x {exercise.defaultTargetValue}
                {exercise.measurementType === 'time' ? 's' : ' rep'}
              </span>
            )}
          </div>
          {exercise.description && (
            <p className="mt-3 text-sm text-muted-foreground">{exercise.description}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold mb-3">Progres</h3>
          <ProgressChart
            data={progress?.weeks ?? []}
            measurementType={exercise.measurementType}
          />
        </CardContent>
      </Card>

      <Dialog
        open={editOpen}
        title="Editeaza exercitiu"
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
          onSubmit={(data) =>
            updateMutation.mutate(data, {
              onSuccess: () => {
                toast.success('Exercitiu actualizat');
                setEditOpen(false);
                navigate(-1);
              },
              onError: () => toast.error('Eroare la actualizare'),
            })
          }
          onCancel={() => setEditOpen(false)}
          loading={updateMutation.isPending}
        />
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Arhivezi acest exercitiu?"
        description="Va disparea din lista. Istoricul ramane intact."
        variant="danger"
        confirmLabel="Arhiveaza"
        onConfirm={() => {
          setConfirmOpen(false);
          handleArchive();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
