import { useState } from 'react';
import { useExercises } from '../../../hooks/api/useExercises';
import { SearchInput } from '../../common/SearchInput/SearchInput';
import { LoadingSpinner } from '../../common/LoadingSpinner/LoadingSpinner';
import { Badge } from '../../ui/Badge';
import type { Exercise } from '../../../types/exercise.types';

interface ExercisePickerProps {
  selectedId?: string;
  onSelect: (exercise: Exercise) => void;
}

export function ExercisePicker({ selectedId, onSelect }: ExercisePickerProps) {
  const { data, isLoading } = useExercises();
  const [query, setQuery] = useState('');

  if (isLoading) return <LoadingSpinner label="Se incarca exercitiile..." />;

  const filtered = (data ?? []).filter((ex) =>
    ex.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cauta exercitii..."
      />
      <ul className="flex flex-col max-h-80 overflow-y-auto border border-border rounded-lg">
        {filtered.map((ex) => (
          <li
            key={ex.id}
            className={`flex items-center justify-between p-3 cursor-pointer border-b border-border last:border-b-0 transition-colors hover:bg-muted/30 ${
              ex.id === selectedId ? 'bg-primary/10 text-primary' : ''
            }`}
            onClick={() => onSelect(ex)}
          >
            <span>{ex.name}</span>
            <Badge variant={ex.measurementType === 'reps' ? 'default' : 'info'}>
              {ex.measurementType}
            </Badge>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="p-4 text-center text-sm text-muted-foreground">Niciun rezultat</li>
        )}
      </ul>
    </div>
  );
}
