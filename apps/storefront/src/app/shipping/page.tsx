import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Delivery & Shipping Policy — Tavistra",
  description:
    "Transparent delivery calculations, presumptive distance bands, dispatch timelines, and carrier handover protocols for Tavistra orders.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-16 px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="border-b border-[var(--color-decorative-border)] pb-8 mb-10">
            <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
              Operational Transparency
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-4">
              Delivery & Shipping Policy
            </h1>
            <p className="text-sm text-[var(--color-muted-light)]">
              Last updated: November 2026 · Effective across all pan-India orders
            </p>
          </div>

          {/* Core Content */}
          <div className="space-y-12 text-sm leading-relaxed text-[var(--color-muted-light)]">
            {/* Section 1: Pricing Model */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                1. Transparent Pricing & Internal Rate Engine
              </h2>
              <p>
                At Tavistra, we believe in complete financial clarity. The price you see at checkout consists strictly of two components:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--color-ink)]">
                <li><strong>Tax-Inclusive Product Price:</strong> All applicable GST is already included in the stated item price.</li>
                <li><strong>One Combined Delivery Charge:</strong> Calculated transparently using our internal destination distance-band engine based on package weight, volume, and destination pincode.</li>
              </ul>
              <p>
                We do not add surprise fees at checkout. Packaging, handling, and transit insurance are factored honestly into the upfront delivery quote.
              </p>
            </section>

            {/* Section 2: Mode-Specific Timelines */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                2. Fulfilment Across Three Modes
              </h2>
              <p>
                Because our collections range from immediate ready-stock pieces to studio-crafted bespoke installations, dispatch timelines are determined by your selected purchase mode:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="p-5 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                  <h3 className="font-semibold text-[var(--color-ink)] mb-2">Ready Stock</h3>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Pieces currently in inventory at our studio are inspected, packed, and handed over to courier partners within <strong>24–48 hours</strong> of verified payment.
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                  <h3 className="font-semibold text-[var(--color-ink)] mb-2">Made to Order (MTO)</h3>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Crafted individually. Production begins following a 7-day confirmation grace period upon receiving your 25% verified advance. Dispatched only once 100% balance is cleared.
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                  <h3 className="font-semibold text-[var(--color-ink)] mb-2">Quote Only / Bespoke</h3>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Custom architectural installations follow milestone schedules specified on your approved proposal. Lead times typically range from 3 to 6 weeks.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Carrier Handover & Tracking */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                3. Courier Handover & Order Tracking
              </h2>
              <p>
                Once an order has completed Quality Control (QC) and is packed, our studio assigns a verified courier partner (e.g., Blue Dart, Delhivery, or specialized surface transport for fragile/oversized architectural mirrors and lights).
              </p>
              <p>
                You will receive an automated dispatch notification containing the carrier name and a direct consignment tracking link via email and SMS/WhatsApp.
              </p>
            </section>

            {/* Section 4: Damage in Transit */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                4. Transit Safeguards & Inspection on Delivery
              </h2>
              <p>
                All fragile objects are packed in reinforced, custom-molded protective crating. Upon receiving your delivery:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Inspect the exterior packaging before signing the carrier proof of delivery.</li>
                <li>In the rare event of visible exterior box damage or tampering, make a note on the carrier delivery receipt and photograph the package before opening.</li>
                <li>Report any transit-related damage to <strong className="text-[var(--color-ink)]">support@tavistra.in</strong> within 48 hours with photographs for immediate remediation.</li>
              </ul>
            </section>

            {/* Inquiries */}
            <div className="pt-8 border-t border-[var(--color-decorative-border)]">
              <p className="text-xs text-[var(--color-muted-light)]">
                Need specialized delivery assistance or an architectural delivery quotation? Contact our studio at{" "}
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
