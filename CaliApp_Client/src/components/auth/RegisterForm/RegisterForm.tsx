import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerSchema, type RegisterInput } from '../../../utils/validators';
import { useRegister } from '../../../hooks/api/useAuth';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';

export function RegisterForm() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

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
        toast.success('Account created! Welcome to CaliAPP!');
        navigate('/dashboard', { replace: true });
      },
      onError: () => {
        toast.error('Registration failed');
      },
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="text-center mb-1">
        <h2 className="text-xl font-bold mb-1">Create your account</h2>
        <p className="text-sm text-muted-foreground/70">Incepe calatoria ta fitness</p>
      </div>

      <Input
        label="Username"
        placeholder="Enter your username"
        autoComplete="username"
        error={errors.username?.message}
        {...register('username')}
      />
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" loading={registerMutation.isPending} fullWidth size="lg">
        Create Account
      </Button>

      <div className="text-center">
        <Link
          to="/login"
          className="text-sm sm:text-base text-primary hover:underline min-h-[44px] inline-flex items-center"
        >
          Already have an account? Login
        </Link>
      </div>
    </form>
  );
}
