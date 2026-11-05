import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DeliveryEstimator } from "@/components/DeliveryEstimator";
import { MOCK_PRODUCTS } from "@/lib/products";

export const metadata = {
  title: "Delivery, Shipping & Logistics Governance — Tavistra",
  description:
    "Comprehensive logistics policies, presumptive distance bands, transit risk allocation, failed attempts, and carrier handover protocols for Tavistra.",
};

export default function ShippingPolicyPage() {
  const sampleProduct = MOCK_PRODUCTS[0]; // Monolith Wall Clock for interactive test

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
              Effective Date: November 2026 · Standard Pan-India Operating Protocol (Ex-Delhi Hub)
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
                  <strong>Single Combined Delivery Charge:</strong> Calculated transparently using Tavistra&apos;s distance-band logistics pricing model based on packaged volumetric weight, fragility classification, and destination postal zones.
                </li>
              </ul>
              <p>
                All necessary custom-formed transit packaging, internal shock-absorbing braces, protective crates, and 100% Carrier&apos;s Risk (FOV) transit insurance are bundled directly into the delivery quotation.
              </p>
            </section>

            {/* Interactive Calculator Box */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                2. Live Distance-Band Delivery Estimator
              </h2>
              <p>
                Test our real-time logistics engine across Indian postal codes (based on an Ex-Delhi dispatch origin):
              </p>
              <DeliveryEstimator product={sampleProduct} />
            </section>

            {/* Section 3: The 15kg Cutoff & Carrier Tiering */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                3. The 15kg Cutoff & Carrier Allocation Rule
              </h2>
              <p>
                Because our collections feature hand-finished hardwoods, heavy cast mineral composites, and architectural float mirrors, generic B2C courier handling is strictly tiered:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-5 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-bronze)]">
                    Standard & Fragile Consignments (≤ 15 kg)
                  </span>
                  <h3 className="font-semibold text-sm text-[var(--color-ink)]">
                    Blue Dart Fragile Surface & Delhivery Air
                  </h3>
                  <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                    Routed through specialized conveyor-free handling with multi-layer honeycomb cushioning and 2-inch all-side protective offsets.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-bronze)]">
                    Heavy & Bulky Architectural Pieces (&gt; 15 kg to 55 kg)
                  </span>
                  <h3 className="font-semibold text-sm text-[var(--color-ink)]">
                    Safeexpress / Gati Palletized B2B LTL
                  </h3>
                  <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                    Shipped exclusively in custom timber crates via palletized/caged trucking networks to eliminate transit crush risk.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: 5-Zone Distance Architecture */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                4. Master 5-Zone Postal Matrix (Ex-Delhi Hub)
              </h2>
              <p>
                Consignments dispatch from our primary packaging hub in Delhi NCR across five regional tiers:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-xs">
                <li>
                  <strong>Zone A (Delhi NCR):</strong> Delhi, Gurgaon, Noida, Faridabad, Ghaziabad (Estimated 1–2 business days).
                </li>
                <li>
                  <strong>Zone B (North India &lt;500 km):</strong> Haryana, Punjab, Rajasthan, Uttar Pradesh, Uttarakhand, Himachal Pradesh (Estimated 2–3 business days).
                </li>
                <li>
                  <strong>Zone C (Major Metros):</strong> Bengaluru, Mumbai, Pune, Hyderabad, Chennai, Kolkata, Ahmedabad (Estimated 3–5 business days).
                </li>
                <li>
                  <strong>Zone D (Rest of India):</strong> Tier 2 & Tier 3 cities across Central, Western and Southern India (Estimated 5–7 business days).
                </li>
                <li>
                  <strong>Zone E (Special & Remote Terrain):</strong> Jammu & Kashmir, Ladakh, North-Eastern states, Andaman & Nicobar, Lakshadweep (Estimated 7–12 business days).
                </li>
              </ul>
            </section>

            {/* Section 5: Transit Insurance */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                5. Mandatory Carrier&apos;s Risk (FOV) Insurance
              </h2>
              <p>
                Tavistra never books consignments under Owner&apos;s Risk (ROV). Every parcel is insured under <strong>Carrier&apos;s Risk (Freight On Value - FOV)</strong> for 100% of the invoice value.
              </p>
              <p className="text-xs">
                In the rare event of transit damage, customers must document outer box condition upon arrival and notify our client desk within 48 hours for immediate replacement under our Transit Guarantee.
              </p>
            </section>

            {/* Section 6: Delivery Attempts & Customer Obligations */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                6. Delivery Attempts & Return to Origin (RTO)
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-xs">
                <li>
                  <strong>Three Delivery Attempts:</strong> Carriers make up to three consecutive delivery attempts. A secure delivery OTP or signature is required.
                </li>
                <li>
                  <strong>Non-Availability & RTO:</strong> If delivery fails after three attempts due to customer unavailability or invalid addresses, the parcel returns to origin. Actual two-way carrier charges will be deducted from any eligible cancellation.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
