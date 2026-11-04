import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Returns, Cancellations & Refunds — Tavistra",
  description:
    "Approved returns, cancellation grace periods, and refund policies for Ready Stock, Made to Order, and Quote Only collections.",
};

export default function ReturnsRefundsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-16 px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="border-b border-[var(--color-decorative-border)] pb-8 mb-10">
            <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
              Policy & Protections
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-4">
              Returns, Cancellations & Refunds
            </h1>
            <p className="text-sm text-[var(--color-muted-light)]">
              Last updated: November 2026 · Governing all transactions at Tavistra
            </p>
          </div>

          <div className="space-y-12 text-sm leading-relaxed text-[var(--color-muted-light)]">
            {/* Section 1: Overview */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                1. Principle of Fair Dealing
              </h2>
              <p>
                Tavistra crafts artisanal décor and functional art objects. Because our items range from finished ready-to-ship stock to custom-dimensioned architectural fixtures, cancellation and return rules reflect the physical nature of how each piece is made.
              </p>
            </section>

            {/* Section 2: Ready Stock Returns */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                2. Ready Stock Purchases
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Standard Policy:</strong> Ready Stock objects are non-returnable by default unless explicitly specified on the product page as carrying a return guarantee.
                </li>
                <li>
                  <strong>Returnable Items:</strong> Where an item is marked as eligible for return, return requests must be submitted within <strong>7 days</strong> of verified delivery. The item must be in its original condition, unused, and packed in its original custom protective packaging.
                </li>
                <li>
                  <strong>Defects & Transit Damage:</strong> If an item arrives damaged, defective, or incorrect, you are protected under our full replacement guarantee. Notify us within 48 hours of delivery with photographic evidence.
                </li>
              </ul>
            </section>

            {/* Section 3: Made to Order & Quote Only Cancellations */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                3. Made to Order & Quote Only (7-Day Grace Period)
              </h2>
              <p>
                We enforce a governed timeline designed to protect both the customer and our workshop artisans:
              </p>
              <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-3">
                <h3 className="font-semibold text-[var(--color-ink)]">
                  7-Day Pre-Production Grace Window
                </h3>
                <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                  Upon order confirmation and verified receipt of your 25% advance, a strict 7-day grace period commences (ending at 23:59:59 IST on Day 7). 
                  During this window, physical manufacturing cannot begin. You may request adjustments, finish modifications, or order cancellation with a <strong>full refund of your advance payment</strong>.
                </p>
                <p className="text-xs font-semibold text-[var(--color-ink)] pt-2 border-t border-[var(--color-decorative-border)]/60">
                  Cutoff: On Day 8, once raw materials are cut and physical machining/casting begins, discretionary cancellations are no longer permitted.
                </p>
              </div>
            </section>

            {/* Section 4: Quote Only 30-Day Offer Clock */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                4. Quote Only Offer Validity
              </h2>
              <p>
                Proposals issued by our design team remain locked and valid for exactly <strong>30 days</strong> from the original issuance date (ending at 23:59:59 IST on Day 30). 
                Revisions or clarifications during this period do not reset the original 30-day clock. Once accepted with a verified 25% advance, the order converts to confirmed status and starts its own independent 7-day pre-production grace period.
              </p>
            </section>

            {/* Section 5: Refund Processing */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                5. Refund Processing Timeline
              </h2>
              <p>
                Approved refunds are processed via our banking partner (PhonePe Payment Gateway) to the original payment method:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>UPI Payments:</strong> 24 to 48 hours following approval.</li>
                <li><strong>Net Banking & Cards:</strong> 5 to 7 business days, depending on your issuing bank.</li>
              </ul>
              <p>
                A formal credit note and transaction reference will be issued to your registered email address for complete accounting transparency.
              </p>
            </section>

            {/* Inquiries */}
            <div className="pt-8 border-t border-[var(--color-decorative-border)]">
              <p className="text-xs text-[var(--color-muted-light)]">
                To request a cancellation or report an issue, write to{" "}
                <Link href="mailto:support@tavistra.in" className="text-[var(--color-bronze)] font-semibold hover:underline">
                  support@tavistra.in
                </Link>{" "}
                with your Order ID and contact details.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
