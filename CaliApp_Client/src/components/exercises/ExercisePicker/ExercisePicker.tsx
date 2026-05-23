import { useState } from 'react';
import { useExercises } from '../../../hooks/api/useExercises';
import { SearchInput } from '../../common/SearchInput/SearchInput';
import { LoadingSpinner } from '../../common/LoadingSpinner/LoadingSpinner';
import { Badge } from '../../ui/Badge';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { Exercise } from '../../../types/exercise.types';

interface ExercisePickerProps {
  selectedId?: string;
  onSelect: (exercise: Exercise) => void;
}

export function ExercisePicker({ selectedId, onSelect }: Readonly<ExercisePickerProps>) {
  const { data, isLoading } = useExercises();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');

  if (isLoading) return <LoadingSpinner label={t('common.loading')} />;

  const filtered = (data ?? []).filter((ex) =>
    ex.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('workout.exercisePicker.placeholder')}
      />
      <ul className="flex flex-col max-h-80 overflow-y-auto border border-border rounded-lg">
        {filtered.map((ex) => {
          const badgeKey = ex.measurementType === 'reps' ? 'exercises.filter.reps' : 'exercises.filter.time';
          return (
            <li key={ex.id} className="border-b border-border last:border-b-0">
              <button
                type="button"
                onClick={() => onSelect(ex)}
                className={`w-full flex items-center justify-between p-3 text-left cursor-pointer transition-colors hover:bg-muted/30 ${
                  ex.id === selectedId ? 'bg-primary/10 text-primary' : ''
                }`}
              >
                <span>{ex.name}</span>
                <Badge variant={ex.measurementType === 'reps' ? 'default' : 'info'}>
                  {t(badgeKey)}
                </Badge>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="p-4 text-center text-sm text-muted-foreground">{t('workout.exercisePicker.empty')}</li>
        )}
      </ul>
    </div>
  );
}
