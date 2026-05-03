import { useState } from "react";
import { Banknote, Check, Copy, Eye, EyeOff, RefreshCw, ShieldCheck } from "lucide-react";

export interface BankInfo {
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  country?: string;
  linked_at?: string;
}

const COUNTRY_FLAGS: Record<string, { flag: string; label: string }> = {
  ghana:        { flag: "🇬🇭", label: "Ghana" },
  nigeria:      { flag: "🇳🇬", label: "Nigeria" },
  "south africa": { flag: "🇿🇦", label: "South Africa" },
  kenya:        { flag: "🇰🇪", label: "Kenya" },
};

interface Props {
  bankInfo: BankInfo | null;
  subaccountCode: string | null | undefined;
  onChangeBank: () => void;
}

export function LinkedBankCard({ bankInfo, subaccountCode, onChangeBank }: Props) {
  const [showFull, setShowFull] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAcct, setCopiedAcct] = useState(false);

  const acctRaw = bankInfo?.account_number ?? "";
  const acctDisplay = showFull
    ? acctRaw.replace(/(.{4})/g, "$1 ").trim()
    : acctRaw.length >= 4
    ? `•••• •••• ${acctRaw.slice(-4)}`
    : "••••";

  const copy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const countryInfo = bankInfo?.country
    ? COUNTRY_FLAGS[bankInfo.country.toLowerCase()] ?? { flag: "🌍", label: bankInfo.country }
    : null;

  const linkedDate = bankInfo?.linked_at
    ? new Date(bankInfo.linked_at).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-success/10 border-b border-success/20">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-success">
            Payouts active
          </span>
        </div>
        <button
          onClick={onChangeBank}
          className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border bg-background text-xs font-bold text-foreground hover:bg-accent transition-colors"
        >
          <RefreshCw size={11} />
          Change bank
        </button>
      </div>

      {/* Bank identity */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-brand-soft text-primary flex items-center justify-center shrink-0">
            <Banknote size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold truncate">
                {bankInfo?.bank_name ?? "Linked bank"}
              </span>
              {countryInfo && (
                <span className="text-xs text-muted-foreground">
                  {countryInfo.flag} {countryInfo.label}
                </span>
              )}
            </div>
            {bankInfo?.account_name && (
              <div className="text-sm font-semibold text-foreground mt-0.5 truncate">
                {bankInfo.account_name}
              </div>
            )}
          </div>
        </div>

        {/* Account number row */}
        {acctRaw && (
          <div className="mt-3 flex items-center justify-between gap-2 p-3 rounded-xl bg-muted/50 border border-border">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                Account number
              </div>
              <div className="font-mono text-sm font-semibold tracking-widest">
                {acctDisplay}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setShowFull((v) => !v)}
                className="h-8 w-8 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showFull ? "Hide account number" : "Show account number"}
              >
                {showFull ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              {showFull && (
                <button
                  onClick={() => copy(acctRaw, setCopiedAcct)}
                  className="h-8 w-8 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy account number"
                >
                  {copiedAcct ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Details grid */}
      <div className="px-4 pb-4 space-y-2">
        {subaccountCode && (
          <div className="flex items-center justify-between gap-2 py-2 border-t border-border">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Paystack subaccount
              </div>
              <div className="font-mono text-xs text-foreground/80 mt-0.5 truncate max-w-[200px]">
                {subaccountCode}
              </div>
            </div>
            <button
              onClick={() => copy(subaccountCode, setCopiedCode)}
              className="h-8 w-8 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Copy subaccount code"
            >
              {copiedCode ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </button>
          </div>
        )}

        {linkedDate && (
          <div className="flex items-center justify-between text-xs py-1.5 border-t border-border">
            <span className="text-muted-foreground">Date linked</span>
            <span className="font-medium">{linkedDate}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs py-1.5 border-t border-border">
          <span className="text-muted-foreground">Settlement</span>
          <span className="font-medium">~24 h after delivery confirmation</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-muted/30 border-t border-border flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <ShieldCheck size={11} className="text-success shrink-0" />
        Secured and settled by Paystack. Highest Wash never stores your full bank credentials.
      </div>
    </div>
  );
}
