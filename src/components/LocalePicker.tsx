import { useLocale, countries, currencies, languages, languageNames, type CurrencyCode, type LanguageCode } from "@/lib/locale";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export function LocalePicker({ onClose }: { onClose: () => void }) {
  const { country, currency, language, setCountry, setCurrency, setLanguage, fx } = useLocale();
  return (
    <div className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border shadow-brand max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="font-bold">Region & language</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              1 USD ≈ <span className="font-bold tabular-nums">{fx.toFixed(2)} {currency.code}</span> · live rate
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-2 py-3 space-y-4">
          <Section title="Country">
            <div className="grid grid-cols-2 gap-1.5">
              {countries.map((c) => {
                const sel = c.code === country.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => { setCountry(c.code); toast.success(`Switched to ${c.name} · ${c.currency}`); }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-smooth ${
                      sel ? "bg-gradient-brand-soft border-primary/40" : "bg-card border-border hover:bg-accent"
                    }`}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground">{c.currency} · {languageNames[c.language]}</div>
                    </div>
                    {sel && <Check size={14} className="text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Currency">
            <div className="grid grid-cols-3 gap-1.5">
              {Object.values(currencies).map((c) => {
                const sel = c.code === currency.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => { setCurrency(c.code as CurrencyCode); toast.success(`Currency: ${c.code}`); }}
                    className={`p-2 rounded-xl border text-xs font-bold ${
                      sel ? "bg-gradient-brand text-primary-foreground border-transparent shadow-brand" : "bg-card border-border hover:bg-accent"
                    }`}
                  >
                    {c.code}
                    <div className={`text-[10px] font-normal mt-0.5 ${sel ? "text-white/80" : "text-muted-foreground"}`}>
                      {c.symbol.trim() || c.code}
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Language">
            <div className="grid grid-cols-2 gap-1.5">
              {languages.map((l) => {
                const sel = l === language;
                return (
                  <button
                    key={l}
                    onClick={() => { setLanguage(l as LanguageCode); toast.success(`Language: ${languageNames[l]}`); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-smooth ${
                      sel ? "bg-gradient-brand-soft border-primary/40" : "bg-card border-border hover:bg-accent"
                    }`}
                  >
                    {languageNames[l]}
                    <div className={`text-[10px] font-normal mt-0.5 ${sel ? "text-primary" : "text-muted-foreground"}`}>{l.toUpperCase()}</div>
                  </button>
                );
              })}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}
