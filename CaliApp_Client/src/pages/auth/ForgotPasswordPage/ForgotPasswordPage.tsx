import { Link } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

export function ForgotPasswordPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <h2 className="text-xl font-bold">{t('auth.forgot.title')}</h2>
      <p className="text-sm text-muted-foreground">{t('auth.forgot.subtitle')}</p>
      <Link to="/login" className="text-sm text-primary hover:underline mt-3">
        {t('auth.forgot.toLogin')}
      </Link>
    </div>
  );
}
