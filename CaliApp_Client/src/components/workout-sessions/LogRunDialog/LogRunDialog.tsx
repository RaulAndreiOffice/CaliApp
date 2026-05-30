import { useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog } from '../../ui/Dialog';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { useLogCardio } from '../../../hooks/api/useWorkoutSessions';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getServerErrorMessage } from '../../../utils/errors';

interface Props {
  open: boolean;
  onClose: () => void;
}

// Local yyyy-mm-dd (not UTC) so the date picker defaults to the user's today.
function todayLocalDate(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export function LogRunDialog({ open, onClose }: Readonly<Props>) {
  const { t } = useLanguage();
  const logCardio = useLogCardio();
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(todayLocalDate());
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setDistance('');
    setDuration('');
    setDate(todayLocalDate());
    setError(null);
  };

  const close = () => {
    if (logCardio.isPending) return;
    reset();
    onClose();
  };

  const submit = () => {
    const km = Number.parseFloat(distance.replace(',', '.'));
    if (!Number.isFinite(km) || km <= 0) {
      setError(t('sessions.run.distanceRequired'));
      return;
    }
    const hasDuration = duration.trim() !== '';
    const minutes = hasDuration ? Number.parseInt(duration, 10) : undefined;
    if (minutes !== undefined && (!Number.isFinite(minutes) || minutes <= 0)) {
      setError(t('sessions.run.durationInvalid'));
      return;
    }
    // Anchor the chosen day at local noon before converting to ISO so the run
    // doesn't slip to the previous day in negative-offset timezones.
    const iso = date ? new Date(`${date}T12:00:00`).toISOString() : undefined;

    logCardio.mutate(
      {
        distanceKm: Math.round(km * 100) / 100,
        durationMinutes: minutes,
        date: iso,
      },
      {
        onSuccess: () => {
          toast.success(t('sessions.toast.runLogged'));
          reset();
          onClose();
        },
        onError: (err) => setError(getServerErrorMessage(err, t('sessions.toast.runFailed'))),
      },
    );
  };

  return (
    <Dialog
      open={open}
      title={t('sessions.run.title')}
      onClose={close}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={close} disabled={logCardio.isPending}>
            {t('common.cancel')}
          </Button>
          <Button size="sm" onClick={submit} loading={logCardio.isPending}>
            {t('sessions.run.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('sessions.run.subtitle')}</p>
        <Input
          label={t('sessions.run.distance')}
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          autoFocus
          placeholder={t('sessions.run.distancePlaceholder')}
          value={distance}
          onChange={(e) => {
            setDistance(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
        <Input
          label={`${t('sessions.run.duration')} (${t('common.optional')})`}
          type="number"
          inputMode="numeric"
          min={0}
          step="1"
          placeholder={t('sessions.run.durationPlaceholder')}
          value={duration}
          onChange={(e) => {
            setDuration(e.target.value);
            setError(null);
          }}
        />
        <Input
          label={t('sessions.run.date')}
          type="date"
          value={date}
          max={todayLocalDate()}
          onChange={(e) => setDate(e.target.value)}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </Dialog>
  );
}
