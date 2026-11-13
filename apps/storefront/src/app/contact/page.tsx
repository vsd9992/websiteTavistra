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

  const initialMode =
    intentParam === "support" || orderParam || ticketParam
      ? "SUPPORT_TICKET"
      : "BULK_QUOTE";

  const [contactMode, setContactMode] = useState<"BULK_QUOTE" | "SUPPORT_TICKET">(initialMode);
  const [ticketCategory, setTicketCategory] = useState("ORDER_INQUIRY");
  const [ticketOrderNumber, setTicketOrderNumber] = useState(orderParam);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  const initialProductName =
    productParam && skuParam && !productParam.toLowerCase().includes(skuParam.toLowerCase())
      ? `${productParam} [${skuParam}]`
      : productParam;

  const defaultSubject =
    searchParams.get("subject") ||
    (initialMode === "SUPPORT_TICKET"
      ? orderParam
        ? `Support Inquiry for Order ${orderParam}`
        : "Client Desk Assistance"
      : intentParam === "bulk"
      ? "Bulk Order Quotation Request"
      : "Architectural & Bespoke Order (Quote Only)");

  const [formData, setFormData] = useState({
    name: "",
    practiceOrStudio: "",
    email: "",
    phone: "",
    subject: defaultSubject,
    pincode: pincodeParam,
    productName: initialProductName,
    quantity: quantityParam || "10",
    message:
      messageParam ||
      (productParam
        ? `Inquiring for Quote on: ${productParam} (Ref: ${skuParam || "Bespoke"})\nSpecified Materials: ${materialsParam || "Standard Studio Finish"}\n\nProject / Custom Dimensions Requirements:`
        : ""),
  });

  // Pre-fill signed-in user identity if fields are empty
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Keep form synchronized if query params change
  useEffect(() => {
    if (orderParam) {
      setTicketOrderNumber(orderParam);
      setContactMode("SUPPORT_TICKET");
    }
    if (productParam || intentParam || messageParam || pincodeParam || quantityParam) {
      setFormData((prev) => ({
        ...prev,
        productName: productParam || prev.productName,
        subject:
          searchParams.get("subject") ||
          (intentParam === "support" || orderParam
            ? orderParam
              ? `Support Inquiry for Order ${orderParam}`
              : "Client Desk Assistance"
            : prev.subject),
        pincode: pincodeParam || prev.pincode,
        quantity: quantityParam || prev.quantity,
        message:
          messageParam ||
          prev.message ||
          (productParam
            ? `Inquiring for Quote on: ${productParam} (Ref: ${skuParam || "Bespoke"})\nSpecified Materials: ${materialsParam || "Standard Studio Finish"}\n\nProject / Custom Dimensions Requirements:`
            : ""),
      }));
    }
  }, [productParam, skuParam, materialsParam, intentParam, messageParam, pincodeParam, quantityParam, orderParam, searchParams]);

  const emailVal = validateEmail(formData.email);
  const mobileVal = validateIndianMobile(formData.phone);

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
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            subject: formData.subject.trim() || "Client Desk Assistance",
            category: ticketCategory,
            orderNumber: ticketOrderNumber.trim() || undefined,
            message: formData.message.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Unable to submit client support ticket.");
        }
        setReferenceNumber(data.ticketNumber || null);
        setSubmitted(true);
      } else {
        const pinCheck =
          formData.pincode.trim().length === 6 ? lookupPincode(formData.pincode.trim()) : null;

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
            // Non-JSON items param fallback
          }
        }

        const res = await fetch("/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            practiceOrStudio: formData.practiceOrStudio,
            email: formData.email,
            phone: formData.phone,
            city: pinCheck?.city ? `${pinCheck.city}, ${pinCheck.state}` : undefined,
            pincode: formData.pincode,
            productName: formData.productName || formData.subject,
            quantity: Math.max(1, parseInt(formData.quantity || "10", 10) || 10),
            message: formData.message,
            lineItems: structuredLineItems && structuredLineItems.length > 0 ? structuredLineItems : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Unable to register commercial inquiry.");
        }
        setReferenceNumber(data.inquiryNumber || null);
        setSubmitted(true);
      }
    } catch (err) {
      setSubmitError((err as Error).message || "Network error submitting request. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left Column: Contact Form (Span 7) */}
      <div className="lg:col-span-7">
        {/* Dual Mode Switcher */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[var(--color-stone)] border border-[var(--color-decorative-border)] mb-8">
          <button
            type="button"
            onClick={() => {
              setContactMode("BULK_QUOTE");
              setSubmitError(null);
              if (formData.subject.includes("Support")) {
                setFormData((prev) => ({ ...prev, subject: "Bulk Order Quotation Request" }));
              }
            }}
            className={`py-3 px-4 rounded-xl text-xs font-semibold transition-all text-center ${
              contactMode === "BULK_QUOTE"
                ? "bg-[var(--color-canvas)] text-[var(--color-ink)] shadow-sm"
                : "text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
            }`}
          >
            <span className="block font-medium">Commercial &amp; Bespoke Quotes</span>
            <span className="text-[10px] opacity-75 font-normal hidden sm:inline">Wholesale &amp; Custom Orders</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setContactMode("SUPPORT_TICKET");
              setSubmitError(null);
              if (!formData.subject || formData.subject.includes("Quotation")) {
                setFormData((prev) => ({
                  ...prev,
                  subject: ticketOrderNumber
                    ? `Support Inquiry for Order ${ticketOrderNumber}`
                    : "Client Desk Assistance",
                }));
              }
            }}
            className={`py-3 px-4 rounded-xl text-xs font-semibold transition-all text-center ${
              contactMode === "SUPPORT_TICKET"
                ? "bg-[var(--color-canvas)] text-[var(--color-ink)] shadow-sm"
                : "text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
            }`}
          >
            <span className="block font-medium">Client Desk &amp; Support Tickets</span>
            <span className="text-[10px] opacity-75 font-normal hidden sm:inline">Order Support &amp; Alterations</span>
          </button>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-10 text-center space-y-5">
            <span className="font-editorial text-3xl text-[var(--color-ink)] block">
              {contactMode === "SUPPORT_TICKET" ? "Support Ticket Registered" : "Inquiry Registered"}
            </span>
            {referenceNumber && (
              <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[var(--color-ink)] text-[var(--color-canvas)]">
                Reference: {referenceNumber}
              </span>
            )}
            <p className="text-xs text-[var(--color-muted-light)] leading-relaxed max-w-md mx-auto">
              {contactMode === "SUPPORT_TICKET" ? (
                <>
                  Thank you, <strong>{formData.name}</strong>. Your support ticket has been formally logged into our studio concierge system under reference <strong className="font-mono">{referenceNumber}</strong>. A confirmation copy has been dispatched to <strong>{formData.email}</strong>.
                </>
              ) : (
                <>
                  Thank you, <strong>{formData.name}</strong>. Our commercial and architectural design desk has logged your request for{" "}
                  <strong>{formData.productName || "your project"}</strong> into our central studio queue. A formal proposal will be dispatched to <strong>{formData.email}</strong>.
                </>
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {contactMode === "SUPPORT_TICKET" && referenceNumber && (
                <Link
                  href={`/track?ticket=${encodeURIComponent(referenceNumber)}&contact=${encodeURIComponent(formData.email)}`}
                  className="w-full sm:w-auto inline-block rounded-full bg-[var(--color-ink)] px-6 py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                >
                  Track Ticket &amp; View Thread →
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
            {/* Visual Context Badges */}
            {contactMode === "SUPPORT_TICKET" ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-blue-900 font-semibold block flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Tavistra Client Concierge Desk
                  </span>
                  <span className="text-xs font-semibold text-[var(--color-ink)]">
                    Direct two-way support desk &amp; pre-production alterations
                  </span>
                  {ticketOrderNumber && (
                    <p className="text-[11px] text-[var(--color-muted-light)]">
                      Linked Consignment: <span className="font-mono font-semibold text-[var(--color-ink)]">{ticketOrderNumber}</span>
                    </p>
                  )}
                </div>
                <span className="rounded-md bg-[var(--color-canvas)] px-2.5 py-1 text-[11px] font-semibold text-blue-800 border border-blue-200">
                  Support Ticket
                </span>
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
                    {formData.productName || "Cart items transferred for wholesale / bulk review"}
                  </span>
                  {formData.pincode && (
                    <p className="text-[11px] text-[var(--color-muted-light)]">
                      Destination PIN Code: <span className="font-semibold text-[var(--color-ink)]">{formData.pincode}</span>
                    </p>
                  )}
                </div>
                <span className="rounded-md bg-[var(--color-canvas)] px-2.5 py-1 text-[11px] font-semibold text-amber-800 border border-amber-200">
                  Bulk Enquiry
                </span>
              </div>
            ) : productParam ? (
              <div className="rounded-xl border border-[var(--color-bronze)]/40 bg-[var(--color-ivory)] p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-bronze)] font-semibold block">
                    Pre-Filled Quote Reference
                  </span>
                  <span className="text-xs font-semibold text-[var(--color-ink)]">
                    {productParam} {skuParam && `(${skuParam})`}
                  </span>
                </div>
                <span className="rounded-md bg-[var(--color-canvas)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-ink)] border border-[var(--color-decorative-border)]/60">
                  Quote Only
                </span>
              </div>
            ) : null}

            {submitError && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900">
                ⚠ {submitError}
              </div>
            )}

            {/* Support Ticket Mode Fields */}
            {contactMode === "SUPPORT_TICKET" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Inquiry Category *
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    >
                      <option value="ORDER_INQUIRY">Order Status &amp; Production Schedule</option>
                      <option value="SPEC_ALTERATION">Pre-Production Alteration (7-Day Grace)</option>
                      <option value="DELIVERY_SCHEDULE">Consignment Dispatch &amp; Delivery Appointment</option>
                      <option value="DAMAGE_REPORT">Transit Damage &amp; QC Inspection Report</option>
                      <option value="CANCELLATION">Pre-Production Cancellation &amp; Statutory Refund</option>
                      <option value="GENERAL_ASSISTANCE">General Concierge Desk Assistance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Order / Quote Reference (Optional)
                    </label>
                    <input
                      type="text"
                      value={ticketOrderNumber}
                      onChange={(e) => setTicketOrderNumber(e.target.value)}
                      placeholder="e.g. TAV-RS-2026-1001 or QTE-20261112-..."
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Client Legal Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ar. Vikramaditya Sharma"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Subject / Topic *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Alteration request for finish selection"
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="vikram@studiovishnu.in"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                    {formData.email && !emailVal.isValid && (
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
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono"
                    />
                    {formData.phone && !mobileVal.isValid && (
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
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your query in detail, including any specific delivery requirements, finish alteration requests, or damage details..."
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !emailVal.isValid || !mobileVal.isValid || !formData.name.trim() || !formData.message.trim()}
                  className="w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {submitting ? "Registering Support Ticket..." : "Submit Support Ticket"}
                </button>
              </>
            ) : (
              /* Commercial & Bulk Quote Mode Fields */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Full Legal Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ar. Vikramaditya Sharma"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Architecture Firm / Studio (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.practiceOrStudio}
                      onChange={(e) => setFormData({ ...formData, practiceOrStudio: e.target.value })}
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="vikram@studio.in"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                    {formData.email && !emailVal.isValid && (
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
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono"
                    />
                    {formData.phone && !mobileVal.isValid && (
                      <p className="text-[11px] text-red-600 mt-1.5 font-medium leading-snug">
                        ⚠ {mobileVal.error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Inquiry Nature
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    >
                      <option>Bulk Order Quotation Request</option>
                      <option>Architectural &amp; Bespoke Order (Quote Only)</option>
                      <option>Made to Order Lead Time Query</option>
                      <option>B2B Corporate Invoicing (GST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Requested Units
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Delivery PIN Code
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                      placeholder="e.g. 560001"
                      maxLength={6}
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono"
                    />
                    {formData.pincode.length === 6 && (() => {
                      const lookup = lookupPincode(formData.pincode);
                      return lookup.isServiceable ? (
                        <p className="text-[11px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                          ✓ Serviceable Hub: {lookup.city}, {lookup.state}
                        </p>
                      ) : (
                        <p className="text-[11px] text-red-600 font-medium mt-1.5">
                          ⚠ {lookup.unserviceableReason || "Destination outside standard delivery network — custom freight required."}
                        </p>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                    Project Specification &amp; Details *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Outline your required dimensions, metal finish preferences, quantities, or site mounting details..."
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !emailVal.isValid || !mobileVal.isValid || !formData.name.trim() || !formData.message.trim()}
                  className="w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {submitting ? "Transmitting Request to Studio..." : "Submit Proposal Request"}
                </button>
              </>
            )}
          </form>
        )}
      </div>

      {/* Right Column: Studio Information & General Tavistra Knowledge (Span 5) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Client Desk Card */}
        <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-4">
          <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold block">
            Tavistra Client Desk
          </span>
          <div className="space-y-3 text-xs text-[var(--color-ink)]">
            <div>
              <strong className="block text-[var(--color-muted-light)]">Inquiries &amp; Client Support:</strong>
              <a href="mailto:support@tavistra.in" className="text-[var(--color-bronze)] font-semibold hover:underline">
                support@tavistra.in
              </a>
            </div>
            <div>
              <strong className="block text-[var(--color-muted-light)]">Response Commitment:</strong>
              <span>All direct inquiries &amp; support tickets reviewed within 24 business hours.</span>
            </div>
            <div>
              <strong className="block text-[var(--color-muted-light)]">Operating Desk Hours:</strong>
              <span>Monday to Saturday, 10:00 AM – 7:00 PM IST</span>
            </div>
          </div>
        </div>

        {/* General Information Card */}
        <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
            General Information &amp; Fulfilment
          </h4>
          <ul className="space-y-2 text-xs text-[var(--color-muted-light)] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-bronze)] mt-1.5 shrink-0"></span>
              <span><strong>Pan-India Insured Dispatch:</strong> Master-crafted in India and delivered via specialized transit-safe freight across all serviceable PIN codes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-bronze)] mt-1.5 shrink-0"></span>
              <span><strong>Statutory GST Invoicing:</strong> Tax-inclusive transparent pricing with formal B2C/B2B GST invoices on all confirmed orders.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-bronze)] mt-1.5 shrink-0"></span>
              <span><strong>Pre-Production Grace:</strong> Dedicated 7-calendar-day alteration window post-advance confirmation before irreversible workshop crafting begins.</span>
            </li>
          </ul>
        </div>

        {/* Offer Governance Card */}
        <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/60 p-6 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
            Offer Governance &amp; Resolution
          </h4>
          <p className="text-[11px] text-[var(--color-muted-light)] leading-relaxed">
            Formal proposals generated for bespoke projects remain locked for 30 calendar days from initial issuance. Production begins upon verified receipt of the 25% advance.
          </p>
          <div className="pt-2">
            <Link href="/terms" className="text-[11px] text-[var(--color-bronze)] font-semibold hover:underline">
              Review Commercial Terms →
            </Link>
          </div>
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
          <div className="border-b border-[var(--color-decorative-border)] pb-8 mb-12">
            <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
              Studio Inquiries &amp; Bespoke Proposals
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-4">
              Connect with Tavistra Studio
            </h1>
            <p className="text-sm text-[var(--color-muted-light)] leading-relaxed max-w-2xl">
              For custom architectural orders, site-specific lighting proposals (Quote Only), general orders, or order-linked support assistance.
            </p>
          </div>

          <Suspense fallback={<div className="py-12 text-center text-xs text-[var(--color-muted-light)]">Loading concierge desk...</div>}>
            <ContactFormContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
