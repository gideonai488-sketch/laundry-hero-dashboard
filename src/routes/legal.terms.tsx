import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Highest Wash" },
      { name: "description", content: "Terms of Service for Highest Wash merchants and customers." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return <LegalPage title="Terms of Service" updated="April 1, 2026">
    <Section heading="1. Acceptance of terms">By using Highest Wash, you agree to these Terms. If you do not agree, do not use the platform.</Section>
    <Section heading="2. The platform">Highest Wash is a marketplace connecting laundry merchants with customers worldwide. We do not own, operate or manage merchant shops.</Section>
    <Section heading="3. Merchant obligations">Merchants must (a) hold all required licenses, (b) deliver services as described, (c) honor pricing set by Highest Wash, and (d) treat customers with respect.</Section>
    <Section heading="4. Pricing & commission">Customer-facing pricing is set platform-wide. Highest Wash retains a 12% commission on each completed order. Payouts run weekly.</Section>
    <Section heading="5. Cancellations & refunds">Customers may cancel free up to merchant acceptance. After acceptance, cancellation fees may apply per the Refund Policy.</Section>
    <Section heading="6. Account suspension">We may suspend accounts that violate these Terms, receive repeat complaints, or fall below quality thresholds.</Section>
    <Section heading="7. Limitation of liability">Highest Wash is not liable for indirect damages. Maximum liability is capped at fees paid in the 12 months prior to the claim.</Section>
    <Section heading="8. Governing law">These Terms are governed by the laws of the merchant's country of operation.</Section>
  </LegalPage>;
}

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero text-primary-foreground px-6 pt-6 pb-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/85 hover:text-white">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="mt-6 text-3xl font-bold">{title}</h1>
        <p className="text-xs text-white/80 mt-2">Last updated {updated}</p>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">{children}</div>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-foreground">{heading}</h2>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{children}</p>
    </section>
  );
}
