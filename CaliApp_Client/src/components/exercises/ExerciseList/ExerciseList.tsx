import { ExerciseCard } from '../ExerciseCard/ExerciseCard';
import { EmptyState } from '../../common/EmptyState/EmptyState';
import type { Exercise } from '../../../types/exercise.types';

interface ExerciseListProps {
  exercises: Exercise[];
}

export function ExerciseList({ exercises }: ExerciseListProps) {
  if (exercises.length === 0) {
    return (
      <EmptyState
        title="Niciun exercitiu inca"
        description="Adauga primul tau exercitiu personalizat."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {exercises.map((ex) => (
        <ExerciseCard key={ex.id} exercise={ex} />
      ))}
    </div>
  );
}
