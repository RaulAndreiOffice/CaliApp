import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ErrorMessageProps {
  message?: string;
}

export function ErrorMessage({ message }: Readonly<ErrorMessageProps>) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg" role="alert">
      <AlertCircle size={18} />
      <span className="text-sm">{message ?? t('common.aria.error')}</span>
    </div>
  );
}
