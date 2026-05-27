import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { ExerciseInsight, LearningState } from '../../../types/stats.types';

interface Props {
  exercises: ExerciseInsight[];
  learningState: LearningState;
}

export function SmartWarnings({ exercises, learningState }: Readonly<Props>) {
  const { t } = useLanguage();

  if (learningState.isLearning) {
    return (
      <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-100 leading-relaxed">
          {t('dashboard.progress.warnings.learning')}
        </p>
      </div>
    );
  }

  const flagged = exercises.filter((ex) => ex.warning !== null);

  if (flagged.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        {t('dashboard.progress.warnings.empty')}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {flagged.map((ex) => {
        const w = ex.warning!;
        const Icon = w.kind === 'drop' ? TrendingDown : TrendingUp;
        const ringClass = w.kind === 'drop'
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          : 'bg-red-500/10 border-red-500/30 text-red-200';
        return (
          <li
            key={ex.exerciseId}
            className={`flex items-start gap-3 p-3 border rounded-lg ${ringClass}`}
          >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{ex.name}</p>
              <p className="text-xs opacity-90 leading-relaxed">{w.message}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
