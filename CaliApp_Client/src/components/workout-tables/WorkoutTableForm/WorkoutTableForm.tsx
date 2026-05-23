import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createWorkoutTableSchema,
  type CreateWorkoutTableInput,
} from '../../../utils/validators';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { useLanguage } from '../../../contexts/LanguageContext';

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
  submitLabel,
  loading,
}: WorkoutTableFormProps) {
  const { t } = useLanguage();
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
        label={t('plans.form.name')}
        placeholder={t('plans.form.namePlaceholder')}
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label={t('plans.form.descriptionOptional')}
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="flex justify-end gap-2 mt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {submitLabel ?? t('common.save')}
        </Button>
      </div>
    </form>
  );
}
