import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { customers, orders, chats, formatMoney } from "@/lib/mock-data";
import { MessageSquare, Package, Search as SearchIcon, User } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/app/search")({
  head: () => ({ meta: [{ title: "Search — Highest Wash Merchant" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!term) return { orders: [], customers: [], chats: [] };
    return {
      orders: orders.filter((o) => `${o.id} ${o.customer} ${o.service} ${o.address}`.toLowerCase().includes(term)).slice(0, 6),
      customers: customers.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(term)).slice(0, 6),
      chats: chats.filter((c) => `${c.customer} ${c.lastMessage}`.toLowerCase().includes(term)).slice(0, 6),
    };
  }, [term]);

  const empty = term && results.orders.length + results.customers.length + results.chats.length === 0;

  return (
    <div>
      <AppHeader title="Search" subtitle="Orders, customers, messages" />

      <div className="px-5 mt-2">
        <div className="relative">
          <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search anything…"
            maxLength={80}
            className="w-full h-11 rounded-xl pl-9 pr-3 text-sm bg-card border border-border"
          />
        </div>
      </div>

      {!term && (
        <div className="px-5 mt-6 text-center text-sm text-muted-foreground">
          <SearchIcon size={28} className="mx-auto opacity-40 mb-2" />
          Start typing to search across your business.
        </div>
      )}

      {empty && (
        <div className="px-5 mt-6 text-center text-sm text-muted-foreground">
          No results for "<span className="font-bold">{q}</span>"
        </div>
      )}

      {results.orders.length > 0 && (
        <Section title="Orders" icon={<Package size={12} />}>
          {results.orders.map((o) => (
            <Link
              key={o.id}
              to="/app/order/$orderId"
              params={{ orderId: o.id }}
              className="flex items-center gap-3 p-3 hover:bg-accent transition-smooth"
            >
              <div className="h-9 w-9 rounded-lg bg-gradient-brand-soft text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {o.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{o.customer} · {o.id}</div>
                <div className="text-[11px] text-muted-foreground truncate">{o.service} · {o.address}</div>
              </div>
              <div className="text-xs font-bold text-primary">{formatMoney(o.amount)}</div>
            </Link>
          ))}
        </Section>
      )}

      {results.customers.length > 0 && (
        <Section title="Customers" icon={<User size={12} />}>
          {results.customers.map((c) => (
            <Link
              key={c.id}
              to="/app/customers"
              className="flex items-center gap-3 p-3 hover:bg-accent transition-smooth"
            >
              <div className="h-9 w-9 rounded-lg bg-gradient-brand-soft text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{c.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{c.email}</div>
              </div>
              <div className="text-xs font-bold text-primary">{formatMoney(c.lifetimeValue)}</div>
            </Link>
          ))}
        </Section>
      )}

      {results.chats.length > 0 && (
        <Section title="Messages" icon={<MessageSquare size={12} />}>
          {results.chats.map((c) => (
            <Link
              key={c.id}
              to="/app/message/$chatId"
              params={{ chatId: c.id }}
              className="flex items-center gap-3 p-3 hover:bg-accent transition-smooth"
            >
              <div className="h-9 w-9 rounded-lg bg-gradient-brand-soft text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{c.customer}</div>
                <div className="text-[11px] text-muted-foreground truncate">{c.lastMessage}</div>
              </div>
            </Link>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="px-5 mt-5">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-2 flex items-center gap-1.5">
        {icon} {title}
      </div>
      <div className="bg-card rounded-2xl border border-border shadow-card divide-y divide-border overflow-hidden">
        {children}
      </div>
    </section>
  );
}
