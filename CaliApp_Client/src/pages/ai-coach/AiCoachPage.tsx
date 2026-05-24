import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';

export function AiCoachPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24 gap-5">
      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 glow-lime">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold">{t('aiCoach.heading')}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{t('aiCoach.subtitle')}</p>
      </div>
      <Button variant="secondary" onClick={() => navigate('/dashboard')}>
        {t('aiCoach.back')}
      </Button>
    </div>
  );
}
