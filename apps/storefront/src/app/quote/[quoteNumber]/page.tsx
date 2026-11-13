"use client";

import Link from "next/link";
import { useState, useEffect, use, Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

import { parseQuoteLineItems, QuoteLineItem } from "@tavistra/shared";

interface ProposalPageProps {
  params: Promise<{
    quoteNumber: string;
  }>;
}

interface QuoteVersionDto {
  id: string;
  versionNumber: number;
  specifications: string;
  lineItemsJson?: string | null;
  deliveryCharge?: number | string;
  quotedAmount: number | string;
  advanceRequired: number | string;
  estimatedLeadDays: number;
  validUntil: string;
  createdAt?: string;
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
    versions: QuoteVersionDto[];
  };
  latestVersion: QuoteVersionDto;
  lineItems?: QuoteLineItem[];
  deliveryChargeRupees?: number;
  linkedOrderNumber?: string | null;
  linkedOrderStatus?: string | null;
  daysRemaining: number;
  expiresToday?: boolean;
  isExpired: boolean;
  isAccepted: boolean;
}

function QuoteContent({ params }: ProposalPageProps) {
  const resolvedParams = use(params);
  const quoteNumber = decodeURIComponent(resolvedParams.quoteNumber);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<QuoteData | null>(null);
  const [selectedVersionNum, setSelectedVersionNum] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedOrderNumber, setAcceptedOrderNumber] = useState<string | null>(null);
  const [acceptedOrderStatus, setAcceptedOrderStatus] = useState<string | null>(null);

  const loadProposal = () => {
    setLoading(true);
    fetch(`/api/quotes/${encodeURIComponent(quoteNumber)}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Proposal not found");
        return res.json();
      })
      .then((d: QuoteData) => {
        setData(d);
        setSelectedVersionNum(d.latestVersion?.versionNumber || 1);
        if (d.linkedOrderNumber) {
          setAcceptedOrderNumber(d.linkedOrderNumber);
        }
        if (d.linkedOrderStatus) {
          setAcceptedOrderStatus(d.linkedOrderStatus);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load quotation proposal");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProposal();
  }, [quoteNumber]);

  const handleAcceptProposal = async () => {
    if (!data?.latestVersion) return;
    setIsProcessing(true);
    setAcceptError(null);
    try {
      const res = await fetch(`/api/quotes/${encodeURIComponent(quoteNumber)}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptedVersionNumber: data.latestVersion.versionNumber,
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          loadProposal();
        }
        throw new Error(result.error || "Failed to process acceptance");
      }

      setAcceptedOrderNumber(result.orderNumber);
      setData({
        ...data,
        isAccepted: true,
        linkedOrderNumber: result.orderNumber,
        proposal: {
          ...data.proposal,
          status: "ACCEPTED",
        },
      });
    } catch (err: unknown) {
      setAcceptError((err as Error).message || "Unable to accept proposal right now.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatRupees = (val: number | string) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(val || 0));

  const versionsList = data?.proposal.versions || (data?.latestVersion ? [data.latestVersion] : []);
  const activeVersion =
    versionsList.find((v) => v.versionNumber === selectedVersionNum) || data?.latestVersion;
  const isViewingLatest =
    activeVersion && data?.latestVersion && activeVersion.versionNumber === data.latestVersion.versionNumber;
  const activeLineItems = activeVersion
    ? parseQuoteLineItems(activeVersion.lineItemsJson)
    : data?.lineItems || [];
  const activeDeliveryCharge = activeVersion
    ? Number(activeVersion.deliveryCharge ?? data?.deliveryChargeRupees ?? 0)
    : 0;
  const activeQuoted = activeVersion ? Number(activeVersion.quotedAmount) : 0;
  const activeAdvance = activeVersion ? Number(activeVersion.advanceRequired) : 0;
  const activeBalance = Math.max(0, activeQuoted - activeAdvance);
  const resolvedOrderRef = acceptedOrderNumber || data?.linkedOrderNumber;

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
            <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-12 text-center space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-bronze)] block">
                Tavistra Commercial Archive
              </span>
              <h2 className="font-editorial text-3xl text-[var(--color-ink)]">Proposal Not Found</h2>
              <p className="text-xs text-[var(--color-muted-light)] max-w-md mx-auto leading-relaxed">
                We could not locate an active architectural proposal matching reference{" "}
                <strong className="font-mono text-[var(--color-ink)]">{quoteNumber}</strong>. Please verify the quotation link from your official notice or request assistance from our concierge desk.
              </p>
              <Link
                href="/contact"
                className="inline-block mt-3 px-6 py-2.5 rounded-full bg-[var(--color-ink)] text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors"
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
                      Prepared for <strong className="text-[var(--color-ink)]">{data.proposal.customerName}</strong> · PIN {data.proposal.deliveryPincode}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {data.isAccepted ? (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ Proposal Accepted &amp; Production Active
                      </span>
                    ) : data.isExpired ? (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                        Offer Expired (30-Day Clock Elapsed)
                      </span>
                    ) : (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                        {data.daysRemaining} Days Remaining in 30-Day Lock
                      </span>
                    )}
                  </div>
                </div>

                {/* Revision History Tabs */}
                {versionsList.length > 1 && (
                  <div className="mb-6 p-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-decorative-border)] flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-[var(--color-muted-light)] mr-1">
                      Proposal Revisions:
                    </span>
                    {versionsList.map((ver) => {
                      const isSelected = ver.versionNumber === selectedVersionNum;
                      const isLatest = ver.versionNumber === data.latestVersion.versionNumber;
                      return (
                        <button
                          key={ver.id || ver.versionNumber}
                          type="button"
                          onClick={() => setSelectedVersionNum(ver.versionNumber)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            isSelected
                              ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
                              : "bg-[var(--color-ivory)] text-[var(--color-ink)] border border-[var(--color-control-border)] hover:bg-[var(--color-stone)]"
                          }`}
                        >
                          Rev {ver.versionNumber} {isLatest ? "(Latest)" : ""}
                        </button>
                      );
                    })}
                    {!isViewingLatest && (
                      <span className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 ml-auto">
                        Viewing historical revision {selectedVersionNum}. Switch to Rev {data.latestVersion.versionNumber} to accept.
                      </span>
                    )}
                  </div>
                )}

                {/* Acceptance / Converted Order Card */}
                {resolvedOrderRef && (
                  acceptedOrderStatus === "CANCELLED" || acceptedOrderStatus === "REFUNDED" ? (
                    <div className="mb-6 p-6 rounded-xl bg-rose-950 text-white border border-rose-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">✕</span>
                          <h3 className="font-semibold text-base">Converted Order Cancelled &amp; Refunded</h3>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-900 border border-rose-700 text-rose-200 uppercase">
                          100% Refund Issued
                        </span>
                      </div>
                      <p className="text-xs text-rose-200 leading-relaxed">
                        The order converted from this proposal (<strong className="font-mono text-white underline">{resolvedOrderRef}</strong>) was cancelled prior to physical workshop production. A 100% statutory pre-production refund has been processed.
                      </p>
                      <div className="pt-2">
                        <Link
                          href={`/track?orderId=${encodeURIComponent(resolvedOrderRef)}`}
                          className="inline-block px-5 py-2 rounded-full bg-white text-rose-950 font-semibold text-xs hover:bg-rose-50 transition-colors shadow-sm"
                        >
                          View Cancellation &amp; Refund Ledger ↗
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 p-6 rounded-xl bg-emerald-900 text-white space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">✓</span>
                        <h3 className="font-semibold text-base">25% Production Advance Verified</h3>
                      </div>
                      <p className="text-xs text-emerald-100 leading-relaxed">
                        Your proposal has successfully transitioned into active workshop production under order reference{" "}
                        <strong className="font-mono text-white underline">{resolvedOrderRef}</strong>. Our artisans have been notified.
                      </p>
                      <div className="pt-2">
                        <Link
                          href={`/track?orderId=${encodeURIComponent(resolvedOrderRef)}`}
                          className="inline-block px-5 py-2 rounded-full bg-white text-emerald-950 font-semibold text-xs hover:bg-emerald-50 transition-colors shadow-sm"
                        >
                          Track Production Milestones &amp; QC Photos ↗
                        </Link>
                      </div>
                    </div>
                  )
                )}

                {/* Error Banner */}
                {acceptError && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 space-y-1">
                    <div className="font-semibold">⚠ Acceptance Notice</div>
                    <div>{acceptError}</div>
                  </div>
                )}

                {/* Structured Line Items Table if present */}
                {activeLineItems.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                      Bespoke Architectural Line Items (Revision {activeVersion?.versionNumber})
                    </h3>
                    <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[var(--color-ivory)] border-b border-[var(--color-decorative-border)] text-[11px] uppercase tracking-wider text-[var(--color-muted-light)] font-semibold">
                          <tr>
                            <th className="py-2.5 px-4">#</th>
                            <th className="py-2.5 px-4">Edition / Specification</th>
                            <th className="py-2.5 px-4 text-center">Qty</th>
                            <th className="py-2.5 px-4 text-right">Unit Rate</th>
                            <th className="py-2.5 px-4 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-decorative-border)]">
                          {activeLineItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-[var(--color-ivory)]/40 transition-colors">
                              <td className="py-3 px-4 font-mono text-[var(--color-muted-light)]">{idx + 1}</td>
                              <td className="py-3 px-4">
                                <strong className="text-[var(--color-ink)] block">{item.name}</strong>
                                {item.finish && (
                                  <span className="text-[11px] text-[var(--color-bronze)]">{item.finish}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-[var(--color-ink)]">{item.quantity}</td>
                              <td className="py-3 px-4 text-right font-mono text-[var(--color-muted-light)]">
                                {formatRupees(item.unitPriceRupees)}
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-[var(--color-ink)]">
                                {formatRupees(item.quantity * item.unitPriceRupees)}
                              </td>
                            </tr>
                          ))}
                          {activeDeliveryCharge > 0 && (
                            <tr className="bg-[var(--color-ivory)]/40">
                              <td colSpan={4} className="py-3 px-4 font-medium text-[var(--color-ink)]">
                                Custom Insured Wooden Crating &amp; White-Glove Freight
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-[var(--color-ink)]">
                                {formatRupees(activeDeliveryCharge)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Project Specifications */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                    Project Scope &amp; Architectural Specifications
                  </h3>
                  <div className="p-5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-decorative-border)] text-xs text-[var(--color-ink)] leading-relaxed whitespace-pre-line font-mono">
                    {activeVersion?.specifications || "No specifications recorded."}
                  </div>
                </div>

                {/* Ledger Breakdown Card */}
                <div className="mt-8 pt-8 border-t border-[var(--color-decorative-border)] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                  <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-decorative-border)]">
                    <span className="text-[10px] uppercase font-semibold text-[var(--color-muted-light)] block mb-1">
                      Total Quoted Value
                    </span>
                    <span className="font-editorial text-2xl text-[var(--color-ink)]">
                      {formatRupees(activeQuoted)}
                    </span>
                    <span className="text-[10px] text-[var(--color-muted-light)] block mt-1">
                      Tax-inclusive (Includes GST &amp; crating)
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-bronze)]/40">
                    <span className="text-[10px] uppercase font-semibold text-[var(--color-bronze)] block mb-1">
                      25% Advance Required
                    </span>
                    <span className="font-editorial text-2xl text-[var(--color-bronze)]">
                      {formatRupees(activeAdvance)}
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
                      {formatRupees(activeBalance)}
                    </span>
                    <span className="text-[10px] text-[var(--color-muted-light)] block mt-1">
                      Due post-QC inspection prior to dispatch
                    </span>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--color-muted-light)]">
                  <span>
                    Estimated Lead Time: <strong className="text-[var(--color-ink)]">{activeVersion?.estimatedLeadDays || 28} Days</strong>
                  </span>
                  <span>
                    Destination PIN: <strong className="text-[var(--color-ink)] font-mono">{data.proposal.deliveryPincode}</strong>
                  </span>
                  <span>
                    Offer Locked Until:{" "}
                    <strong className="text-[var(--color-ink)]">
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "Asia/Kolkata",
                      }).format(new Date(data.proposal.expiresAt))}
                    </strong>
                  </span>
                </div>

                {/* Action CTA Button */}
                {!data.isAccepted && (
                  <div className="mt-8 pt-6 border-t border-[var(--color-decorative-border)]">
                    {data.isExpired ? (
                      <div className="text-center p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
                        <strong className="block text-sm">30-Day Offer Period Has Elapsed</strong>
                        <p>
                          Under studio policy (TAV-07), initial material allocation and artisanal pricing are held for exactly 30 calendar days. Please contact our client concierge to obtain a refreshed quotation.
                        </p>
                        <div className="pt-2">
                          <Link
                            href="/contact"
                            className="inline-block px-5 py-2 rounded-full bg-[var(--color-ink)] text-xs text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)]"
                          >
                            Request Refreshed Quotation
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <button
                          onClick={handleAcceptProposal}
                          disabled={isProcessing || !isViewingLatest}
                          className="w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-40 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          {isProcessing ? (
                            "Verifying Advance Payment & Generating Order..."
                          ) : !isViewingLatest ? (
                            `Switch to Latest Rev ${data.latestVersion.versionNumber} to Accept`
                          ) : (
                            `Accept Proposal & Pay 25% Advance (${formatRupees(data.latestVersion.advanceRequired)})`
                          )}
                        </button>
                        <p className="text-center text-[10px] text-[var(--color-muted-light)]">
                          Upon payment, your acquisition transitions into Made-to-Order craftsmanship schedule under an independent 7-day pre-production grace window.
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

