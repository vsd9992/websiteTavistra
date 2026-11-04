import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Terms of Service — Tavistra",
  description:
    "Terms of service, purchasing contracts, and commercial governance for Tavistra by VDesign.",
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
              Legal Governance
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
                1. General Overview & Acceptance
              </h2>
              <p>
                This website is operated by <strong>VDesign</strong> under the brand name <strong>Tavistra</strong>. Throughout the site, the terms &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; refer to Tavistra / VDesign. By visiting our site, placing an enquiry, or purchasing our products, you engage in our &ldquo;Service&rdquo; and agree to be bound by the following terms and conditions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                2. Purchase Contract & Verification
              </h2>
              <p>
                Receipt of an electronic confirmation or payment link does not signify our final acceptance of your order. Tavistra reserves the right to verify stock availability, delivery accessibility to designated pincodes, and payment authentication before committing to dispatch or initiating production.
              </p>
              <p>
                All orders must strictly fulfill our payment gates:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Ready Stock:</strong> Full payment verified prior to release for packaging and dispatch.</li>
                <li><strong>Made to Order:</strong> At least 25% verified advance before production release; 100% cumulative verified balance before dispatch.</li>
                <li><strong>Quote Only:</strong> Formal written acceptance of versioned terms and verified 25% advance within the 30-day offer window.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                3. Pricing, GST & Taxes
              </h2>
              <p>
                All product prices displayed on the storefront are denominated in Indian Rupees (INR) and are inclusive of Goods and Services Tax (GST) at applicable statutory rates. A valid tax invoice matching the requirements of the Central Goods and Services Tax Act is issued upon dispatch.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                4. Intellectual Property
              </h2>
              <p>
                All product designs, architectural concepts, sketches, imagery, trademarks, and typography on this site are the exclusive intellectual property of VDesign. Reproduction, resale, or imitation of our physical designs or digital assets without prior written consent is strictly prohibited.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                5. Governing Law & Jurisdiction
              </h2>
              <p>
                These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in India.
              </p>
            </section>

            <div className="pt-8 border-t border-[var(--color-decorative-border)]">
              <p className="text-xs text-[var(--color-muted-light)]">
                Direct all legal inquiries to{" "}
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
