import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Loader2, LogOut, MapPin, Phone, Power, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteCurrentAccount } from "@/lib/account.functions";
import { useAuth } from "@/lib/auth";
import { useToggleOnline, useUpdateMerchant } from "@/lib/queries";
import { supabase } from "@/lib/supabase";

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
  const [deletingAccount, setDeletingAccount] = useState(false);

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

  const setupPayouts = async () => {
    if (!bank.bank_code || !bank.account_number) {
      toast.error("Enter bank code and account number.");
      return;
    }
    setSavingBank(true);
    try {
      await supabase.functions.invoke("register-merchant-subaccount", {
        body: {
          merchant_id: merchant.id,
          bank_code: bank.bank_code,
          account_number: bank.account_number,
        },
      });
      await refresh();
      toast.success("Payouts setup submitted.");
    } catch (err: any) {
      console.warn(err);
      toast.info("Payouts edge function not deployed yet — backend agent will handle it.");
    } finally {
      setSavingBank(false);
    }
  };

  const confirmSignOut = () => {
    if (confirm("Sign out of Highest Wash?")) signOut();
  };

  const confirmDeleteAccount = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in again before deleting your account.");
      return;
    }
    const phrase = window.prompt("Type DELETE to permanently delete your account.");
    if (phrase !== "DELETE") return;
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
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="lat" className="text-xs">Latitude</Label>
              <Input id="lat" inputMode="decimal" value={form.lat} onChange={set("lat")} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lng" className="text-xs">Longitude</Label>
              <Input id="lng" inputMode="decimal" value={form.lng} onChange={set("lng")} className="h-11 rounded-xl" />
            </div>
          </div>
          <Button type="submit" disabled={update.isPending} className="w-full h-11 rounded-xl bg-gradient-brand text-primary-foreground border-0 shadow-brand text-sm font-semibold">
            {update.isPending ? <Loader2 className="animate-spin" /> : "Save changes"}
          </Button>
        </form>
      </section>

      {/* Payouts moved to Wallet — link/manage your bank from there. */}

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
            onClick={confirmDeleteAccount}
            disabled={deletingAccount}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold disabled:opacity-50"
          >
            {deletingAccount ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
            {deletingAccount ? "Deleting…" : "Delete my account"}
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-3">
          Highest Wash Merchant · {(merchant.country_code ?? "GH").toUpperCase()}
        </p>
      </section>
    </div>
  );
}
