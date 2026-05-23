import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginSchema, type LoginInput } from '../../../utils/validators';
import { useLogin } from '../../../hooks/api/useAuth';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { useLanguage } from '../../../contexts/LanguageContext';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  function onSubmit(data: LoginInput) {
    login.mutate(data, {
      onSuccess: () => {
        const target =
          (location.state as { from?: string } | null)?.from ?? '/dashboard';
        navigate(target, { replace: true });
      },
      onError: () => {
        toast.error(t('auth.login.error'));
      },
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="text-center mb-1">
        <h2 className="text-xl font-bold mb-1">{t('auth.login.title')}</h2>
        <p className="text-sm text-muted-foreground/70">{t('auth.continueShort')}</p>
      </div>

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
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" loading={login.isPending} fullWidth size="lg">
        {t('auth.login.submit')}
      </Button>

      <div className="text-center">
        <Link
          to="/register"
          className="text-sm sm:text-base text-primary hover:underline min-h-[44px] inline-flex items-center"
        >
          {t('auth.login.toRegister')}
        </Link>
      </div>

      <div className="text-center">
        <Link
          to="/forgot-password"
          className="text-sm sm:text-base text-muted-foreground hover:text-foreground min-h-[44px] inline-flex items-center"
        >
          {t('auth.login.forgot')}
        </Link>
      </div>
    </form>
  );
}
