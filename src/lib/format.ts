// Re-export locale-aware money formatter as a hook so existing imports can
// migrate gradually. Components should prefer `useLocale().format` directly.
import { useLocale } from "./locale";

export function useMoneyFormatter() {
  return useLocale().format;
}
