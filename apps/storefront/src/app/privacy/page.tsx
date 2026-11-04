import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy — Tavistra",
  description:
    "Data protection, privacy standards, and customer personal information handling by Tavistra and VDesign.",
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
              Privacy & Trust
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-[var(--color-muted-light)]">
              Last updated: November 2026 · Committed to ethical data stewardship
            </p>
          </div>

          <div className="space-y-10 text-sm leading-relaxed text-[var(--color-muted-light)]">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                1. Information We Collect
              </h2>
              <p>
                When you visit Tavistra, browse our catalogue, or complete an order, we collect information necessary to execute commerce and fulfilment services:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Contact Details:</strong> Full name, shipping/billing address, phone number, and email.</li>
                <li><strong>Order & Transaction History:</strong> Selected products, custom dimensions/finishes, quote correspondence, and delivery tracking.</li>
                <li><strong>Device & Interaction Information:</strong> IP address, browser type, and anonymous telemetry to optimize responsive rendering and performance.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                2. Guest Checkout & Data Protection
              </h2>
              <p>
                We do not force customer account creation to make a purchase. For guest checkouts, personal details are utilized solely for order delivery, GST compliance, and customer support. 
                We never infer account ownership or link sensitive order history without verified identity confirmation.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                3. Payment Information & Security
              </h2>
              <p>
                Tavistra does not store, process, or retain raw credit card numbers, debit card details, or UPI PINs on our servers. All financial transactions are securely handled directly by our RBI-authorized payment partner, <strong>PhonePe</strong>, using bank-grade 256-bit SSL encryption and tokenization.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                4. Third-Party Disclosures
              </h2>
              <p>
                We never sell, rent, or trade your personal information to third-party marketing brokers. Your data is shared exclusively with:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Courier & Freight Partners:</strong> Only name, delivery address, and phone number required for physical handover.</li>
                <li><strong>Statutory Authorities:</strong> Strictly when required by Indian law (e.g. GST invoicing audits).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                5. Your Data Rights
              </h2>
              <p>
                You have the right to request a copy of your personal data held by us, request correction of inaccurate details, or request deletion of non-statutory records by contacting our Data Protection contact at <strong className="text-[var(--color-ink)]">support@tavistra.in</strong>.
              </p>
            </section>

            <div className="pt-8 border-t border-[var(--color-decorative-border)]">
              <p className="text-xs text-[var(--color-muted-light)]">
                Have questions about your privacy? Contact our grievance officer at{" "}
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
