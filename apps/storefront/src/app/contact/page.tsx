"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

function ContactFormContent() {
  const searchParams = useSearchParams();
  const productParam = searchParams.get("product") || "";
  const skuParam = searchParams.get("sku") || "";
  const materialsParam = searchParams.get("materials") || "";
  const subjectParam = searchParams.get("subject") || "Architectural & Bespoke Order (Quote Only)";

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: subjectParam,
    pincode: "",
    productName: productParam,
    message: productParam
      ? `Inquiring for Quote on: ${productParam} (Ref: ${skuParam || "Bespoke"})\nSpecified Materials: ${materialsParam || "Standard Studio Finish"}\n\nProject / Custom Dimensions Requirements:`
      : "",
  });

  // Keep form synchronized if query params change
  useEffect(() => {
    if (productParam) {
      setFormData((prev) => ({
        ...prev,
        productName: productParam,
        subject: subjectParam,
        message: prev.message || `Inquiring for Quote on: ${productParam} (Ref: ${skuParam || "Bespoke"})\nSpecified Materials: ${materialsParam || "Standard Studio Finish"}\n\nProject / Custom Dimensions Requirements:`,
      }));
    }
  }, [productParam, skuParam, materialsParam, subjectParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left Column: Contact Form (Span 7) */}
      <div className="lg:col-span-7">
        {submitted ? (
          <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-10 text-center space-y-4">
            <span className="font-editorial text-3xl text-[var(--color-ink)] block">
              Inquiry Received
            </span>
            <p className="text-xs text-[var(--color-muted-light)] leading-relaxed max-w-md mx-auto">
              Thank you, {formData.name}. Our architectural design desk will review your specifications for{" "}
              <strong>{formData.productName || "your project"}</strong> and contact you within 24 to 48 business hours with a formal proposal.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="inline-block rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pre-filled Reference Badge if coming from a Quote Only Product */}
            {productParam && (
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
            )}

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
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                  Inquiry Nature
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                >
                  <option>Architectural & Bespoke Order (Quote Only)</option>
                  <option>Made to Order Lead Time Query</option>
                  <option>Existing Order Support & Tracking</option>
                  <option>B2B Corporate Invoicing (GST)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                  Delivery PIN Code
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="e.g. 560001"
                  maxLength={6}
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                Project Specification & Details *
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Outline your required dimensions, metal finish preferences, quantities, or site mounting details..."
                className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
            >
              Submit Proposal Request
            </button>
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
              <strong className="block text-[var(--color-muted-light)]">Inquiries & Client Support:</strong>
              <a href="mailto:support@tavistra.in" className="text-[var(--color-bronze)] font-semibold hover:underline">
                support@tavistra.in
              </a>
            </div>
            <div>
              <strong className="block text-[var(--color-muted-light)]">Response Commitment:</strong>
              <span>All direct inquiries & custom proposals reviewed within 24 to 48 business hours.</span>
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
            General Information & Fulfilment
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
              <span><strong>Brand Heritage:</strong> Design-led standalone lifestyle & décor sub-brand of VDesign, requiring zero structural on-site installation.</span>
            </li>
          </ul>
        </div>

        {/* Offer Governance Card */}
        <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/60 p-6 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
            Quote Only Offer Governance
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
              Studio Inquiries & Bespoke Proposals
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-4">
              Connect with Tavistra Studio
            </h1>
            <p className="text-sm text-[var(--color-muted-light)] leading-relaxed max-w-2xl">
              For custom architectural orders, site-specific lighting proposals (Quote Only), general orders, or order-linked support assistance.
            </p>
          </div>

          <Suspense fallback={<div className="py-12 text-center text-xs text-[var(--color-muted-light)]">Loading inquiry desk...</div>}>
            <ContactFormContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
