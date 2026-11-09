"use client";

import Link from "next/link";
import { useState, useEffect, use, Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface ProposalPageProps {
  params: Promise<{
    quoteNumber: string;
  }>;
}

interface QuoteData {
  proposal: {
    id: string;
    quoteNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryPincode: string;
    status: "DRAFT" | "ISSUED" | "ACCEPTED" | "EXPIRED" | "SUPERSEDED";
    expiresAt: string;
    acceptedAt: string | null;
    linkedOrderId: string | null;
  };
  latestVersion: {
    versionNumber: number;
    specifications: string;
    quotedAmount: number;
    advanceRequired: number;
    estimatedLeadDays: number;
    validUntil: string;
  };
  daysRemaining: number;
  isExpired: boolean;
  isAccepted: boolean;
}

function QuoteContent({ params }: ProposalPageProps) {
  const resolvedParams = use(params);
  const quoteNumber = decodeURIComponent(resolvedParams.quoteNumber);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<QuoteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedOrderNumber, setAcceptedOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/quotes/${encodeURIComponent(quoteNumber)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Proposal not found");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load quotation proposal");
        setLoading(false);
      });
  }, [quoteNumber]);

  const handleAcceptProposal = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/quotes/${encodeURIComponent(quoteNumber)}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to process acceptance");
      }

      setAcceptedOrderNumber(result.orderNumber);
      // Refresh state
      if (data) {
        setData({
          ...data,
          isAccepted: true,
          proposal: {
            ...data.proposal,
            status: "ACCEPTED",
          },
        });
      }
    } catch (err: unknown) {
      alert((err as Error).message || "Error accepting proposal");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatRupees = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
      <Header />

      <main className="flex-1 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-[var(--color-muted-light)] mb-8">
            <Link href="/" className="hover:text-[var(--color-ink)]">
              Home
            </Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-semibold">Architectural Proposal</span>
            <span>/</span>
            <span className="font-mono">{quoteNumber}</span>
          </nav>

          {loading ? (
            <div className="py-24 text-center text-xs text-[var(--color-muted-light)]">
              Loading formal architectural proposal...
            </div>
          ) : error || !data ? (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 p-8 text-center space-y-3">
              <h2 className="font-editorial text-2xl text-rose-950">Proposal Not Found</h2>
              <p className="text-xs text-rose-800">
                {error || "We could not find an authoritative proposal matching this reference."}
              </p>
              <Link
                href="/contact"
                className="inline-block mt-3 px-5 py-2 rounded-full bg-[var(--color-ink)] text-xs text-[var(--color-canvas)]"
              >
                Contact Studio Concierge
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Proposal Header Banner */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-8 sm:p-10 shadow-sm relative overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-bronze)] block mb-1">
                      Authoritative Architectural Proposal · TAV-07
                    </span>
                    <h1 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
                      {quoteNumber}
                    </h1>
                    <p className="text-xs text-[var(--color-muted-light)] mt-1">
                      Revision {data.latestVersion.versionNumber} · Prepared for {data.proposal.customerName}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {data.isAccepted ? (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ Proposal Accepted & Order Active
                      </span>
                    ) : data.isExpired ? (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                        Offer Expired (30 Days Elapsed)
                      </span>
                    ) : (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                        {data.daysRemaining} Days Remaining in Locked Offer
                      </span>
                    )}
                  </div>
                </div>

                {/* Acceptance Confirmation Success Card */}
                {acceptedOrderNumber && (
                  <div className="mb-6 p-6 rounded-xl bg-emerald-900 text-white space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✓</span>
                      <h3 className="font-semibold text-base">25% Production Advance Verified</h3>
                    </div>
                    <p className="text-xs text-emerald-100 leading-relaxed">
                      Your proposal has successfully transitioned into active workshop production under order reference{" "}
                      <strong className="font-mono text-white underline">{acceptedOrderNumber}</strong>. Our artisans have been notified.
                    </p>
                    <div className="pt-2">
                      <Link
                        href={`/track?orderId=${encodeURIComponent(acceptedOrderNumber)}`}
                        className="inline-block px-5 py-2 rounded-full bg-white text-emerald-950 font-semibold text-xs hover:bg-emerald-50 transition-colors shadow-sm"
                      >
                        Track Production & Milestone QC ↗
                      </Link>
                    </div>
                  </div>
                )}

                {/* Project Specifications */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                    Project Scope & Architectural Specifications
                  </h3>
                  <div className="p-5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-decorative-border)] text-xs text-[var(--color-ink)] leading-relaxed whitespace-pre-line font-mono">
                    {data.latestVersion.specifications}
                  </div>
                </div>

                {/* Ledger Breakdown Card */}
                <div className="mt-8 pt-8 border-t border-[var(--color-decorative-border)] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                  <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-decorative-border)]">
                    <span className="text-[10px] uppercase font-semibold text-[var(--color-muted-light)] block mb-1">
                      Total Quoted Value
                    </span>
                    <span className="font-editorial text-2xl text-[var(--color-ink)]">
                      {formatRupees(data.latestVersion.quotedAmount)}
                    </span>
                    <span className="text-[10px] text-[var(--color-muted-light)] block mt-1">
                      Tax-inclusive (Includes GST & crating)
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-bronze)]/40">
                    <span className="text-[10px] uppercase font-semibold text-[var(--color-bronze)] block mb-1">
                      25% Advance Required
                    </span>
                    <span className="font-editorial text-2xl text-[var(--color-bronze)]">
                      {formatRupees(data.latestVersion.advanceRequired)}
                    </span>
                    <span className="text-[10px] text-[var(--color-muted-light)] block mt-1">
                      Due at formal acceptance
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-decorative-border)]">
                    <span className="text-[10px] uppercase font-semibold text-[var(--color-muted-light)] block mb-1">
                      75% Final Balance
                    </span>
                    <span className="font-editorial text-2xl text-[var(--color-ink)]">
                      {formatRupees(data.latestVersion.quotedAmount - data.latestVersion.advanceRequired)}
                    </span>
                    <span className="text-[10px] text-[var(--color-muted-light)] block mt-1">
                      Due post-QC inspection prior to dispatch
                    </span>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--color-muted-light)]">
                  <span>
                    Estimated Lead Time: <strong className="text-[var(--color-ink)]">{data.latestVersion.estimatedLeadDays} Days</strong>
                  </span>
                  <span>
                    Destination PIN: <strong className="text-[var(--color-ink)] font-mono">{data.proposal.deliveryPincode}</strong>
                  </span>
                  <span>
                    Offer Locked Until:{" "}
                    <strong className="text-[var(--color-ink)]">
                      {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
                        new Date(data.proposal.expiresAt)
                      )}
                    </strong>
                  </span>
                </div>

                {/* Action CTA Button */}
                {!data.isAccepted && (
                  <div className="mt-8 pt-6 border-t border-[var(--color-decorative-border)]">
                    {data.isExpired ? (
                      <div className="text-center p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                        This 30-day offer period has elapsed. Please reach out to{" "}
                        <a href="mailto:concierge@tavistra.in" className="underline font-semibold">
                          concierge@tavistra.in
                        </a>{" "}
                        to request an updated quotation.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <button
                          onClick={handleAcceptProposal}
                          disabled={isProcessing}
                          className="w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-40 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          {isProcessing ? (
                            "Processing Advance Payment..."
                          ) : (
                            `Accept Proposal & Pay 25% Advance (${formatRupees(data.latestVersion.advanceRequired)})`
                          )}
                        </button>
                        <p className="text-center text-[10px] text-[var(--color-muted-light)]">
                          Upon payment, your acquisition is bound under the Made-to-Order craftsmanship schedule and verified in our immutable ledger.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function QuoteDetailPage({ params }: ProposalPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
          <Header />
          <main className="flex-1 py-24 text-center text-xs text-[var(--color-muted-light)]">
            Loading formal proposal...
          </main>
          <Footer />
        </div>
      }
    >
      <QuoteContent params={params} />
    </Suspense>
  );
}

