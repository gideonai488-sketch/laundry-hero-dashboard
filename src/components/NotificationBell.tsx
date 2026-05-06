import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, ClipboardList, MessageCircle, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { useIncomingFeed, useMyChats } from "@/lib/queries";

interface Props {
  variant?: "default" | "onHero";
}

export function NotificationBell({ variant = "default" }: Props) {
  const { merchant } = useAuth();
  const { data: incoming = [] } = useIncomingFeed(merchant?.id);
  const { data: chats = [] } = useMyChats(merchant?.id);
  const [open, setOpen] = useState(false);

  const unreadChats = chats.reduce((s: number, c: any) => s + (c.unread_count ?? 0), 0);
  const newOrders = incoming.filter((o: any) => !o.my_bid).length;
  const total = unreadChats + newOrders;

  const btnClass =
    variant === "onHero"
      ? "relative h-11 w-11 rounded-full border border-white/30 bg-white/10 backdrop-blur flex items-center justify-center active:scale-95 transition-smooth text-white"
      : "relative h-11 w-11 rounded-full border border-border bg-card flex items-center justify-center active:scale-95 transition-smooth text-foreground";

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Notifications" className={btnClass}>
        <Bell size={18} />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col">
          <SheetHeader className="px-5 pt-6 pb-3 text-left">
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>New jobs and unread messages.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">
            <section>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Incoming jobs ({newOrders})
              </h3>
              {newOrders === 0 ? (
                <EmptyRow icon={<Sparkles size={16} />} text="No new jobs right now." />
              ) : (
                <div className="space-y-2">
                  {incoming.filter((o: any) => !o.my_bid).slice(0, 8).map((o: any) => (
                    <Link
                      key={o.id}
                      to="/app"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border active:scale-[0.99] transition-smooth"
                    >
                      <div className="h-9 w-9 rounded-xl bg-gradient-brand-soft text-primary flex items-center justify-center shrink-0">
                        <ClipboardList size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">
                          New job · {o.customer?.full_name?.split(" ")?.[0] ?? "Customer"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {o.pickup_address ?? "No address"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Unread messages ({unreadChats})
              </h3>
              {unreadChats === 0 ? (
                <EmptyRow icon={<MessageCircle size={16} />} text="No unread chats." />
              ) : (
                <div className="space-y-2">
                  {chats.filter((c: any) => (c.unread_count ?? 0) > 0).slice(0, 8).map((c: any) => (
                    <Link
                      key={c.id}
                      to="/app/messages/$chatId"
                      params={{ chatId: c.id }}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border active:scale-[0.99] transition-smooth"
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <MessageCircle size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">
                          {c.customer?.full_name ?? "Customer"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {c.last_message?.body ?? "New message"}
                        </div>
                      </div>
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                        {c.unread_count}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function EmptyRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground py-3 px-3 rounded-xl bg-muted/40">
      {icon}
      {text}
    </div>
  );
}
