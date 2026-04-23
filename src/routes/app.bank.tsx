import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { bankAccounts, type BankAccount } from "@/lib/mock-data";
import { Building2, Check, Plus, Smartphone, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/app/bank")({
  head: () => ({ meta: [{ title: "Bank accounts — Highest Wash Merchant" }] }),
  component: BankPage,
});

const momoProviders = [
  { id: "mtn", name: "MTN Mobile Money", color: "bg-warning" },
  { id: "voda", name: "Vodafone Cash", color: "bg-destructive" },
  { id: "atl", name: "AirtelTigo Money", color: "bg-primary" },
];

const banks = [
  "GCB Bank", "Ecobank Ghana", "Absa Bank", "Stanbic Bank", "Fidelity Bank", "CalBank", "Zenith Bank",
];

function BankPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>(bankAccounts);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"momo" | "bank">("momo");

  const setPrimary = (id: string) => {
    setAccounts((prev) => prev.map((a) => ({ ...a, isPrimary: a.id === id })));
    toast.success("Primary account updated");
  };

  const remove = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Account removed");
  };

  return (
    <div>
      <AppHeader title="Payouts" subtitle="Where you get paid" />

      <div className="px-5 mt-2 space-y-3">
        {accounts.map((a) => (
          <div key={a.id} className="bg-card rounded-2xl border border-border shadow-card p-4">
            <div className="flex items-start gap-3">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${a.type === "momo" ? "bg-warning/15 text-warning-foreground" : "bg-gradient-brand-soft text-primary"}`}>
                {a.type === "momo" ? <Smartphone size={20} /> : <Building2 size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-sm truncate">{a.provider}</div>
                  {a.isPrimary && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success">PRIMARY</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.accountName}</div>
                <div className="text-xs font-mono text-foreground mt-1">{a.accountNumber}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {!a.isPrimary && (
                <button
                  onClick={() => setPrimary(a.id)}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-gradient-brand text-primary-foreground"
                >
                  Make primary
                </button>
              )}
              <button
                onClick={() => remove(a.id)}
                className="h-9 px-3 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"
                aria-label="Remove account"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="w-full p-4 rounded-2xl bg-card border-2 border-dashed border-border text-muted-foreground font-semibold flex items-center justify-center gap-2 hover:bg-accent transition-smooth">
              <Plus size={18} /> Link new account
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add payout account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setType("momo")}
                  className={`p-3 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-smooth ${type === "momo" ? "border-primary bg-gradient-brand-soft text-primary" : "border-border text-muted-foreground"}`}
                >
                  <Smartphone size={16} /> Mobile Money
                </button>
                <button
                  onClick={() => setType("bank")}
                  className={`p-3 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-smooth ${type === "bank" ? "border-primary bg-gradient-brand-soft text-primary" : "border-border text-muted-foreground"}`}
                >
                  <Building2 size={16} /> Bank account
                </button>
              </div>

              {type === "momo" ? (
                <div className="space-y-3">
                  <div>
                    <Label>Provider</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {momoProviders.map((p) => (
                        <button key={p.id} className="p-2 rounded-lg border border-border text-[10px] font-bold hover:bg-accent transition-smooth">
                          <div className={`h-6 w-6 rounded-full ${p.color} mx-auto mb-1`} />
                          {p.name.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Mobile number</Label>
                    <Input id="phone" placeholder="024 555 0188" className="h-11 rounded-xl mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="name">Account name</Label>
                    <Input id="name" placeholder="As registered with provider" className="h-11 rounded-xl mt-1.5" />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="bank">Bank</Label>
                    <select id="bank" className="w-full h-11 rounded-xl mt-1.5 px-3 bg-background border border-input text-sm">
                      {banks.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="acc">Account number</Label>
                    <Input id="acc" placeholder="10 digits" className="h-11 rounded-xl mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="aname">Account name</Label>
                    <Input id="aname" placeholder="Business name" className="h-11 rounded-xl mt-1.5" />
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  setOpen(false);
                  toast.success("Account linked successfully");
                }}
                className="w-full h-11 rounded-xl bg-gradient-brand text-primary-foreground border-0 shadow-brand"
              >
                <Check size={16} className="mr-1" /> Link account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="px-5 mt-6 p-4 rounded-2xl bg-gradient-brand-soft border border-border">
        <div className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Payout schedule</div>
        <div className="text-sm font-semibold">Weekly · Every Monday</div>
        <div className="text-xs text-muted-foreground mt-1">Funds settle to your primary account within 24 hours.</div>
      </div>
    </div>
  );
}
