import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AlertTriangle, Banknote, CheckCircle2, Loader2, LocateFixed, LogOut, MapPin, Phone, Power, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteCurrentAccount } from "@/lib/account.functions";
import { useAuth } from "@/lib/auth";
import { useToggleOnline, useUpdateMerchant } from "@/lib/queries";
import { getCurrentPosition } from "@/lib/geo";
import { supabase } from "@/lib/supabase";
import { LinkedBankCard, type BankInfo } from "@/components/LinkedBankCard";
import { LinkBankSheet } from "@/components/LinkBankSheet";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — Highest Wash Merchant" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { merchant, refresh, session, signOut } = useAuth();
  const update = useUpdateMerchant();
  const toggleOnline = useToggleOnline();
  const deleteAccountFn = useServerFn(deleteCurrentAccount);

  const [form, setForm] = useState({
    business_name: "",
    phone: "",
    address: "",
    lat: "",
    lng: "",
  });
  const [geoLoading, setGeoLoading] = useState(false);

  const detectLocation = async () => {
    setGeoLoading(true);
    try {
      const coords = await getCurrentPosition();
      setForm((p) => ({
        ...p,
        lat: coords.lat.toFixed(6),
        lng: coords.lng.toFixed(6),
      }));
      toast.success("Location updated — save changes to apply.");
    } catch (err: any) {
      toast.error(err?.message ?? "Couldn't detect location. Check app permissions.");
    } finally {
      setGeoLoading(false);
    }
  };
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);

  useEffect(() => {
    if (!merchant?.id) return;
    try {
      const raw = localStorage.getItem(`hw-merchant-bank:${merchant.id}`);
      setBankInfo(raw ? JSON.parse(raw) : null);
    } catch {
      setBankInfo(null);
    }
  }, [merchant?.id, linkOpen]);

  useEffect(() => {
    if (merchant) {
      setForm({
        business_name: merchant.business_name ?? "",
        phone: merchant.phone ?? "",
        address: merchant.address ?? "",
        lat: merchant.lat != null ? String(merchant.lat) : "",
        lng: merchant.lng != null ? String(merchant.lng) : "",
      });
    }
  }, [merchant]);

  if (!merchant) return null;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(
      {
        merchantId: merchant.id,
        patch: {
          business_name: form.business_name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          lat: form.lat ? Number(form.lat) : null,
          lng: form.lng ? Number(form.lng) : null,
        },
      },
      {
        onSuccess: async () => {
          toast.success("Saved.");
          await refresh();
        },
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  const confirmSignOut = () => {
    if (confirm("Sign out of Highest Wash?")) signOut();
  };

  const confirmDeleteAccount = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in again before deleting your account.");
      return;
    }
    if (deletePhrase.trim().toUpperCase() !== "DELETE") {
      toast.error('Type DELETE to confirm.');
      return;
    }
    setDeletingAccount(true);
    try {
      await deleteAccountFn({ data: { accessToken: session.access_token } });
      await supabase.auth.signOut();
      toast.success("Your account has been deleted.");
      window.location.assign("/");
    } catch (err: any) {
      toast.error(err?.message ?? "Couldn't delete account.");
    } finally {
      setDeletingAccount(false);
      setDeleteOpen(false);
      setDeletePhrase("");
    }
  };

  const setOnline = (v: boolean) => {
    toggleOnline.mutate(
      { merchantId: merchant.id, online: v },
      { onSuccess: refresh, onError: (e: any) => toast.error(e.message) }
    );
  };

  return (
    <div>
      <AppHeader title="Settings" subtitle="Shop preferences & payouts" />

      {/* Online toggle */}
      <section className="px-5 mt-2">
        <div className="rounded-2xl bg-card border border-border shadow-card p-4 flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${merchant.online ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
            <Power size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm">{merchant.online ? "Shop is online" : "Shop is offline"}</div>
            <div className="text-xs text-muted-foreground">
              {merchant.online ? "Receiving live broadcast orders." : "Customers won't see you in the broadcast pool."}
            </div>
          </div>
          <button
            onClick={() => setOnline(!merchant.online)}
            disabled={toggleOnline.isPending}
            className={`px-3 h-10 rounded-xl text-xs font-bold ${merchant.online ? "border border-border" : "bg-gradient-brand text-primary-foreground shadow-brand"}`}
          >
            {merchant.online ? "Go offline" : "Go online"}
          </button>
        </div>
      </section>

      {/* Shop details */}
      <section className="px-5 mt-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Shop details</h2>
        <form onSubmit={save} className="space-y-3 bg-card border border-border rounded-2xl p-4 shadow-card">
          <div className="space-y-1.5">
            <Label htmlFor="biz" className="flex items-center gap-1.5 text-xs"><Store size={12} /> Business name</Label>
            <Input id="biz" value={form.business_name} onChange={set("business_name")} className="h-11 rounded-xl" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs"><Phone size={12} /> Phone</Label>
            <Input id="phone" value={form.phone} onChange={set("phone")} className="h-11 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address" className="flex items-center gap-1.5 text-xs"><MapPin size={12} /> Pickup address</Label>
            <Input id="address" value={form.address} onChange={set("address")} className="h-11 rounded-xl" />
          </div>
          {/* GPS — powers the 15 km job matching radius */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs"><LocateFixed size={12} /> Shop location (15 km job radius)</Label>
            {form.lat && form.lng ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/30">
                <CheckCircle2 size={15} className="text-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-success">Location set</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{form.lat}, {form.lng}</div>
                </div>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={geoLoading}
                  className="text-xs text-primary font-semibold shrink-0 flex items-center gap-1"
                >
                  {geoLoading ? <Loader2 size={12} className="animate-spin" /> : <LocateFixed size={12} />}
                  {geoLoading ? "..." : "Update"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={geoLoading}
                  className="w-full h-11 rounded-xl border-2 border-dashed border-destructive/40 bg-destructive/5 text-destructive font-semibold text-sm flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  {geoLoading ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
                  {geoLoading ? "Detecting…" : "⚠ Set my location (required for jobs)"}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <Input inputMode="decimal" value={form.lat} onChange={set("lat")} placeholder="Latitude" className="h-10 rounded-xl text-xs" />
                  <Input inputMode="decimal" value={form.lng} onChange={set("lng")} placeholder="Longitude" className="h-10 rounded-xl text-xs" />
                </div>
              </div>
            )}
          </div>
          <Button type="submit" disabled={update.isPending} className="w-full h-11 rounded-xl bg-gradient-brand text-primary-foreground border-0 shadow-brand text-sm font-semibold">
            {update.isPending ? <Loader2 className="animate-spin" /> : "Save changes"}
          </Button>
        </form>
      </section>

      {/* Payouts */}
      <section className="px-5 mt-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Payout account</h2>
        {(merchant.paystack_subaccount_code || bankInfo) ? (
          <LinkedBankCard
            bankInfo={bankInfo}
            subaccountCode={merchant.paystack_subaccount_code}
            onChangeBank={() => setLinkOpen(true)}
          />
        ) : (
          <div className="rounded-2xl bg-card border border-border shadow-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
              <Banknote size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">No bank linked</div>
              <div className="text-xs text-muted-foreground mt-0.5">Add your bank to receive Paystack settlements.</div>
            </div>
            <button
              onClick={() => setLinkOpen(true)}
              className="h-9 px-3 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-brand shrink-0"
            >
              Link bank
            </button>
          </div>
        )}
      </section>

      {/* Sign out */}
      <section className="px-5 mt-6 mb-4">
        <button onClick={confirmSignOut} className="w-full h-12 rounded-2xl border border-destructive/30 text-destructive font-semibold flex items-center justify-center gap-2">
          <LogOut size={16} /> Sign out
        </button>
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-card p-4 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <Trash2 size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-destructive">Delete account</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Permanently remove your login and merchant profile from Highest Wash.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDeleteOpen(true)}
            disabled={deletingAccount}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold disabled:opacity-50 active:scale-[0.99] transition-smooth"
          >
            <Trash2 size={16} />
            Delete my account
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-3">
          Highest Wash Merchant · {(merchant.country_code ?? "GH").toUpperCase()}
        </p>
      </section>

      <LinkBankSheet
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        onLinked={() => {
          const raw = localStorage.getItem(`hw-merchant-bank:${merchant.id}`);
          setBankInfo(raw ? JSON.parse(raw) : null);
        }}
      />

      <Dialog
        open={deleteOpen}
        onOpenChange={(v) => {
          if (deletingAccount) return;
          setDeleteOpen(v);
          if (!v) setDeletePhrase("");
        }}
      >
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <div className="mx-auto mb-2 h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <DialogTitle className="text-center">Delete your account?</DialogTitle>
            <DialogDescription className="text-center">
              This permanently removes your login, merchant profile, payouts and message history.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-xs">
              Type <span className="font-bold text-destructive">DELETE</span> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={deletePhrase}
              onChange={(e) => setDeletePhrase(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              autoCapitalize="characters"
              className="h-12 rounded-xl text-center font-bold tracking-widest"
              disabled={deletingAccount}
            />
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              disabled={deletingAccount}
              className="h-11 px-4 rounded-xl border border-border font-semibold text-sm flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteAccount}
              disabled={deletingAccount || deletePhrase.trim().toUpperCase() !== "DELETE"}
              className="h-11 px-4 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deletingAccount ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
              {deletingAccount ? "Deleting…" : "Delete forever"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
