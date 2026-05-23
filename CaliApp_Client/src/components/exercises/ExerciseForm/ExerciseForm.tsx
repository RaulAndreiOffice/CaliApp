import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createExerciseSchema,
  type CreateExerciseInput,
} from '../../../utils/validators';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { useLanguage } from '../../../contexts/LanguageContext';

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
  submitLabel,
  loading,
}: ExerciseFormProps) {
  const { t } = useLanguage();
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
        label={t('exercises.form.name')}
        placeholder={t('exercises.form.namePlaceholder')}
        error={errors.name?.message}
        {...register('name')}
      />
      <Select
        label={t('exercises.form.measurementType')}
        options={[
          { value: 'reps', label: t('exercises.form.measurementType.reps') },
          { value: 'time', label: t('exercises.form.measurementType.time') },
        ]}
        error={errors.measurementType?.message}
        {...register('measurementType')}
      />
      <Input
        label={t('exercises.form.category')}
        placeholder={t('exercises.form.categoryPlaceholder')}
        error={errors.category?.message}
        {...register('category')}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label={t('exercises.form.defaultSets')}
          type="number"
          min={1}
          error={errors.defaultSets?.message}
          {...register('defaultSets', { valueAsNumber: true })}
        />
        <Input
          label={t('exercises.form.defaultTargetValue')}
          type="number"
          min={1}
          error={errors.defaultTargetValue?.message}
          {...register('defaultTargetValue', { valueAsNumber: true })}
        />
        <Input
          label={t('exercises.form.defaultRestSeconds')}
          type="number"
          min={0}
          error={errors.defaultRestSeconds?.message}
          {...register('defaultRestSeconds', { valueAsNumber: true })}
        />
      </div>
      <Input
        label={t('exercises.form.descriptionOptional')}
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 mt-2 flex justify-end gap-2 border-t border-border/30 bg-card/95 px-4 sm:px-6 py-3 backdrop-blur">
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
