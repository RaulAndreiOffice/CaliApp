import { useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog } from '../../ui/Dialog';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { ExercisePicker } from '../../exercises/ExercisePicker/ExercisePicker';
import { useAddSessionRow } from '../../../hooks/api/useWorkoutSessions';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getServerErrorMessage } from '../../../utils/errors';
import type { Exercise } from '../../../types/exercise.types';

interface Props {
  sessionId: string | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Ad-hoc add-exercise dialog. Posts a new WorkoutSessionRow with
 * workoutTableRowId = null so the underlying plan template is untouched —
 * the extra only lives in today's session.
 */
export function AddSessionExerciseDialog({ sessionId, open, onClose }: Readonly<Props>) {
  const { t } = useLanguage();
  const addRow = useAddSessionRow(sessionId);

  const [selected, setSelected] = useState<Exercise | null>(null);
  const [sets, setSets] = useState<number>(3);
  const [target, setTarget] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setSelected(null);
    setSets(3);
    setTarget(10);
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    if (addRow.isPending) return;
    reset();
    onClose();
  };

  const handlePick = (ex: Exercise) => {
    setSelected(ex);
    if (ex.defaultSets) setSets(ex.defaultSets);
    if (ex.defaultTargetValue) setTarget(ex.defaultTargetValue);
    setError(null);
  };

  const handleSubmit = () => {
    if (!selected) {
      setError(t('plans.row.form.exercise'));
      return;
    }
    if (sets < 1 || target < 1) return;

    addRow.mutate(
      {
        exerciseId: selected.id,
        plannedSets: sets,
        plannedTargetValue: target,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('plans.addExtra.toast.added'));
          reset();
          onClose();
        },
        onError: (err) => {
          toast.error(getServerErrorMessage(err, t('plans.addExtra.toast.failed')));
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      title={t('plans.addExtra.dialog.title')}
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={addRow.isPending}>
            {t('common.cancel')}
          </Button>
          <Button size="sm" onClick={handleSubmit} loading={addRow.isPending}>
            {t('plans.addExtra.submit')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs text-muted-foreground">{t('plans.addExtra.dialog.desc')}</p>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('plans.row.form.exercise')}</span>
          <ExercisePicker selectedId={selected?.id} onSelect={handlePick} />
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            label={t('plans.row.form.sets')}
            min={1}
            value={sets}
            onChange={(e) => setSets(Math.max(1, Number(e.target.value) || 1))}
          />
          <Input
            type="number"
            label={t('plans.row.form.target')}
            min={1}
            value={target}
            onChange={(e) => setTarget(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>

        <Input
          label={t('plans.row.form.notesOptional')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </Dialog>
  );
}
