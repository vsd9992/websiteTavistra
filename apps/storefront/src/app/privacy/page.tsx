import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy, Cookie Governance & Data Protection — Tavistra",
  description:
    "Comprehensive privacy notice, DPDP Act 2023 & GDPR compliance, cookie management, telemetry, and customer data rights for Tavistra.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-16 px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="border-b border-[var(--color-decorative-border)] pb-8 mb-10">
            <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
              Privacy Notice & Data Protection Governance
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-4">
              Privacy & Cookie Policy
            </h1>
            <p className="text-sm text-[var(--color-muted-light)]">
              Last updated: November 2026 · Compliant with the Indian DPDP Act 2023, IT Act 2000 & EU GDPR Standards
            </p>
          </div>

          <div className="space-y-10 text-sm leading-relaxed text-[var(--color-muted-light)]">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                1. Commitment & Regulatory Scope
              </h2>
              <p>
                At <strong>Tavistra</strong> (a brand of <strong>VDesign</strong>), data privacy is rooted in transparency, minimal data collection, and robust encryption. 
                This Privacy and Cookie Policy governs the collection, processing, storage, and cross-border transfer of personal information collected through our storefront, mobile interfaces, customer support channels, and design consultation desks.
              </p>
              <p>
                We adhere strictly to the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>, the <strong>Information Technology Act, 2000</strong> (including SPDI Rules, 2011), the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, and international standards established under the European Union <strong>General Data Protection Regulation (GDPR)</strong>.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                2. Categories of Personal Data We Process
              </h2>
              <p>
                Depending on how you interact with our platform, we collect and process the following categories of personal data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Direct Customer Identifiers:</strong> Legal full name, billing address, physical shipping address, postal PIN code, primary telephone/mobile number, and active email address.
                </li>
                <li>
                  <strong>B2B Tax Data:</strong> Corporate entity name, 15-digit Goods and Services Tax Identification Number (GSTIN), and registered company address for commercial invoicing.
                </li>
                <li>
                  <strong>Transaction & Quoting Records:</strong> Items purchased, custom bespoke specifications, finish requests, CAD approval correspondence, payment mode utilized, order transaction IDs, and delivery signature/consignment records.
                </li>
                <li>
                  <strong>Technical & Telemetry Data:</strong> Internet Protocol (IP) address, approximate geographic location (city/state level derived from IP), browser type and version, device hardware specifications, operating system, session time stamps, and referral URLs.
                </li>
                <li>
                  <strong>Communications & Support Interactions:</strong> Messages, email exchanges, photo/video evidence submitted for transit claims, and customer service satisfaction ratings.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                3. Legal Grounds for Processing (Lawful Basis)
              </h2>
              <p>
                In accordance with Indian DPDP principles and GDPR Article 6, we process your personal data only under recognized lawful bases:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-xs">
                <li><strong>Contractual Performance:</strong> Processing necessary to execute order checkouts, manufacture bespoke pieces, settle payments, and dispatch consignments via our couriers.</li>
                <li><strong>Statutory Compliance:</strong> Archiving tax invoices, GST transaction ledgers, credit notes, and corporate accounts as mandated by Indian tax and financial statutes.</li>
                <li><strong>Legitimate Interests:</strong> Protecting our digital infrastructure against distributed denial-of-service (DDoS) attacks, automated carding fraud, and unauthorized IP scraping.</li>
                <li><strong>Explicit Consent:</strong> Sending non-transactional marketing newsletters, product release notices, and deploying non-essential analytical cookies. You may revoke consent at any time.</li>
              </ul>
            </section>

            {/* Section 4: Cookies & Tracking Technologies */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                4. Cookies, Pixel Tags & Storage Technologies
              </h2>
              <p>
                Cookies are small encrypted alphanumeric files stored on your device that enable our servers to recognize your session and preserve your cart items. 
                Our platform utilizes the following classification of cookies:
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--color-ink)] mb-1">
                    Strictly Necessary Cookies (Essential)
                  </h3>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Required for core system security, session tokens, CSRF protection, cart persistence, and checkout integrity. These cannot be disabled in our systems.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--color-ink)] mb-1">
                    Functional & Preference Cookies
                  </h3>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Enable enhanced user experience such as remembering your postal pincode for shipping rate estimates and keeping language/filter preferences.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--color-ink)] mb-1">
                    Performance & Analytics Cookies
                  </h3>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Allow us to analyze aggregated, anonymized visitor traffic, popular collection pathways, and page load latencies to improve our storefront responsive design.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--color-ink)] mb-1">
                    Marketing & Retargeting Technologies
                  </h3>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Used with your explicit consent to present curated design object announcements on affiliated partner networks (such as Google or Meta). We do not sell tracking identities to data brokers.
                  </p>
                </div>
              </div>
              <p className="text-xs pt-2">
                You can configure or adjust your cookie preferences through your individual browser settings at any time, or clear stored local cookies via your browser history.
              </p>
            </section>

            {/* Section 5: Payment Security */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                5. Zero Storage of Sensitive Financial Data
              </h2>
              <p>
                Tavistra strictly observes the Reserve Bank of India (RBI) tokenization guidelines. 
                <strong>We never view, collect, store, or process raw credit card numbers, debit card CVVs, net banking credentials, or UPI MPINs on our servers.</strong>
              </p>
              <p>
                All checkout payments are executed directly via PCI-DSS Level 1 certified payment partners (PhonePe Payment Gateway). Financial transmissions are protected using end-to-end 256-bit TLS/SSL encryption and tokenized cryptographic handshakes.
              </p>
            </section>

            {/* Section 6: Third-Party Data Sharing */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                6. Permitted Third-Party Disclosures & International Transfers
              </h2>
              <p>
                We do not sell, rent, monetize, or trade your personal information. Personal data is disclosed solely to authorized service partners under strict non-disclosure and data processing agreements:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-xs">
                <li><strong>Integrated Logistics Carriers:</strong> Recipient name, destination delivery address, and phone number provided to Blue Dart, Delhivery, or dedicated freight handlers strictly to complete physical delivery.</li>
                <li><strong>Transactional Infrastructure & Email Delivery:</strong> Secure transactional SMTP notification services for sending order confirmations and tracking updates.</li>
                <li><strong>Statutory Authorities:</strong> Indian tax authorities, law enforcement agencies, or courts solely when mandated under enforceable legal orders or statutory tax audits.</li>
              </ul>
            </section>

            {/* Section 7: GDPR & DPDP Data Rights */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                7. Your Comprehensive Data Rights
              </h2>
              <p>
                Regardless of your country of residence, Tavistra grants you comprehensive control over your personal data:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 rounded-lg border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                  <h4 className="font-semibold text-xs text-[var(--color-ink)]">Right to Access & Portability</h4>
                  <p className="text-[11px] text-[var(--color-muted-light)] mt-1">Request an electronic summary of all personal information held regarding your identity and past orders.</p>
                </div>
                <div className="p-3.5 rounded-lg border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                  <h4 className="font-semibold text-xs text-[var(--color-ink)]">Right to Rectification</h4>
                  <p className="text-[11px] text-[var(--color-muted-light)] mt-1">Correct or update any inaccurate or incomplete personal contact details.</p>
                </div>
                <div className="p-3.5 rounded-lg border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                  <h4 className="font-semibold text-xs text-[var(--color-ink)]">Right to Erasure (To Be Forgotten)</h4>
                  <p className="text-[11px] text-[var(--color-muted-light)] mt-1">Request deletion of non-statutory personal data, subject to mandatory 7-year GST invoice retention laws.</p>
                </div>
                <div className="p-3.5 rounded-lg border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                  <h4 className="font-semibold text-xs text-[var(--color-ink)]">Right to Withdraw Consent</h4>
                  <p className="text-[11px] text-[var(--color-muted-light)] mt-1">Unsubscribe instantly from marketing communications with zero impact on order fulfilment.</p>
                </div>
              </div>
            </section>

            {/* Section 8: Grievance Officer */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                8. Grievance Officer & Statutory Contact
              </h2>
              <p>
                In compliance with the Information Technology Act, 2000, and the DPDP Act, 2023, the designated Grievance Officer for Tavistra is:
              </p>
              <div className="p-5 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] text-xs space-y-1 text-[var(--color-ink)]">
                <p><strong>Name / Designation:</strong> Data Protection & Grievance Desk</p>
                <p><strong>Entity:</strong> VDesign / Tavistra</p>
                <p><strong>Email:</strong> support@tavistra.in (Subject: Attention Grievance Officer)</p>
                <p><strong>Response Redressal Standard:</strong> Acknowledged within 24 hours; resolved within 15 business days.</p>
              </div>
            </section>

            <div className="pt-8 border-t border-[var(--color-decorative-border)]">
              <p className="text-xs text-[var(--color-muted-light)]">
                To exercise any of your statutory data rights, email our privacy desk at{" "}
                <Link href="mailto:support@tavistra.in" className="text-[var(--color-bronze)] font-semibold hover:underline">
                  support@tavistra.in
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
