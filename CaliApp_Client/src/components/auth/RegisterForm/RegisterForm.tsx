import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerSchema, type RegisterInput } from '../../../utils/validators';
import { useRegister } from '../../../hooks/api/useAuth';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { useLanguage } from '../../../contexts/LanguageContext';

export function RegisterForm() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  function onSubmit(data: RegisterInput) {
    const { confirmPassword: _confirmPassword, ...payload } = data;
    void _confirmPassword;
    registerMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t('auth.register.welcome'));
        navigate('/dashboard', { replace: true });
      },
      onError: () => {
        toast.error(t('auth.register.error'));
      },
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="text-center mb-1">
        <h2 className="text-xl font-bold mb-1">{t('auth.register.title')}</h2>
        <p className="text-sm text-muted-foreground/70">{t('auth.startJourney')}</p>
      </div>

      <Input
        label={t('auth.field.username')}
        placeholder={t('auth.field.username.placeholder')}
        autoComplete="username"
        error={errors.username?.message}
        {...register('username')}
      />
      <Input
        label={t('auth.field.email')}
        type="email"
        placeholder={t('auth.field.email.placeholder')}
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label={t('auth.field.password')}
        type="password"
        placeholder={t('auth.field.password.placeholder')}
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label={t('auth.field.confirmPassword')}
        type="password"
        placeholder={t('auth.field.confirmPassword.placeholder')}
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" loading={registerMutation.isPending} fullWidth size="lg">
        {t('auth.register.submit')}
      </Button>

      <div className="text-center">
        <Link
          to="/login"
          className="text-sm sm:text-base text-primary hover:underline min-h-[44px] inline-flex items-center"
        >
          {t('auth.register.toLogin')}
        </Link>
      </div>
    </form>
  );
}
