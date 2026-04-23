import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Section } from "./legal.terms";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Highest Wash" },
      { name: "description", content: "How Highest Wash collects, uses and protects your personal data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated="April 1, 2026">
    <Section heading="1. Data we collect">Account info (name, email, phone), business documents, transaction data, device info, and location data when you accept a job.</Section>
    <Section heading="2. How we use your data">To operate the marketplace, process payments, prevent fraud, comply with tax obligations, and improve the service.</Section>
    <Section heading="3. Sharing">We share data with payment processors, identity-verification providers, and law enforcement when legally required. We never sell personal data.</Section>
    <Section heading="4. Retention">Account and transaction data is retained for 7 years for tax compliance. You can request deletion of optional data anytime.</Section>
    <Section heading="5. Your rights">You can access, correct, export or delete your data via Profile → Privacy. EU/UK/CA residents have additional rights under GDPR/CCPA.</Section>
    <Section heading="6. Security">We use TLS 1.3 in transit, AES-256 at rest, and SOC 2 Type II controls. We never store raw payment card data.</Section>
    <Section heading="7. Cookies">We use functional cookies for sessions and analytics cookies (opt-out available). No third-party advertising cookies.</Section>
    <Section heading="8. Contact">Privacy questions: privacy@highestwash.com. Data Protection Officer: dpo@highestwash.com.</Section>
  </LegalPage>;
}
