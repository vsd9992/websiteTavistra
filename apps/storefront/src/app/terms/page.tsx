import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Terms of Service & Commercial Governance — Tavistra",
  description:
    "Statutory terms of service, customer contract formation, intellectual property covenants, and consumer dispute resolution for Tavistra.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-16 px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="border-b border-[var(--color-decorative-border)] pb-8 mb-10">
            <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
              Statutory Terms & Commercial Covenants
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-4">
              Terms of Service
            </h1>
            <p className="text-sm text-[var(--color-muted-light)]">
              Last updated: November 2026 · VDesign / Tavistra
            </p>
          </div>

          <div className="space-y-10 text-sm leading-relaxed text-[var(--color-muted-light)]">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                1. General Overview & Entity Information
              </h2>
              <p>
                This digital commerce portal and its associated APIs and services are owned and operated by <strong>VDesign</strong>, a sole proprietorship / registered business entity operating in India, under the commercial brand name <strong>Tavistra</strong>. 
                Throughout these Terms, the designations &ldquo;Tavistra&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, and &ldquo;our&rdquo; refer to VDesign / Tavistra.
              </p>
              <p>
                These Terms of Service constitute an electronic contract formed in accordance with the Information Technology Act, 2000, and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, as well as the Consumer Protection (E-Commerce) Rules, 2020. 
                By accessing, browsing, interacting with, or purchasing from this site, you unconditionally agree to be bound by these Terms and all incorporated policies.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                2. Eligibility & Account Security
              </h2>
              <p>
                By using our services, you represent that you are at least 18 years of age and competent to enter into a legally binding contract under the Indian Contract Act, 1872. 
                If you are accessing this platform on behalf of a company, architectural consultancy, or commercial entity, you represent and warrant that you hold full legal authority to bind said entity to these Terms.
              </p>
              <p>
                You may check out as a guest or create an authenticated account. You are solely responsible for maintaining the confidentiality of your account credentials, login tokens, and session integrity. Tavistra shall not be liable for unauthorized access resulting from your failure to safeguard personal access mechanisms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                3. Electronic Contract Formation & Order Acceptance
              </h2>
              <p>
                The display of products, materials, and pricing on this portal constitutes an invitation to offer, not a binding offer to sell. 
                An order placed by you represents an offer to purchase under these Terms. Contractual acceptance by Tavistra occurs only upon:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-xs">
                <li>Authoritative electronic verification of payment clearance by our designated payment gateway partner.</li>
                <li>Manual review and validation of delivery feasibility to your destination PIN code by our logistics desk.</li>
                <li>Issuance of a formal Order Confirmation email containing a unique Tavistra Order Reference.</li>
              </ul>
              <p className="text-xs">
                Tavistra reserves the explicit right to refuse, cancel, or limit order quantities at our sole discretion due to suspected fraudulent activity, unauthorized dealer arbitrage, pricing display typographical errors, or extreme regional logistics embargoes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                4. Mandatory Payment Gates & Modes
              </h2>
              <p>
                Every transaction is executed under one of three distinct and independent order modes, each strictly governed by the following financial milestones:
              </p>
              <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-5 space-y-2 text-xs">
                <p><strong>Ready Stock:</strong> Requires 100% verified payment prior to stock allocation, packaging, and carrier dispatch.</p>
                <p><strong>Made to Order (MTO):</strong> Requires a minimum verified 25% non-reversible advance to enter production eligibility following a 7-day pre-production grace window. 100% cumulative payment must be verified before physical carrier release.</p>
                <p><strong>Quote Only:</strong> Formal written acceptance of versioned terms and verified 25% advance must occur within the locked 30-day offer period. 100% cumulative payment required prior to carrier dispatch.</p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                5. Transparent Pricing, Invoicing & GST
              </h2>
              <p>
                All prices are stated in Indian Rupees (INR) and are inclusive of Goods and Services Tax (GST) as mandated by the Central Goods and Services Tax Act, 2017. 
                Every confirmed dispatch is accompanied by an electronic, digitally verifiable Tax Invoice detailing our GSTIN, HSN classification codes, state code, and applicable CGST, SGST, or IGST breakdowns.
              </p>
              <p>
                For B2B architectural orders requiring Input Tax Credit (ITC), customers must provide a valid 15-digit GSTIN, legal corporate entity name, and verified billing address at the time of checkout. Post-dispatch invoice amendments are strictly restricted by statutory tax portal rules.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                6. Intellectual Property & Brand Ownership
              </h2>
              <p>
                All materials, CAD engineering designs, product blueprints, 3D renderings, product photographs, video content, typography systems, graphic marks, brand iconography, and software source code residing on this portal are the sole and exclusive intellectual property of VDesign / Tavistra.
              </p>
              <p>
                Nothing contained herein grants you any license, sublicense, or right to copy, reproduce, reverse-engineer, decompile, mirror, commercially exploit, or manufacture identical or confusingly similar architectural replicas of Tavistra products without express prior written consent from VDesign.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                7. Limitation of Liability & Warranty Disclaimer
              </h2>
              <p>
                To the maximum extent permissible by Indian law, Tavistra products and services are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. 
                Tavistra disclaims all implied warranties of merchantability, fitness for a particular bespoke installation, or non-infringement, save for express written material warranties accompanying specific items.
              </p>
              <p>
                In no event shall Tavistra, its artisans, directors, employees, or logistics partners be held liable for indirect, incidental, punitive, or consequential damages (including loss of project profit, contractor downtime, or installation labor fees) resulting from delivery delays, natural material aging, or site mounting failures. 
                Tavistra&apos;s total aggregate liability arising under any claim shall not exceed the actual purchase price paid by the customer for the specific item in dispute.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                8. Indemnification
              </h2>
              <p>
                You agree to indemnify, defend, and hold harmless VDesign, Tavistra, its affiliates, contractors, licensors, and service providers from any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising from your breach of these Terms, violation of third-party rights, or improper installation and usage of our physical objects.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                9. Governing Law, Dispute Resolution & Jurisdiction
              </h2>
              <p>
                These Terms and all commercial transactions shall be governed by, interpreted, and construed exclusively in accordance with the substantive laws of India, without regard to conflicts of law principles.
              </p>
              <p>
                In the event of any dispute, claim, or controversy arising out of or relating to these Terms, the parties shall first attempt to resolve the matter amicably through good-faith negotiation. 
                Failing amicable settlement within 30 days, the dispute shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996, before a sole arbitrator appointed mutually by the parties. 
                The seat and venue of arbitration shall be in India, and proceedings shall be conducted in English. 
                Subject to arbitration, competent civil courts situated in India shall possess exclusive jurisdiction.
              </p>
            </section>

            <div className="pt-8 border-t border-[var(--color-decorative-border)]">
              <p className="text-xs text-[var(--color-muted-light)]">
                For legal inquiries or corporate contracting notices, contact:{" "}
                <Link href="mailto:studio@vdesign.in" className="text-[var(--color-bronze)] font-semibold hover:underline">
                  studio@vdesign.in
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
