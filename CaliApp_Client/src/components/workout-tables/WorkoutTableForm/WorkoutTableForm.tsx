import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createWorkoutTableSchema,
  type CreateWorkoutTableInput,
} from '../../../utils/validators';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';

interface WorkoutTableFormProps {
  defaultValues?: Partial<CreateWorkoutTableInput>;
  onSubmit: (data: CreateWorkoutTableInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export function WorkoutTableForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Salveaza',
  loading,
}: WorkoutTableFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateWorkoutTableInput>({
    resolver: zodResolver(createWorkoutTableSchema),
    defaultValues,
  });

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Nume plan"
        placeholder="ex: Push Day"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Descriere (optional)"
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="flex justify-end gap-2 mt-2">
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
