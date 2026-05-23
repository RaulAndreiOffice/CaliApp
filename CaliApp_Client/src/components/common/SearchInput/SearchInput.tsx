import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

export function SearchInput(props: Readonly<SearchInputProps>) {
  const { t } = useLanguage();
  const { placeholder, ...rest } = props;
  return (
    <div className="relative group">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors duration-200" />
      <input
        type="search"
        className="w-full pl-10 pr-4 py-3 bg-input-background/80 border border-input/50 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40 focus:shadow-[0_0_16px_rgba(132,255,0,0.08)] min-h-[44px] text-base transition-all duration-200"
        placeholder={placeholder ?? t('common.search')}
        {...rest}
      />
    </div>
  );
}
