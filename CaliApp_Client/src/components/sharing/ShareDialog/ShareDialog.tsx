import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { shareSchema, type ShareInput } from '../../../utils/validators';
import { useShareTable } from '../../../hooks/api/useSharing';
import { Dialog } from '../../ui/Dialog';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';

interface ShareDialogProps {
  open: boolean;
  tableId: string;
  onClose: () => void;
}

export function ShareDialog({ open, tableId, onClose }: ShareDialogProps) {
  const shareMutation = useShareTable(tableId);
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
        toast.success('Plan trimis!');
        reset();
        onClose();
      },
      onError: () => {
        toast.error('Trimiterea a esuat');
      },
    });
  }

  return (
    <Dialog open={open} title="Share plan" onClose={onClose}>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email destinatar"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Select
          label="Permisiune"
          options={[
            { value: 'view', label: 'View — doar vizualizare' },
            { value: 'copy', label: 'Copy — poate copia in cont' },
          ]}
          error={errors.permission?.message}
          {...register('permission')}
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Anuleaza
          </Button>
          <Button type="submit" loading={shareMutation.isPending}>
            Trimite
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
