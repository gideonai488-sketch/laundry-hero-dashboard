import { Globe } from "lucide-react";
import { useLocale } from "@/lib/locale";
import { useState } from "react";
import { LocalePicker } from "./LocalePicker";

export function LocaleBadge() {
  const { country, currency, fx, detected } = useLocale();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border text-[11px] font-bold hover:bg-accent transition-smooth"
        aria-label="Change country, currency or language"
        title={detected ? `Auto-detected · 1 USD ≈ ${fx.toFixed(2)} ${currency.code}` : "Detecting…"}
      >
        <span className="text-base leading-none">{country.flag}</span>
        <span>{currency.code}</span>
        <Globe size={11} className="opacity-60" />
      </button>
      {open && <LocalePicker onClose={() => setOpen(false)} />}
    </>
  );
}
