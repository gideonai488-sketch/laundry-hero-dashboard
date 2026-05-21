import { useEffect, useMemo, useState } from "react";
import { Loader2, Check, X, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  listBanks,
  resolveAccount,
  createSubaccount,
  type PaystackBank,
} from "@/lib/paystack";

interface Props {
  open: boolean;
  onClose: () => void;
  onLinked?: (subaccountCode: string) => void;
}

const COUNTRIES = [
  { code: "ghana", label: "Ghana 🇬🇭" },
  { code: "nigeria", label: "Nigeria 🇳🇬" },
  { code: "south africa", label: "South Africa 🇿🇦" },
  { code: "kenya", label: "Kenya 🇰🇪" },
];

export function LinkBankSheet({ open, onClose, onLinked }: Props) {
  const { merchant, user, refresh } = useAuth();
  const [country, setCountry] = useState("ghana");
  const [banks, setBanks] = useState<PaystackBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [search, setSearch] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [manualName, setManualName] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoadingBanks(true);
    setBanks([]);
    setBankCode("");
    listBanks(country)
      .then((list) => {
        // Deduplicate by code — Paystack occasionally returns duplicate entries
        const seen = new Set<string>();
        setBanks(list.filter((b) => (seen.has(b.code) ? false : seen.add(b.code) && true)));
      })
      .catch((e) => toast.error(e.message ?? "Couldn't load banks"))
      .finally(() => setLoadingBanks(false));
  }, [country, open]);

  useEffect(() => {
    setResolvedName(null);
    setResolveError(null);
    if (!bankCode || accountNumber.length < 8) return;
    let cancel = false;
    setResolving(true);
    const t = setTimeout(() => {
      resolveAccount(accountNumber, bankCode)
        .then((r) => {
          if (!cancel) setResolvedName(r.account_name);
        })
        .catch((e) => {
          if (!cancel) setResolveError(e.message ?? "Couldn't verify account");
        })
        .finally(() => {
          if (!cancel) setResolving(false);
        });
    }, 350);
    return () => {
      cancel = true;
      clearTimeout(t);
      setResolving(false);
    };
  }, [bankCode, accountNumber]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return banks;
    return banks.filter((b) => b.name.toLowerCase().includes(q));
  }, [banks, search]);

  const selectedBank = banks.find((b) => b.code === bankCode);

  const confirmedName = resolvedName || manualName.trim();

  const submit = async () => {
    if (!merchant || !confirmedName || !selectedBank) return;
    setSubmitting(true);
    try {
      const r = await createSubaccount({
        merchant_id: merchant.id,
        business_name: merchant.business_name ?? "Highest Wash Merchant",
        bank_code: selectedBank.code,
        account_number: accountNumber,
        primary_contact_email: user?.email ?? merchant.email ?? undefined,
        primary_contact_name: confirmedName,
        primary_contact_phone: merchant.phone ?? undefined,
      });
      // Persist on merchant row in case the function didn't write it.
      await supabase
        .from("merchants")
        .update({ paystack_subaccount_code: r.subaccount_code })
        .eq("id", merchant.id);
      // Cache human-readable bank details locally so the Wallet card can
      // show bank name + masked account without an extra round-trip.
      try {
        localStorage.setItem(
          `hw-merchant-bank:${merchant.id}`,
          JSON.stringify({
            bank_name: selectedBank.name,
            account_number: accountNumber,
            account_name: confirmedName,
            country,
            linked_at: new Date().toISOString(),
          })
        );
      } catch {}
      await refresh();
      toast.success("Bank linked! Payouts are now active.");
      onLinked?.(r.subaccount_code);
      onClose();
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't link bank");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">Link bank account</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <ShieldCheck size={12} /> Verified by Paystack
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-accent flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="text-xs font-bold mb-1.5 block">Country</label>
            <div className="grid grid-cols-2 gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCountry(c.code)}
                  className={`h-10 rounded-xl text-sm font-bold border transition-smooth ${
                    country === c.code
                      ? "bg-gradient-brand text-primary-foreground border-transparent shadow-brand"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold mb-1.5 block">Bank</label>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search banks…"
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-card">
              {loadingBanks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-primary" size={18} />
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No banks found
                </div>
              ) : (
                filtered.map((b) => (
                  <button
                    key={b.id != null ? String(b.id) : b.code}
                    onClick={() => setBankCode(b.code)}
                    className={`w-full text-left px-3 py-2.5 text-sm border-b border-border last:border-0 flex items-center justify-between ${
                      bankCode === b.code ? "bg-primary/10 text-primary font-bold" : ""
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                    {bankCode === b.code && <Check size={14} />}
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold mb-1.5 block">Account number</label>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              maxLength={20}
              placeholder="0123456789"
              disabled={!bankCode}
              className="w-full h-11 px-3 rounded-xl bg-card border border-border text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
            {!bankCode && (
              <p className="text-[11px] text-muted-foreground mt-1">Pick a bank first.</p>
            )}
          </div>

          {bankCode && accountNumber.length >= 8 && (
            <div className="rounded-xl border border-border bg-card p-3 space-y-2">
              {resolving && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="animate-spin" size={14} /> Verifying account…
                </div>
              )}
              {!resolving && resolvedName && (
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
                    <Check size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      Account holder
                    </div>
                    <div className="font-bold text-sm truncate">{resolvedName}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {selectedBank?.name} · {accountNumber}
                    </div>
                  </div>
                </div>
              )}
              {!resolving && resolveError && (
                <>
                  <div className="text-xs text-muted-foreground mb-1">
                    Enter your account name to continue.
                  </div>
                  <input
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. JOHN DOE MENSAH"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-semibold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-5 pt-3 pb-5 border-t border-border bg-background">
          <button
            onClick={submit}
            disabled={!confirmedName || submitting}
            className="w-full h-12 rounded-2xl bg-gradient-brand text-primary-foreground font-bold shadow-brand disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : null}
            {submitting ? "Linking…" : "Confirm & link bank"}
          </button>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            By linking, Paystack will settle payouts to this account ~24 h after each delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
