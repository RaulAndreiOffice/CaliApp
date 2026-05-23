import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { SearchInput } from '../../../components/common/SearchInput/SearchInput';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Select } from '../../../components/ui/Select';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { ExerciseList } from '../../../components/exercises/ExerciseList/ExerciseList';
import { ExerciseForm } from '../../../components/exercises/ExerciseForm/ExerciseForm';
import { useCreateExercise, useExercises } from '../../../hooks/api/useExercises';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { MeasurementType } from '../../../types/exercise.types';

type Filter = 'all' | MeasurementType;

export function ExercisesPage() {
  const { data, isLoading } = useExercises();
  const createMutation = useCreateExercise();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    return (data ?? []).filter((ex) => {
      const matchesQuery = ex.name.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === 'all' || ex.measurementType === filter;
      return matchesQuery && matchesFilter;
    });
  }, [data, query, filter]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('exercises.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{t('exercises.page.subtitle')}</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
          {t('common.add')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-3">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('exercises.page.searchPlaceholder')}
        />
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          options={[
            { value: 'all', label: t('exercises.category.all') },
            { value: 'reps', label: t('exercises.filter.reps') },
            { value: 'time', label: t('exercises.filter.time') },
          ]}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner label={t('common.loading')} />
      ) : (
        <ExerciseList exercises={filtered} />
      )}

      <Dialog
        open={dialogOpen}
        title={t('exercises.page.dialog.addTitle')}
        onClose={() => setDialogOpen(false)}
      >
        <ExerciseForm
          onSubmit={(payload) =>
            createMutation.mutate(payload, {
              onSuccess: () => {
                toast.success(t('exercises.toast.created'));
                setDialogOpen(false);
              },
              onError: () => toast.error(t('exercises.toast.createFailed')),
            })
          }
          onCancel={() => setDialogOpen(false)}
          loading={createMutation.isPending}
        />
      </Dialog>
    </div>
  );
}
