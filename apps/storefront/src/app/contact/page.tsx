"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Architectural & Bespoke Commission",
    pincode: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
              For custom architectural commissions, site-specific lighting proposals (Quote Only), general orders, or order-linked support assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Contact Form (Span 7) */}
            <div className="lg:col-span-7">
              {submitted ? (
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-10 text-center space-y-4">
                  <span className="font-editorial text-3xl text-[var(--color-ink)] block">
                    Inquiry Received
                  </span>
                  <p className="text-xs text-[var(--color-muted-light)] leading-relaxed max-w-md mx-auto">
                    Thank you, {formData.name}. Our architectural design desk will review your specifications and contact you within 24 to 48 business hours with a formal proposal or clarification.
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
                        <option>Architectural & Bespoke Commission (Quote Only)</option>
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
                      placeholder="Outline your required dimensions, metal finish preferences, quantities, or reference item name..."
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

            {/* Right Column: Studio Information (Span 5) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-4">
                <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold block">
                  Direct Contacts
                </span>
                <div className="space-y-3 text-xs text-[var(--color-ink)]">
                  <div>
                    <strong className="block text-[var(--color-muted-light)]">Design Desk & Architectural Quotes:</strong>
                    <span>studio@vdesign.in</span>
                  </div>
                  <div>
                    <strong className="block text-[var(--color-muted-light)]">Order Support & Logistics:</strong>
                    <span>support@tavistra.in</span>
                  </div>
                  <div>
                    <strong className="block text-[var(--color-muted-light)]">Operating Studio Hours:</strong>
                    <span>Monday to Saturday, 10:00 AM – 7:00 PM IST</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                  Quote Only Offer Governance
                </h4>
                <p className="text-[11px] text-[var(--color-muted-light)] leading-relaxed">
                  Formal proposals generated for bespoke projects remain locked for 30 calendar days from initial issuance. Work begins upon verified receipt of the 25% advance.
                </p>
                <div className="pt-2">
                  <Link href="/terms" className="text-[11px] text-[var(--color-bronze)] font-semibold hover:underline">
                    Review Commercial Terms →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
