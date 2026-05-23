import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { ShareBadge } from '../ShareBadge/ShareBadge';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { Share } from '../../../types/sharing.types';

interface SharedTableCardProps {
  share: Share;
  onCopy?: (shareId: string) => void;
  copying?: boolean;
}

export function SharedTableCard({ share, onCopy, copying }: Readonly<SharedTableCardProps>) {
  const { t } = useLanguage();
  const canCopy = share.permission === 'copy';

  return (
    <Card className="hover:border-primary/40 transition-colors duration-[var(--d-fast,160ms)]">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-base sm:text-lg">
            {share.workoutTable?.name ?? t('sharing.card.unknownPlan')}
          </h3>
          <ShareBadge permission={share.permission} />
        </div>
        <p className="text-sm text-muted-foreground">
          {t('sharing.from')} <strong>{share.sharedByUser?.username ?? t('sharing.card.unknownUser')}</strong>
        </p>
        {canCopy && onCopy && (
          <Button
            type="button"
            size="sm"
            loading={copying}
            onClick={() => onCopy(share.id)}
          >
            {t('sharing.card.copyAccount')}
          </Button>
        )}
      </div>
    </Card>
  );
}
