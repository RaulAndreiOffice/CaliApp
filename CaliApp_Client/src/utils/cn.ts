type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | Record<string, boolean | undefined | null>;

export function cn(...values: ClassValue[]) {
  return values
    .flatMap((value) => {
      if (!value) return [];
      if (typeof value === 'string' || typeof value === 'number') {
        return [String(value)];
      }
      return Object.entries(value)
        .filter(([, enabled]) => Boolean(enabled))
        .map(([className]) => className);
    })
    .join(' ');
}
