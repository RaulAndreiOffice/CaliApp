import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { Exercise } from '../../../types/exercise.types';

interface ExerciseCardProps {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const { t } = useLanguage();
  const measurementBadgeKey =
    exercise.measurementType === 'reps' ? 'exercises.filter.reps' : 'exercises.filter.time';

  return (
    <Link to={`/exercises/${exercise.id}`} className="block no-underline">
      <Card className="hover:border-primary/40 transition-colors duration-[var(--d-fast,160ms)]">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base sm:text-lg truncate">{exercise.name}</h3>
              {exercise.category && (
                <p className="text-xs sm:text-sm text-muted-foreground">{exercise.category}</p>
              )}
            </div>
            <Badge variant={exercise.measurementType === 'reps' ? 'default' : 'info'} className="shrink-0">
              {t(measurementBadgeKey)}
            </Badge>
          </div>

          {(exercise.defaultSets || exercise.defaultTargetValue) && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {exercise.defaultSets && (
                <div>
                  <p className="text-xs text-muted-foreground">{t('exercises.card.sets')}</p>
                  <p className="font-medium">{exercise.defaultSets}</p>
                </div>
              )}
              {exercise.defaultTargetValue && (
                <div>
                  <p className="text-xs text-muted-foreground">{t('exercises.card.target')}</p>
                  <p className="font-medium">
                    {exercise.defaultTargetValue}
                    {exercise.measurementType === 'time' ? t('common.seconds') : ''}
                  </p>
                </div>
              )}
            </div>
          )}

          {exercise.defaultRestSeconds ? (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t('exercises.card.rest', { seconds: exercise.defaultRestSeconds })}</span>
            </div>
          ) : null}

          {exercise.isGlobal && (
            <div className="pt-2 border-t border-border">
              <Badge variant="info">{t('exercises.card.global')}</Badge>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
