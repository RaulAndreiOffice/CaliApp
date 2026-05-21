import { SetInput } from '../SetInput/SetInput';
import type { PerformedSet } from '../../../types/performedSet.types';

interface SetsListProps {
  plannedSets: number;
  measurementType: 'reps' | 'time';
  performedSets: PerformedSet[];
  onSetSubmit: (setNumber: number, value: number) => void;
}

export function SetsList({
  plannedSets,
  measurementType,
  performedSets,
  onSetSubmit,
}: SetsListProps) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: plannedSets }, (_, i) => {
        const setNumber = i + 1;
        const existing = performedSets.find((s) => s.setNumber === setNumber);
        return (
          <SetInput
            key={setNumber}
            setNumber={setNumber}
            initialValue={existing?.actualValue}
            measurementType={measurementType}
            completed={!!existing}
            onSubmit={(value) => onSetSubmit(setNumber, value)}
          />
        );
      })}
    </div>
  );
}
