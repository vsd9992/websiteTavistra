"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { lookupPincode, validateEmail, validateIndianMobile } from "@tavistra/shared";

function ContactFormContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const intentParam = searchParams.get("intent") || "";
  const productParam = searchParams.get("product") || searchParams.get("productName") || "";
  const skuParam = searchParams.get("sku") || "";
  const materialsParam = searchParams.get("materials") || "";
  const quantityParam = searchParams.get("quantity") || "";
  const pincodeParam = searchParams.get("pincode") || "";
  const messageParam = searchParams.get("message") || "";
  const itemsParam = searchParams.get("items") || "";
  const orderParam = searchParams.get("order") || searchParams.get("orderNumber") || "";
  const ticketParam = searchParams.get("ticket") || "";

  // Explicit mode: GENERAL_INQUIRY vs SUPPORT_TICKET
  const initialMode =
    intentParam === "support" || orderParam || ticketParam
      ? "SUPPORT_TICKET"
      : "GENERAL_INQUIRY";

  const [contactMode, setContactMode] = useState<"GENERAL_INQUIRY" | "SUPPORT_TICKET">(initialMode);

  // General Inquiry form state
  const [generalData, setGeneralData] = useState({
    name: "",
    practiceOrStudio: "",
    email: "",
    phone: "",
    subject:
      searchParams.get("subject") ||
      (intentParam === "bulk"
        ? "Bulk / Commercial Order Quotation"
        : "Architectural & Bespoke Order (Quote Only)"),
    pincode: pincodeParam,
    productName: productParam && skuParam && !productParam.toLowerCase().includes(skuParam.toLowerCase())
      ? `${productParam} [${skuParam}]`
      : productParam,
    quantity: quantityParam || "10",
    message:
      messageParam ||
      (productParam
        ? `Inquiring for Quote on: ${productParam} (Ref: ${skuParam || "Bespoke"})\nSpecified Materials: ${materialsParam || "Standard Studio Finish"}\n\nProject Scope & Custom Dimension Details:`
        : ""),
  });

  // Support Ticket form state
  const [ticketData, setTicketData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "ORDER_INQUIRY",
    orderNumber: orderParam,
    subject:
      orderParam
        ? `Support Inquiry for Order ${orderParam}`
        : searchParams.get("subject") || "Client Desk Assistance",
    message: messageParam || "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  // Pre-fill authenticated client identity
  useEffect(() => {
    if (user) {
      setGeneralData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        practiceOrStudio: prev.practiceOrStudio || user.practiceOrStudio || "",
      }));
      setTicketData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Synchronize when query parameters change
  useEffect(() => {
    if (intentParam === "support" || orderParam) {
      setContactMode("SUPPORT_TICKET");
      if (orderParam) {
        setTicketData((prev) => ({
          ...prev,
          orderNumber: orderParam,
          subject: prev.subject.includes("Order") ? prev.subject : `Support Inquiry for Order ${orderParam}`,
        }));
      }
    }
  }, [intentParam, orderParam]);

  // Field validations
  const activeEmail = contactMode === "SUPPORT_TICKET" ? ticketData.email : generalData.email;
  const activePhone = contactMode === "SUPPORT_TICKET" ? ticketData.phone : generalData.phone;
  const activeName = contactMode === "SUPPORT_TICKET" ? ticketData.name : generalData.name;
  const activeMessage = contactMode === "SUPPORT_TICKET" ? ticketData.message : generalData.message;

  const emailVal = validateEmail(activeEmail);
  const mobileVal = validateIndianMobile(activePhone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!emailVal.isValid || !mobileVal.isValid) {
      return;
    }

    setSubmitting(true);
    try {
      if (contactMode === "SUPPORT_TICKET") {
        const res = await fetch("/api/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: ticketData.name.trim(),
            email: ticketData.email.trim(),
            phone: ticketData.phone.trim(),
            category: ticketData.category,
            orderNumber: ticketData.orderNumber.trim() || undefined,
            subject: ticketData.subject.trim() || "Client Desk Assistance",
            message: ticketData.message.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Unable to register client support ticket.");
        }
        setReferenceNumber(data.ticketNumber || null);
        setSubmitted(true);
      } else {
        const pinCheck =
          generalData.pincode.trim().length === 6 ? lookupPincode(generalData.pincode.trim()) : null;

        let structuredLineItems: Array<{ name: string; finish?: string; quantity: number; unitPriceRupees: number }> | undefined = undefined;
        if (itemsParam) {
          try {
            const raw = JSON.parse(itemsParam);
            if (Array.isArray(raw) && raw.length > 0) {
              structuredLineItems = raw
                .filter((it: any) => it && typeof it.name === "string" && it.name.trim())
                .map((it: any) => ({
                  name: String(it.name).trim(),
                  finish: it.finish ? String(it.finish).trim() : "Standard Studio Finish",
                  quantity: Math.max(1, Number(it.quantity) || 1),
                  unitPriceRupees: Math.max(0, Number(it.unitPriceRupees) || 0),
                }));
            }
          } catch {
            // Non-JSON fallback
          }
        }

        const res = await fetch("/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: generalData.name.trim(),
            practiceOrStudio: generalData.practiceOrStudio.trim() || undefined,
            email: generalData.email.trim(),
            phone: generalData.phone.trim(),
            city: pinCheck?.city ? `${pinCheck.city}, ${pinCheck.state}` : undefined,
            pincode: generalData.pincode.trim() || undefined,
            productName: generalData.productName || generalData.subject,
            quantity: Math.max(1, parseInt(generalData.quantity || "10", 10) || 10),
            message: generalData.message.trim(),
            lineItems: structuredLineItems && structuredLineItems.length > 0 ? structuredLineItems : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Unable to register studio inquiry.");
        }
        setReferenceNumber(data.inquiryNumber || null);
        setSubmitted(true);
      }
    } catch (err) {
      setSubmitError((err as Error).message || "Network error transmitting request. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left Column: Form & Switcher (Span 7) */}
      <div className="lg:col-span-7">
        {/* Top-Level Mode Selector */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[var(--color-stone)] border border-[var(--color-decorative-border)] mb-8">
          <button
            type="button"
            onClick={() => {
              setContactMode("GENERAL_INQUIRY");
              setSubmitError(null);
            }}
            className={`py-3.5 px-4 rounded-xl text-xs font-semibold transition-all text-center ${
              contactMode === "GENERAL_INQUIRY"
                ? "bg-[var(--color-canvas)] text-[var(--color-ink)] shadow-sm"
                : "text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
            }`}
          >
            <span className="block font-medium">General &amp; Studio Inquiry</span>
            <span className="text-[10px] opacity-75 font-normal hidden sm:inline">
              Bespoke Proposals, Visits &amp; Trade
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setContactMode("SUPPORT_TICKET");
              setSubmitError(null);
            }}
            className={`py-3.5 px-4 rounded-xl text-xs font-semibold transition-all text-center relative ${
              contactMode === "SUPPORT_TICKET"
                ? "bg-[var(--color-canvas)] text-[var(--color-ink)] shadow-sm"
                : "text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
            }`}
          >
            <span className="block font-medium flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[var(--color-bronze)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Raise Support Ticket
            </span>
            <span className="text-[10px] opacity-75 font-normal hidden sm:inline">
              Order Support, Alterations &amp; Damage
            </span>
          </button>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-10 text-center space-y-5">
            <span className="font-editorial text-3xl text-[var(--color-ink)] block">
              {contactMode === "SUPPORT_TICKET" ? "Support Ticket Registered" : "Studio Inquiry Dispatched"}
            </span>
            {referenceNumber && (
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-[var(--color-ink)] text-[var(--color-canvas)]">
                Reference: {referenceNumber}
              </span>
            )}
            <p className="text-xs text-[var(--color-muted-light)] leading-relaxed max-w-md mx-auto">
              {contactMode === "SUPPORT_TICKET" ? (
                <>
                  Thank you, <strong>{ticketData.name}</strong>. Your ticket has been formally registered with our client concierge desk under reference <strong className="font-mono">{referenceNumber}</strong>. An acknowledgment notice has been emailed to <strong>{ticketData.email}</strong>.
                </>
              ) : (
                <>
                  Thank you, <strong>{generalData.name}</strong>. Your inquiry has been routed to our studio design and commercial desk. A formal response will be dispatched to <strong>{generalData.email}</strong> within 24 to 48 business hours.
                </>
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              {contactMode === "SUPPORT_TICKET" && referenceNumber && (
                <Link
                  href={`/track-ticket?ticket=${encodeURIComponent(referenceNumber)}&contact=${encodeURIComponent(ticketData.email)}`}
                  className="w-full sm:w-auto inline-block rounded-full bg-[var(--color-ink)] px-6 py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                >
                  Track Your Support Ticket Online →
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setReferenceNumber(null);
                }}
                className="w-full sm:w-auto inline-block rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-6 py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Context Notice / Header info */}
            {contactMode === "SUPPORT_TICKET" ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-blue-900 font-bold block flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Client Concierge Desk Support
                  </span>
                  <p className="text-xs text-[var(--color-ink)]">
                    For existing orders, 7-day pre-production grace alterations, transit reports, or refunds.
                  </p>
                  {ticketData.orderNumber && (
                    <p className="text-[11px] text-[var(--color-muted-light)] font-mono">
                      Target Order: <strong className="text-[var(--color-ink)]">{ticketData.orderNumber}</strong>
                    </p>
                  )}
                </div>
                <Link
                  href="/track-ticket"
                  className="shrink-0 text-xs font-semibold text-blue-800 hover:text-blue-950 underline flex items-center gap-1"
                >
                  Already have a ticket? Track here →
                </Link>
              </div>
            ) : intentParam === "bulk" ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-amber-900 font-semibold block flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Bulk Order Quotation Transfer
                  </span>
                  <span className="text-xs font-semibold text-[var(--color-ink)]">
                    {generalData.productName || "Cart items transferred for wholesale review"}
                  </span>
                </div>
                <span className="rounded-md bg-[var(--color-canvas)] px-2.5 py-1 text-[11px] font-semibold text-amber-800 border border-amber-200">
                  Bulk Enquiry
                </span>
              </div>
            ) : null}

            {submitError && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900">
                ⚠ {submitError}
              </div>
            )}

            {/* MODE 1: RAISE SUPPORT TICKET */}
            {contactMode === "SUPPORT_TICKET" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Support Category *
                    </label>
                    <select
                      value={ticketData.category}
                      onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    >
                      <option value="ORDER_INQUIRY">Order Status &amp; Production Schedule</option>
                      <option value="SPEC_ALTERATION">Pre-Production Alteration (7-Day Grace)</option>
                      <option value="DELIVERY_SCHEDULE">Delivery Coordination &amp; Courier Inquiries</option>
                      <option value="DAMAGE_REPORT">Transit Damage &amp; Inspection Report (High Priority)</option>
                      <option value="CANCELLATION">Order Cancellation &amp; Statutory Refund</option>
                      <option value="GENERAL_ASSISTANCE">General Client Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Order / Consignment Reference (Optional)
                    </label>
                    <input
                      type="text"
                      value={ticketData.orderNumber}
                      onChange={(e) => setTicketData({ ...ticketData, orderNumber: e.target.value })}
                      placeholder="e.g. TAV-RS-2026-1001 or TAV-QTE-..."
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono"
                    />
                    <p className="text-[10px] text-[var(--color-muted-light)] mt-1">
                      Include your order reference if your query concerns an existing purchase.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Full Legal Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={ticketData.name}
                      onChange={(e) => setTicketData({ ...ticketData, name: e.target.value })}
                      placeholder="e.g. Ar. Vikramaditya Sharma"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Subject / Issue Summary *
                    </label>
                    <input
                      required
                      type="text"
                      value={ticketData.subject}
                      onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                      placeholder="e.g. Finish alteration request for wall piece"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Registered Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      value={ticketData.email}
                      onChange={(e) => setTicketData({ ...ticketData, email: e.target.value })}
                      placeholder="name@studio.in"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                    {ticketData.email && !emailVal.isValid && (
                      <p className="text-[11px] text-red-600 mt-1.5 font-medium leading-snug">
                        ⚠ {emailVal.error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Contact Mobile Number *
                    </label>
                    <input
                      required
                      type="tel"
                      value={ticketData.phone}
                      onChange={(e) => setTicketData({ ...ticketData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono"
                    />
                    {ticketData.phone && !mobileVal.isValid && (
                      <p className="text-[11px] text-red-600 mt-1.5 font-medium leading-snug">
                        ⚠ {mobileVal.error}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                    Detailed Query &amp; Request Specifications *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={ticketData.message}
                    onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                    placeholder="Provide full details regarding your alteration, delivery instruction, transit damage report, or query..."
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !emailVal.isValid || !mobileVal.isValid || !ticketData.name.trim() || !ticketData.message.trim()}
                  className="w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {submitting ? "Registering Support Ticket..." : "Submit Support Ticket"}
                </button>
              </>
            ) : (
              /* MODE 2: GENERAL STUDIO & COMMERCIAL INQUIRY */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Full Legal Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={generalData.name}
                      onChange={(e) => setGeneralData({ ...generalData, name: e.target.value })}
                      placeholder="e.g. Ar. Vikramaditya Sharma"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Architecture Firm / Practice (Optional)
                    </label>
                    <input
                      type="text"
                      value={generalData.practiceOrStudio}
                      onChange={(e) => setGeneralData({ ...generalData, practiceOrStudio: e.target.value })}
                      placeholder="e.g. Studio Vayu Architecture"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      value={generalData.email}
                      onChange={(e) => setGeneralData({ ...generalData, email: e.target.value })}
                      placeholder="vikram@studio.in"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                    {generalData.email && !emailVal.isValid && (
                      <p className="text-[11px] text-red-600 mt-1.5 font-medium leading-snug">
                        ⚠ {emailVal.error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Mobile Number *
                    </label>
                    <input
                      required
                      type="tel"
                      value={generalData.phone}
                      onChange={(e) => setGeneralData({ ...generalData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono"
                    />
                    {generalData.phone && !mobileVal.isValid && (
                      <p className="text-[11px] text-red-600 mt-1.5 font-medium leading-snug">
                        ⚠ {mobileVal.error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Inquiry Nature / Subject *
                    </label>
                    <select
                      value={generalData.subject}
                      onChange={(e) => setGeneralData({ ...generalData, subject: e.target.value })}
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    >
                      <option>Architectural &amp; Bespoke Order (Quote Only)</option>
                      <option>General Studio Inquiry &amp; Visit</option>
                      <option>Trade &amp; Architecture Partnership</option>
                      <option>Material Finishes &amp; Sample Request</option>
                      <option>Bulk / Commercial Order Quotation</option>
                      <option>Corporate &amp; Hospitality Project</option>
                      <option>Other Query</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Delivery PIN (Optional)
                    </label>
                    <input
                      type="text"
                      value={generalData.pincode}
                      onChange={(e) => setGeneralData({ ...generalData, pincode: e.target.value.replace(/\D/g, "") })}
                      placeholder="e.g. 560001"
                      maxLength={6}
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono"
                    />
                    {generalData.pincode.length === 6 && (() => {
                      const lookup = lookupPincode(generalData.pincode);
                      return lookup.isServiceable ? (
                        <p className="text-[10px] text-emerald-700 font-medium mt-1">
                          ✓ Hub: {lookup.city}, {lookup.state}
                        </p>
                      ) : (
                        <p className="text-[10px] text-amber-700 font-medium mt-1">
                          Custom freight zone
                        </p>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                    Project Specification &amp; Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={generalData.message}
                    onChange={(e) => setGeneralData({ ...generalData, message: e.target.value })}
                    placeholder="Outline your project scope, custom dimensions, preferred finishes, or studio questions..."
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !emailVal.isValid || !mobileVal.isValid || !generalData.name.trim() || !generalData.message.trim()}
                  className="w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {submitting ? "Transmitting to Studio..." : "Send Studio Inquiry"}
                </button>
              </>
            )}
          </form>
        )}
      </div>

      {/* Right Column: Studio Information & Support Portal Shortcuts (Span 5) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Support Portal Card */}
        <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold">
              Client Concierge Desk
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Active Desk
            </span>
          </div>

          <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
            Need assistance with an existing order, wish to request finish alterations during your 7-day grace period, or report a delivery issue?
          </p>

          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={() => {
                setContactMode("SUPPORT_TICKET");
                setSubmitted(false);
              }}
              className="w-full rounded-xl bg-[var(--color-ink)] py-3 px-4 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors text-center block shadow-sm"
            >
              Raise a Support Ticket Now →
            </button>
            <Link
              href="/track-ticket"
              className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] py-3 px-4 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors text-center block"
            >
              Track Existing Support Ticket →
            </Link>
          </div>
        </div>

        {/* Operating Hours & Direct Email */}
        <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 space-y-3 text-xs text-[var(--color-ink)]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
            Studio Desk Hours &amp; Contacts
          </h4>
          <div className="space-y-2 text-[var(--color-muted-light)]">
            <div>
              <strong className="block text-[var(--color-ink)]">Client Desk Email:</strong>
              <a href="mailto:concierge@tavistra.in" className="text-[var(--color-bronze)] font-semibold hover:underline">
                concierge@tavistra.in
              </a>
            </div>
            <div>
              <strong className="block text-[var(--color-ink)]">Operating Hours:</strong>
              <span>Monday to Saturday, 10:00 AM – 7:00 PM IST</span>
            </div>
            <div>
              <strong className="block text-[var(--color-ink)]">Response Commitment:</strong>
              <span>All direct inquiries &amp; support tickets reviewed within 24 business hours.</span>
            </div>
          </div>
        </div>

        {/* Studio Policy Card */}
        <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/60 p-6 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
            7-Day Pre-Production Alterations
          </h4>
          <p className="text-[11px] text-[var(--color-muted-light)] leading-relaxed">
            All Made-to-Order and bespoke consignments enjoy an authoritative 7-day post-advance grace period. You may request finish or dimension alterations via a support ticket before craftsmanship begins.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-16 px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="border-b border-[var(--color-decorative-border)] pb-8 mb-10">
            <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
              Tavistra Studio &amp; Concierge Desk
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-3">
              Connect with Tavistra
            </h1>
            <p className="text-sm text-[var(--color-muted-light)] leading-relaxed max-w-2xl">
              Choose between submitting a general architectural inquiry or raising a client support ticket for order assistance, alterations, and courier coordination.
            </p>
          </div>

          <Suspense fallback={<div className="py-12 text-center text-xs text-[var(--color-muted-light)]">Loading studio desk...</div>}>
            <ContactFormContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
