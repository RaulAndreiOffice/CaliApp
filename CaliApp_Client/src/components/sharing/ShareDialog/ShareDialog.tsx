import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { shareSchema, type ShareInput } from '../../../utils/validators';
import { useShareTable } from '../../../hooks/api/useSharing';
import { Dialog } from '../../ui/Dialog';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ShareDialogProps {
  open: boolean;
  tableId: string;
  onClose: () => void;
}

export function ShareDialog({ open, tableId, onClose }: Readonly<ShareDialogProps>) {
  const shareMutation = useShareTable(tableId);
  const { t } = useLanguage();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShareInput>({
    resolver: zodResolver(shareSchema),
    defaultValues: { permission: 'view' },
  });

  function onSubmit(data: ShareInput) {
    shareMutation.mutate(data, {
      onSuccess: () => {
        toast.success(t('sharing.dialog.toast.sent'));
        reset();
        onClose();
      },
      onError: () => {
        toast.error(t('sharing.dialog.toast.sendFailed'));
      },
    });
  }

  return (
    <Dialog open={open} title={t('sharing.dialog.shareTitle')} onClose={onClose}>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label={t('sharing.dialog.invite')}
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Select
          label={t('sharing.dialog.permission')}
          options={[
            { value: 'view', label: t('sharing.dialog.permission.viewLong') },
            { value: 'copy', label: t('sharing.dialog.permission.copyLong') },
          ]}
          error={errors.permission?.message}
          {...register('permission')}
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={shareMutation.isPending}>
            {t('sharing.dialog.send')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
