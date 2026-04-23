import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Section } from "./legal.terms";

export const Route = createFileRoute("/legal/merchant")({
  head: () => ({
    meta: [
      { title: "Merchant Agreement — Highest Wash" },
      { name: "description", content: "The agreement between laundry merchants and Highest Wash." },
    ],
  }),
  component: MerchantAgreementPage,
});

function MerchantAgreementPage() {
  return <LegalPage title="Merchant Agreement" updated="April 1, 2026">
    <Section heading="1. Parties">This agreement is between you ("Merchant") and Highest Wash Inc. ("Platform"). You operate as an independent business — not as an employee or agent.</Section>
    <Section heading="2. Scope of service">Platform provides: order routing, payments processing, customer support, marketing, and analytics. Merchant provides: laundry services, equipment, staff, and operational compliance.</Section>
    <Section heading="3. Pricing & commission">Customer prices are set by Platform. Merchant receives 88% of each order. Commission may change with 30 days' notice.</Section>
    <Section heading="4. Quality standards">Merchants must maintain ≥4.5 average rating, ≥95% on-time delivery, and ≤2% damage rate. Persistent breaches may lead to suspension.</Section>
    <Section heading="5. Payouts">Weekly payouts every Monday to your primary linked account. Currency conversion at mid-market rate. No payout fees from Platform.</Section>
    <Section heading="6. Insurance">Platform provides $5,000 per-order insurance against loss or damage. Merchant must carry general business liability insurance.</Section>
    <Section heading="7. Exclusivity">Non-exclusive. Merchants may operate on other platforms or independently.</Section>
    <Section heading="8. Termination">Either party may terminate with 14 days' notice. Outstanding orders must be completed; final payout settles within 30 days.</Section>
    <Section heading="9. Disputes">Resolved first by Platform mediation, then by binding arbitration in the merchant's country.</Section>
  </LegalPage>;
}
