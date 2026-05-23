import { Badge } from '../../ui/Badge';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { SharePermission } from '../../../types/sharing.types';

interface ShareBadgeProps {
  permission: SharePermission;
}

export function ShareBadge({ permission }: Readonly<ShareBadgeProps>) {
  const { t } = useLanguage();
  return (
    <Badge variant={permission === 'copy' ? 'success' : 'info'}>
      {permission === 'copy' ? t('sharing.permission.copy') : t('sharing.permission.view')}
    </Badge>
  );
}
