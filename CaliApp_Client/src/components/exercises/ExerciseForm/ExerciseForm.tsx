import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createExerciseSchema,
  type CreateExerciseInput,
} from '../../../utils/validators';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';

interface ExerciseFormProps {
  defaultValues?: Partial<CreateExerciseInput>;
  onSubmit: (data: CreateExerciseInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export function ExerciseForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Salveaza',
  loading,
}: ExerciseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateExerciseInput>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      measurementType: 'reps',
      ...defaultValues,
    },
  });

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Nume exercitiu"
        placeholder="ex: Push Up"
        error={errors.name?.message}
        {...register('name')}
      />
      <Select
        label="Tip masurare"
        options={[
          { value: 'reps', label: 'Repetari (reps)' },
          { value: 'time', label: 'Timp (secunde)' },
        ]}
        error={errors.measurementType?.message}
        {...register('measurementType')}
      />
      <Input
        label="Categorie"
        placeholder="ex: piept, spate"
        error={errors.category?.message}
        {...register('category')}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Serii default"
          type="number"
          min={1}
          error={errors.defaultSets?.message}
          {...register('defaultSets', { valueAsNumber: true })}
        />
        <Input
          label="Target default"
          type="number"
          min={1}
          error={errors.defaultTargetValue?.message}
          {...register('defaultTargetValue', { valueAsNumber: true })}
        />
        <Input
          label="Pauza (s)"
          type="number"
          min={0}
          error={errors.defaultRestSeconds?.message}
          {...register('defaultRestSeconds', { valueAsNumber: true })}
        />
      </div>
      <Input
        label="Descriere (optional)"
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 mt-2 flex justify-end gap-2 border-t border-border/30 bg-card/95 px-4 sm:px-6 py-3 backdrop-blur">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Anuleaza
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
