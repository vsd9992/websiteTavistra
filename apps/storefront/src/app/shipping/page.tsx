import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Delivery, Shipping & Logistics Governance — Tavistra",
  description:
    "Comprehensive logistics policies, presumptive distance bands, transit risk allocation, failed attempts, and carrier handover protocols for Tavistra.",
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
              Logistics & Fulfilment Architecture
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-4">
              Delivery & Shipping Policy
            </h1>
            <p className="text-sm text-[var(--color-muted-light)]">
              Effective Date: November 2026 · Standard Pan-India Operating Protocol
            </p>
          </div>

          <div className="space-y-12 text-sm leading-relaxed text-[var(--color-muted-light)]">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                1. Two-Component Honest Checkout Structure
              </h2>
              <p>
                Tavistra strictly prohibits deceptive checkout additions, post-cart packaging surcharges, or hidden handling fees. 
                In compliance with the Consumer Protection (E-Commerce) Rules, 2020, every order invoice displays only two distinct financial components:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--color-ink)]">
                <li>
                  <strong>Tax-Inclusive Item Price:</strong> The published price represents the final cost of the product, inclusive of applicable Goods and Services Tax (GST) at statutory rates.
                </li>
                <li>
                  <strong>Single Combined Delivery Charge:</strong> Calculated transparently using Tavistra&apos;s internal logistics pricing model based on dimensional volumetric weight, package fragility classification, and destination distance bands.
                </li>
              </ul>
              <p>
                All necessary custom-formed transit packaging, internal shock-absorbing braces, protective crates, and primary transit coverage are bundled directly into the delivery quotation.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                2. Three Independent Fulfilment Streams & Timelines
              </h2>
              <p>
                Because our collections span studio ready stock, batch-produced craft editions, and commissioned site-specific art objects, order fulfilment operates under three mutually exclusive operational flows:
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-6 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base text-[var(--color-ink)]">A. Ready Stock (Immediate Inventory)</h3>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-bronze)]">24–48 Hours Dispatch</span>
                  </div>
                  <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                    Finished items physically verified in warehouse stock. Dispatched within 24 to 48 business hours following authoritative electronic payment clearance. Estimated transit delivery is 3 to 6 business days depending on regional postal zone.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base text-[var(--color-ink)]">B. Made to Order (MTO)</h3>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-bronze)]">Governed Lead Times</span>
                  </div>
                  <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                    Individual fabrication begins only after the mandatory 7-day post-confirmation grace period and verification of the 25% advance. Standard workshop crafting timelines range from 14 to 28 business days. Physical carrier handover occurs only after 100% balance settlement and final Quality Control (QC) clearance.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base text-[var(--color-ink)]">C. Quote Only / Bespoke Architectural</h3>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-bronze)]">Custom Milestone Schedule</span>
                  </div>
                  <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                    Custom scale installations, specialized finishes, and non-standard architectural elements follow custom milestone delivery dates articulated in the binding written proposal. Specialized crating and dedicated logistics handling are arranged individually.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                3. Courier Assignment & Transit Tracking
              </h2>
              <p>
                We do not rely on unvetted generic drop-shippers. Courier allocation is performed manually by our dispatch desk based on consignment fragility and regional speed benchmarks. Primary carrier partners include Blue Dart Express, Delhivery Express, and specialized surface freight logistics.
              </p>
              <p>
                Upon package scan, an authoritative airway bill (AWB) number and direct tracking URL are dispatched via email and SMS/WhatsApp. Please allow 12 hours from initial handover for carrier tracking databases to populate real-time node checkpoints.
              </p>
            </section>

            {/* Section 4: Brand Protection - Delivery Attempts & Customer Obligations */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                4. Delivery Attempts, RTO & Customer Obligations
              </h2>
              <p>
                To ensure safe custody and eliminate transit loss, the following delivery protocols are strictly enforced:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Three Delivery Attempts:</strong> Our logistics partners will make up to three consecutive delivery attempts. A delivery OTP or authorized recipient signature may be mandated for high-value consignments.
                </li>
                <li>
                  <strong>Accurate Address & Contact Details:</strong> The customer is strictly responsible for providing a complete street address, identifiable landmarks, active primary phone number, and verified PIN code. Tavistra shall not be liable for transit delays or misroutings resulting from inaccurate customer inputs.
                </li>
                <li>
                  <strong>Non-Availability & Return to Origin (RTO):</strong> If delivery fails after three attempts due to customer unavailability, refusal without cause, or unreachability, the shipment will be marked Return to Origin (RTO). In such cases, actual two-way freight charges incurred by Tavistra will be deducted from any eligible refund. For Made to Order items, the customer remains responsible for re-shipping charges prior to re-dispatch.
                </li>
                <li>
                  <strong>Gated Communities & Specialized Access:</strong> If delivery requires special security entry, building hoist permits, or high-rise elevator permissions, the customer must arrange necessary approvals in advance.
                </li>
              </ul>
            </section>

            {/* Section 5: Risk of Loss & Inspection on Arrival */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                5. Transit Risk Allocation & Outer Box Inspection Protocol
              </h2>
              <p>
                Title and risk of loss pass to the customer upon verified delivery handover at the destination address. Because architectural objects, glass components, and solid brass castings require rigorous handling, customers are required to follow our mandatory arrival protocol:
              </p>
              <div className="rounded-xl border border-[var(--color-control-border)]/40 bg-[var(--color-canvas)] p-5 space-y-3">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-[var(--color-ink)]">
                  Mandatory Inspection Upon Handover:
                </h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-xs">
                  <li>Inspect the outer shipping crate/box for puncture holes, crushing, water exposure, or severed security seal tape prior to signing the delivery receipt.</li>
                  <li>If obvious exterior destruction is visible, endorse the carrier delivery sheet explicitly with <em>&ldquo;Received in Damaged Condition — Subject to Inspection&rdquo;</em>, or refuse delivery and photograph the exterior.</li>
                  <li><strong>Unboxing Video Mandate:</strong> For mirrors, delicate lighting fixtures, and collectible sculptures, we strongly advise recording an uninterrupted unboxing video from package seal to product inspection. Claims of missing parts or internal transit fractures must be notified within <strong>48 hours</strong> of carrier delivery timestamp via support@tavistra.in with photographic/video evidence.</li>
                </ol>
              </div>
            </section>

            {/* Section 6: Force Majeure */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                6. Force Majeure & Exceptional Delays
              </h2>
              <p>
                Tavistra shall not be held liable or deemed in default for transit delays or carrier failures resulting from acts beyond reasonable human control, including but not limited to severe weather disruptions, regional transport strikes, local lockdowns, floods, natural catastrophes, civil disturbances, or state regulatory border inspections. In such events, our support desk will communicate revised tracking expectations.
              </p>
            </section>

            <div className="pt-8 border-t border-[var(--color-decorative-border)]">
              <p className="text-xs text-[var(--color-muted-light)]">
                For dispatch inquiries or address verification questions, email{" "}
                <Link href="mailto:support@tavistra.in" className="text-[var(--color-bronze)] font-semibold hover:underline">
                  support@tavistra.in
                </Link>{" "}
                or call our studio logistics desk directly.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
