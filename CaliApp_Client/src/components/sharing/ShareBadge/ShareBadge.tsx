import { Badge } from '../../ui/Badge';
import type { SharePermission } from '../../../types/sharing.types';

interface ShareBadgeProps {
  permission: SharePermission;
}

export function ShareBadge({ permission }: ShareBadgeProps) {
  return (
    <Badge variant={permission === 'copy' ? 'success' : 'info'}>
      {permission === 'copy' ? 'Copy' : 'View'}
    </Badge>
  );
}
