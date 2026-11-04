import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Returns, Cancellations & Refund Governance — Tavistra",
  description:
    "Authoritative cancellation rules, 7-day grace period, Made to Order policies, and return conditions for Tavistra.",
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
              Commercial Policy & Consumer Rights
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-4">
              Returns, Cancellations & Refunds
            </h1>
            <p className="text-sm text-[var(--color-muted-light)]">
              Last updated: November 2026 · Governing all transactions at Tavistra / VDesign
            </p>
          </div>

          <div className="space-y-12 text-sm leading-relaxed text-[var(--color-muted-light)]">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                1. Context & Nature of Craftsmanship
              </h2>
              <p>
                Tavistra produces architectural objects, sculptural lighting, solid metals, and precision décor. 
                Natural materials such as unlacquered brass, solid timber, stone, hand-blown glass, and artisanal ceramic glazes possess organic variations in grain, hue, surface texturing, and crystalline inclusions. 
                These natural characteristics are hallmarks of fine handcraftsmanship and design individuality, and are not classified as manufacturing defects.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                2. Ready Stock Purchases & Return Eligibility
              </h2>
              <p>
                To preserve product authenticity and hygiene standards, the following terms govern our standard catalog inventory:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Baseline Policy:</strong> Ready Stock objects are <strong>non-returnable by default</strong> once delivered in undamaged, conforming condition, unless explicitly flagged with a &ldquo;7-Day Return Guarantee&rdquo; on the respective product page at the time of purchase.
                </li>
                <li>
                  <strong>Authorized Returns (Returnable SKUs):</strong> Where an item carries an explicit return guarantee, the return request must be raised within <strong>7 calendar days</strong> of the carrier delivery scan.
                </li>
                <li>
                  <strong>Mandatory Condition for Returns:</strong> The product must be brand-new, completely uninstalled, undamaged, free of scuffs/marks, and securely re-packed in its original branded protective box, custom foam inserts, dust bags, and authentication certificates. Items returned incomplete or altered will be rejected and sent back to the buyer at the buyer&apos;s expense.
                </li>
                <li>
                  <strong>Restocking & Reverse Freight:</strong> For discretionary returns of eligible Ready Stock items, reverse freight charges and a standard 10% inspection/restocking fee will be deducted from the total refund amount.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                3. Made to Order (MTO) & Bespoke Cancellation Protocols
              </h2>
              <p>
                Made to Order objects are fabricated individually according to your selected material finishes, custom dimensions, or limited edition batch allocations. 
                Our production schedule enforces strict operational gates designed to protect consumer rights while guarding against raw material wastage:
              </p>

              <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-base text-[var(--color-ink)]">
                    The 7-Day Pre-Production Grace Window (100% Refundable)
                  </h3>
                  <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                    Following order placement and verified receipt of your 25% production advance, an authoritative 7-day grace period commences (ending at 23:59:59 IST on Day 7). 
                    During these seven days, our studio prepares CAD drawings, allocates metal stock, and schedules workshop machinery. <strong>Physical production cannot begin before Day 8.</strong>
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--color-decorative-border)]/60 text-xs space-y-2">
                  <p>
                    <strong>Cancellations within Grace Window (Days 1–7):</strong> You may cancel your order at any time for any reason during this period. Your complete 25% advance will be refunded in full without penalty or deduction.
                  </p>
                  <p>
                    <strong>Strict Production Cutoff (Day 8 Onwards):</strong> On Day 8, once the grace period expires and our studio logs the auditable &ldquo;Actual Production Start&rdquo; event, precision cutting, casting, welding, and artisan assembly begin. <strong>Discretionary cancellations, alterations, or returns are strictly prohibited after physical production has started.</strong>
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                4. Quote Only Proposals & 30-Day Offer Clock
              </h2>
              <p>
                Formal written proposals issued by our architectural design team are valid for exactly <strong>30 calendar days</strong> from the initial date of issuance (expiring at 23:59:59 IST on Day 30).
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Any design revisions, material clarifications, or updated line items issued within the 30 days do not reset the original 30-day expiration clock.
                </li>
                <li>
                  Upon timely written customer acceptance and receipt of the verified 25% advance within the 30-day window, the quotation converts to a confirmed order.
                </li>
                <li>
                  Once confirmed, the order initiates its own independent 7-day pre-production grace period. The original 30-day quote expiration date no longer affects the customer&apos;s 7-day statutory cancellation rights.
                </li>
                <li>
                  Unaccepted quotes automatically lapse upon the 30th day, requiring a refreshed material cost evaluation to re-issue.
                </li>
              </ul>
            </section>

            {/* Section 5: Brand Protection - Non-Returnable Categories & Strict Exclusions */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                5. Strict Return Exclusions (Non-Returnable Items)
              </h2>
              <p>
                Under no circumstances will returns, replacements, or refunds be granted for:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-xs">
                <li>Customized, engraved, personalized, or dimensionally altered architectural items.</li>
                <li>Products assembled, wired, installed, mounted, or connected to electrical mains by third-party contractors.</li>
                <li>Objects exhibiting signs of physical wear, chemical tarnishing, exposure to corrosive cleaning agents, drop impacts, or deliberate misuse.</li>
                <li>Items returned without original packaging, interior protective foam, serial barcodes, or proof-of-purchase invoices.</li>
                <li>Items acquired under warehouse clearance sales, archivist studio seconds, or seasonal liquidation tagged &ldquo;Final Sale&rdquo;.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                6. Damaged, Defective or Non-Conforming Items
              </h2>
              <p>
                If a consignment arrives damaged in transit, with defective internal electronic components (for lighting), or contains incorrect dimensions compared to the approved specification:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs">
                <li>Notify our quality desk within <strong>48 hours</strong> of receipt by emailing <strong>support@tavistra.in</strong> with high-resolution photos of the outer box, shipping label, and the specific defect.</li>
                <li>Upon preliminary review, our team will arrange a reverse pickup at zero expense to you.</li>
                <li>Following physical inspection in our workshop, we will fabricate an expedited replacement piece or issue a 100% refund, including delivery charges, in accordance with your statutory rights.</li>
              </ol>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)] font-editorial">
                7. Refund Modalities & Timelines
              </h2>
              <p>
                All refunds are settled through our central banking partner (PhonePe Payment Gateway) and credited directly back to the original funding source:
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>UPI Payments:</strong> 24 to 48 hours post-approval.</li>
                <li><strong>Debit / Credit Cards & Net Banking:</strong> 5 to 7 banking days (subject to issuing bank settlement schedules).</li>
                <li><strong>Cash / Cheque:</strong> Tavistra does not support cash collections or manual bearer cheques. All transactions must conclude electronically.</li>
              </ul>
              <p className="text-xs pt-2">
                A formal Credit Note adhering to Section 34 of the Central Goods and Services Tax Act will be transmitted electronically alongside your refund transaction reference.
              </p>
            </section>

            <div className="pt-8 border-t border-[var(--color-decorative-border)]">
              <p className="text-xs text-[var(--color-muted-light)]">
                To initiate an inquiry or file a support ticket, please contact{" "}
                <Link href="mailto:support@tavistra.in" className="text-[var(--color-bronze)] font-semibold hover:underline">
                  support@tavistra.in
                </Link>{" "}
                referencing your Order Number.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
