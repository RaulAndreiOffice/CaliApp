import { Link } from 'react-router-dom';

export function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <h2 className="text-xl font-bold">Resetare parola</h2>
      <p className="text-sm text-muted-foreground">
        Functionalitatea de resetare a parolei va fi disponibila in curand.
      </p>
      <Link to="/login" className="text-sm text-primary hover:underline mt-3">
        Inapoi la login
      </Link>
    </div>
  );
}
