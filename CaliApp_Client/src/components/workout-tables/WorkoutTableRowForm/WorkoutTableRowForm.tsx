import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  createWorkoutTableRowSchema,
  type CreateWorkoutTableRowInput,
} from '../../../utils/validators';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { ExercisePicker } from '../../exercises/ExercisePicker/ExercisePicker';
import type { Exercise } from '../../../types/exercise.types';

interface WorkoutTableRowFormProps {
  onSubmit: (data: CreateWorkoutTableRowInput) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function WorkoutTableRowForm({
  onSubmit,
  onCancel,
  loading,
}: WorkoutTableRowFormProps) {
  const [selected, setSelected] = useState<Exercise | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateWorkoutTableRowInput>({
    resolver: zodResolver(createWorkoutTableRowSchema),
  });

  function handleSelect(ex: Exercise) {
    setSelected(ex);
    setValue('exerciseId', ex.id);
    if (ex.defaultSets) setValue('plannedSets', ex.defaultSets);
    if (ex.defaultTargetValue) setValue('plannedTargetValue', ex.defaultTargetValue);
    if (ex.defaultRestSeconds) setValue('restSeconds', ex.defaultRestSeconds);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Exercitiu</label>
        <ExercisePicker selectedId={selected?.id} onSelect={handleSelect} />
        {errors.exerciseId?.message && (
          <span className="text-xs text-destructive">{errors.exerciseId.message}</span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Serii"
          type="number"
          min={1}
          error={errors.plannedSets?.message}
          {...register('plannedSets', { valueAsNumber: true })}
        />
        <Input
          label="Target"
          type="number"
          min={1}
          error={errors.plannedTargetValue?.message}
          {...register('plannedTargetValue', { valueAsNumber: true })}
        />
        <Input
          label="Pauza (s)"
          type="number"
          min={0}
          error={errors.restSeconds?.message}
          {...register('restSeconds', { valueAsNumber: true })}
        />
      </div>
      <Input
        label="Note (optional)"
        error={errors.notes?.message}
        {...register('notes')}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Anuleaza
          </Button>
        )}
        <Button type="submit" loading={loading}>
          Adauga in plan
        </Button>
      </div>
    </form>
  );
}
