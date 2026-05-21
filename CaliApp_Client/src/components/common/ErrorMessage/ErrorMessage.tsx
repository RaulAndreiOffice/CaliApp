import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
}

export function ErrorMessage({ message = 'An error occurred.' }: ErrorMessageProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg" role="alert">
      <AlertCircle size={18} />
      <span className="text-sm">{message}</span>
    </div>
  );
}
