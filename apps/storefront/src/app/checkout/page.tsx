"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import {
  resolveShippingZone,
  calculateDeliveryFee,
  calculateOrderDeliveryFee,
  checkBulkOrderCeiling,
  lookupPincode,
  validateIndianMobile,
  validateEmail,
  PincodeLookupResult,
  ItemPhysicalSpec,
  ShippingCalculationResult,
} from "@tavistra/shared";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const modeParam: "READY_STOCK" | "MADE_TO_ORDER" =
    searchParams.get("mode") === "made_to_order" ? "MADE_TO_ORDER" : "READY_STOCK";
  const initialPin = searchParams.get("pincode") || "";

  const { readyStockItems, mtoItems, clearCart } = useCart();
  const activeItems = modeParam === "READY_STOCK" ? readyStockItems : mtoItems;

  // Form State
  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "Delhi",
    pincode: initialPin,
    gstin: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phone?: string;
    email?: string;
    address1?: string;
  }>({});

  const [touched, setTouched] = useState<{
    fullName?: boolean;
    phone?: boolean;
    email?: boolean;
    address1?: boolean;
  }>({});

  const [shippingResult, setShippingResult] = useState<ShippingCalculationResult | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    mode: "READY_STOCK" | "MADE_TO_ORDER";
    customerName: string;
    email: string;
    phone: string;
    destinationPin: string;
    totalAmountRupees: number;
    amountPaidRupees: number;
    balanceDueRupees: number;
    items: { name: string; quantity: number; pricePaise: number }[];
    transitEstimate: string;
    createdAt: string;
  } | null>(null);

  const formatPrice = (paise: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);

  // Bulk boundary check
  const bulkCheck = checkBulkOrderCeiling(
    activeItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }))
  );

  // Live Contact & Address Validations
  const emailValidation = validateEmail(customer.email);
  const mobileValidation = validateIndianMobile(customer.phone);
  const isNameValid = customer.fullName.trim().length >= 2;
  const isAddressValid = customer.address1.trim().length >= 5;
  const isCityValid = customer.city.trim().length >= 2;
  const isStateValid = customer.state.trim().length >= 2;
  const isPinValid = customer.pincode.trim().length === 6 && shippingResult !== null && !pinError;

  const isFormValid =
    emailValidation.isValid &&
    mobileValidation.isValid &&
    isNameValid &&
    isAddressValid &&
    isCityValid &&
    isStateValid &&
    isPinValid &&
    !bulkCheck.isBulkEnquiryRequired;

  const handleBlur = (field: "fullName" | "phone" | "email" | "address1") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "phone") {
      const res = validateIndianMobile(customer.phone);
      setFieldErrors((prev) => ({ ...prev, phone: res.isValid ? undefined : res.error }));
    } else if (field === "email") {
      const res = validateEmail(customer.email);
      setFieldErrors((prev) => ({ ...prev, email: res.isValid ? undefined : res.error }));
    } else if (field === "fullName") {
      const valid = customer.fullName.trim().length >= 2;
      setFieldErrors((prev) => ({
        ...prev,
        fullName: valid ? undefined : "Please enter your full legal name (at least 2 characters).",
      }));
    } else if (field === "address1") {
      const valid = customer.address1.trim().length >= 5;
      setFieldErrors((prev) => ({
        ...prev,
        address1: valid ? undefined : "Please enter a complete delivery address (building, street).",
      }));
    }
  };

  const handlePhoneChange = (val: string) => {
    setCustomer((prev) => ({ ...prev, phone: val }));
    if (touched.phone) {
      const res = validateIndianMobile(val);
      setFieldErrors((prev) => ({ ...prev, phone: res.isValid ? undefined : res.error }));
    }
  };

  const handleEmailChange = (val: string) => {
    setCustomer((prev) => ({ ...prev, email: val }));
    if (touched.email) {
      const res = validateEmail(val);
      setFieldErrors((prev) => ({ ...prev, email: res.isValid ? undefined : res.error }));
    }
  };

  // Calculate delivery fee & auto-fill city/state whenever pincode is valid
  useEffect(() => {
    const cleanPin = customer.pincode.replace(/\s+/g, "");
    if (/^\d{6}$/.test(cleanPin) && activeItems.length > 0) {
      const lookup = lookupPincode(cleanPin);

      if (!lookup.isServiceable) {
        setPinError(
          lookup.unserviceableReason ||
            `We cannot deliver to PIN code ${cleanPin}. Tavistra currently services verified urban hubs across India.`
        );
        setShippingResult(null);
        if (lookup.city) {
          setCustomer((prev) => ({
            ...prev,
            city: lookup.city,
            state: lookup.state,
          }));
        }
        return;
      }

      // Automatically fill City and State from postal directory
      setCustomer((prev) => ({
        ...prev,
        city: lookup.city,
        state: lookup.state,
      }));
      setPinError(null);

      const zone = lookup.zoneCode;

      // Decision 0004: Highest product delivery fee applies across multi-item order
      const productCalcs = activeItems.map(({ product }) => {
        const spec: ItemPhysicalSpec = {
          productId: product.id,
          priceRupees: product.pricePaise / 100,
          weightGrams: product.weightGrams,
          lengthMm: product.lengthMm,
          widthMm: product.widthMm,
          heightMm: product.heightMm,
          isFragile: true,
        };
        return calculateDeliveryFee(zone, [spec]);
      });

      const highestFee = calculateOrderDeliveryFee(
        productCalcs.map((c) => c.totalDeliveryFeeRupees)
      );
      const primaryCalc = productCalcs.reduce(
        (max, curr) => (curr.totalDeliveryFeeRupees > max.totalDeliveryFeeRupees ? curr : max),
        productCalcs[0]
      );

      setShippingResult({
        ...primaryCalc,
        totalDeliveryFeeRupees: highestFee,
      });
    } else if (cleanPin.length > 0 && cleanPin.length < 6) {
      setShippingResult(null);
    }
  }, [customer.pincode, activeItems]);

  // Pricing calculations
  const itemsSubtotalPaise = activeItems.reduce(
    (acc, item) => acc + item.product.pricePaise * item.quantity,
    0
  );

  const deliveryFeePaise = shippingResult
    ? shippingResult.totalDeliveryFeeRupees * 100
    : 0;

  const totalOrderPaise = itemsSubtotalPaise + deliveryFeePaise;

  // Mode payment breakdown
  const amountPayableNowPaise =
    modeParam === "READY_STOCK"
      ? totalOrderPaise
      : Math.round(totalOrderPaise * 0.25);

  const balanceDueLaterPaise =
    modeParam === "READY_STOCK" ? 0 : totalOrderPaise - amountPayableNowPaise;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setTouched({
        fullName: true,
        phone: true,
        email: true,
        address1: true,
      });
      return;
    }

    if (!shippingResult) {
      setPinError("Please provide a valid 6-digit delivery PIN code to calculate delivery terms.");
      return;
    }

    if (bulkCheck.isBulkEnquiryRequired) {
      router.push("/contact?intent=bulk");
      return;
    }

    setIsProcessing(true);

    // Simulate secure gateway payment processing (PhonePe / UPI)
    setTimeout(() => {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedOrderId =
        modeParam === "READY_STOCK"
          ? `TAV-RS-${new Date().getFullYear()}-${randomSuffix}`
          : `TAV-MTO-${new Date().getFullYear()}-${randomSuffix}`;

      const snapshot = {
        orderId: generatedOrderId,
        mode: modeParam,
        customerName: customer.fullName.trim(),
        email: emailValidation.normalizedEmail || customer.email.trim(),
        phone: mobileValidation.normalizedPhone || customer.phone.trim(),
        destinationPin: customer.pincode,
        totalAmountRupees: totalOrderPaise / 100,
        amountPaidRupees: amountPayableNowPaise / 100,
        balanceDueRupees: balanceDueLaterPaise / 100,
        items: activeItems.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          pricePaise: item.product.pricePaise,
        })),
        transitEstimate: shippingResult.transitDaysEstimate,
        createdAt: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };

      setCompletedOrder(snapshot);
      clearCart(modeParam);
      setIsProcessing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1200);
  };

  // If order is completed, show formal confirmation receipt
  if (completedOrder) {
    return (
      <div className="mx-auto max-w-4xl py-12 px-6">
        <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-8 sm:p-12 space-y-8 shadow-sm">
          {/* Header Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-decorative-border)] pb-8">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Payment Verified & Order Confirmed
              </span>
              <h1 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
                {completedOrder.orderId}
              </h1>
              <p className="text-xs text-[var(--color-muted-light)]">
                Recorded on {completedOrder.createdAt} · Dedicated Client Desk: <span className="font-semibold text-[var(--color-ink)]">support@tavistra.in</span>
              </p>
            </div>
            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block rounded-md bg-[var(--color-canvas)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)] border border-[var(--color-decorative-border)]">
                {completedOrder.mode === "READY_STOCK" ? "Ready Stock Edition" : "Made to Order Edition"}
              </span>
              <p className="text-xs text-[var(--color-muted-light)]">
                PIN: {completedOrder.destinationPin} ({completedOrder.transitEstimate})
              </p>
            </div>
          </div>

          {/* Mode-Specific Lifecycle Notice */}
          {completedOrder.mode === "MADE_TO_ORDER" ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-5 space-y-2 text-xs text-amber-950 leading-relaxed">
              <div className="flex items-center gap-2 font-semibold text-amber-900 uppercase tracking-wider text-[11px]">
                <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                7-Day Confirmation Grace Period Active
              </div>
              <p>
                Your 25% production advance is verified. Per Tavistra policy, physical workshop manufacturing commences on <strong>Day 8</strong>. During the next 7 calendar days, you may request specification modifications or full 100% refund cancellation with zero customer penalty.
              </p>
              <p className="text-[11px] text-amber-900/80">
                Staff will also verify courier feasibility for PIN <strong>{completedOrder.destinationPin}</strong>. Remaining 75% balance (₹{completedOrder.balanceDueRupees.toLocaleString("en-IN")}) is requested upon final studio QC inspection prior to dispatch.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-5 space-y-2 text-xs text-emerald-950 leading-relaxed">
              <div className="flex items-center gap-2 font-semibold text-emerald-900 uppercase tracking-wider text-[11px]">
                <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                100% Payment Confirmed · Scheduled for Dispatch
              </div>
              <p>
                Your Ready Stock order is reserved and entering inspection. White-glove insured carrier dispatch is scheduled within <strong>24–48 hours</strong> from our Delhi logistics facility.
              </p>
            </div>
          )}

          {/* Items Summary Table */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-[var(--color-ink)] font-semibold">
              Ordered Objects
            </h3>
            <div className="divide-y divide-[var(--color-decorative-border)]/60 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] overflow-hidden">
              {completedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 text-xs">
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">{item.name}</p>
                    <p className="text-[11px] text-[var(--color-muted-light)]">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-[var(--color-ink)]">
                    {formatPrice(item.pricePaise * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 space-y-3 text-xs">
            <div className="flex justify-between text-[var(--color-muted-light)]">
              <span>Total Objects Value (Tax Inclusive):</span>
              <span className="font-semibold text-[var(--color-ink)]">
                ₹{completedOrder.totalAmountRupees.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[var(--color-decorative-border)]/60 text-sm font-semibold text-emerald-800">
              <span>Amount Paid Today:</span>
              <span>₹{completedOrder.amountPaidRupees.toLocaleString("en-IN")}</span>
            </div>
            {completedOrder.balanceDueRupees > 0 && (
              <div className="flex justify-between text-xs text-[var(--color-muted-light)]">
                <span>Remaining 75% Balance Due Before Handover:</span>
                <span className="font-semibold text-[var(--color-ink)]">
                  ₹{completedOrder.balanceDueRupees.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--color-decorative-border)]">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors text-center"
            >
              Print Official Receipt
            </button>
            <Link
              href="/shop"
              className="flex-1 rounded-full bg-[var(--color-ink)] py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors text-center shadow-sm"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty for this mode
  if (activeItems.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-24 px-6 text-center space-y-6">
        <span className="font-editorial text-3xl text-[var(--color-ink)] block">
          No Items for Checkout
        </span>
        <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
          There are currently no items in your selected {modeParam === "READY_STOCK" ? "Ready Stock" : "Made to Order"} checkout cart.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/cart"
            className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors"
          >
            Return to Cart
          </Link>
          <Link
            href="/shop"
            className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-6 py-2.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
          >
            Explore Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl py-12 px-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[var(--color-muted-light)] mb-8">
        <Link href="/cart" className="hover:text-[var(--color-ink)]">
          Cart
        </Link>
        <span>/</span>
        <span className="text-[var(--color-ink)] font-semibold">
          {modeParam === "READY_STOCK" ? "Ready Stock Checkout" : "Made to Order Checkout"}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Form: Customer & Destination Details (Span 7) */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold block mb-1">
              Step 1 of 2
            </span>
            <h2 className="font-editorial text-3xl text-[var(--color-ink)]">
              Delivery Destination & Contact
            </h2>
            <p className="text-xs text-[var(--color-muted-light)] mt-1">
              All deliveries are insured and handled directly with white-glove transport partners.
            </p>
          </div>

          <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">
            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)] mb-1.5">
                    Full Legal Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={customer.fullName}
                    onBlur={() => handleBlur("fullName")}
                    onChange={(e) => {
                      setCustomer({ ...customer, fullName: e.target.value });
                      if (touched.fullName && e.target.value.trim().length >= 2) {
                        setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                      }
                    }}
                    placeholder="e.g. Ar. Vikramaditya Sharma"
                    className={`w-full rounded-xl border ${
                      touched.fullName && fieldErrors.fullName
                        ? "border-red-400 bg-red-50/20"
                        : "border-[var(--color-control-border)] bg-[var(--color-canvas)]"
                    } px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]`}
                  />
                  {touched.fullName && fieldErrors.fullName && (
                    <p className="text-[10px] text-red-600 font-medium mt-1">⚠ {fieldErrors.fullName}</p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)]">
                      Mobile Number (For Dispatch Updates) *
                    </label>
                    {mobileValidation.isValid && (
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        ✓ Valid Indian Mobile
                      </span>
                    )}
                  </div>
                  <input
                    required
                    type="tel"
                    value={customer.phone}
                    onBlur={() => handleBlur("phone")}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full rounded-xl border ${
                      touched.phone && fieldErrors.phone
                        ? "border-red-400 bg-red-50/20"
                        : "border-[var(--color-control-border)] bg-[var(--color-canvas)]"
                    } px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono`}
                  />
                  {touched.phone && fieldErrors.phone ? (
                    <p className="text-[10px] text-red-600 font-medium mt-1">⚠ {fieldErrors.phone}</p>
                  ) : (
                    <p className="text-[10px] text-[var(--color-muted-light)] mt-1">
                      10-digit Indian mobile (starts with 6–9) required for courier dispatch OTP.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)]">
                    Email Address (For Tax Invoices & Order Receipts) *
                  </label>
                  {emailValidation.isValid && (
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      ✓ Direct Permanent Email
                    </span>
                  )}
                </div>
                <input
                  required
                  type="email"
                  value={customer.email}
                  onBlur={() => handleBlur("email")}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="vikram@studio.in"
                  className={`w-full rounded-xl border ${
                    touched.email && fieldErrors.email
                      ? "border-red-400 bg-red-50/20"
                      : "border-[var(--color-control-border)] bg-[var(--color-canvas)]"
                  } px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]`}
                />
                {touched.email && fieldErrors.email ? (
                  <div className={`mt-1.5 p-2 rounded-lg text-[11px] font-medium leading-relaxed ${
                    emailValidation.isRelayBanned ? "bg-amber-50 text-amber-900 border border-amber-200" : "text-red-600"
                  }`}>
                    ⚠ {fieldErrors.email}
                  </div>
                ) : (
                  <p className="text-[10px] text-[var(--color-muted-light)] mt-1">
                    Permanent email required for GST invoicing. Anonymous forwarding relays (e.g. @duck.com, @mozmail.com) are banned.
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4 pt-4 border-t border-[var(--color-decorative-border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                  Shipping Address
                </h3>
                {shippingResult && customer.city && (
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ Serviceable Hub ({customer.city}, {customer.state})
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)] mb-1.5">
                  6-Digit Indian PIN Code *
                </label>
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={customer.pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setCustomer({ ...customer, pincode: val });
                    if (pinError) setPinError(null);
                  }}
                  placeholder="Enter 6-digit PIN code (e.g. 110001, 560001, 400001)"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono"
                />
                {pinError && (
                  <div className="mt-2 rounded-xl bg-red-50 p-3 border border-red-200 text-xs text-red-700 font-medium leading-relaxed">
                    ⚠ {pinError}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)] mb-1.5">
                  Address Line 1 (Building, Suite, Street) *
                </label>
                <input
                  required
                  type="text"
                  value={customer.address1}
                  onBlur={() => handleBlur("address1")}
                  onChange={(e) => {
                    setCustomer({ ...customer, address1: e.target.value });
                    if (touched.address1 && e.target.value.trim().length >= 5) {
                      setFieldErrors((prev) => ({ ...prev, address1: undefined }));
                    }
                  }}
                  placeholder="e.g. Penthouse 4B, Signature Towers"
                  className={`w-full rounded-xl border ${
                    touched.address1 && fieldErrors.address1
                      ? "border-red-400 bg-red-50/20"
                      : "border-[var(--color-control-border)] bg-[var(--color-canvas)]"
                  } px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]`}
                />
                {touched.address1 && fieldErrors.address1 && (
                  <p className="text-[10px] text-red-600 font-medium mt-1">⚠ {fieldErrors.address1}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)] mb-1.5">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={customer.address2}
                    onChange={(e) => setCustomer({ ...customer, address2: e.target.value })}
                    placeholder="e.g. Near Golf Course Road"
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)] mb-1.5">
                    City (Auto-Filled) *
                  </label>
                  <input
                    required
                    type="text"
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    placeholder="City will auto-fill"
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)] mb-1.5">
                    State (Auto-Filled) *
                  </label>
                  <input
                    required
                    type="text"
                    value={customer.state}
                    onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                    placeholder="State will auto-fill"
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Optional GSTIN for corporate architects */}
            <div className="pt-4 border-t border-[var(--color-decorative-border)]">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)] mb-1.5">
                GSTIN for B2B Invoicing (Optional)
              </label>
              <input
                type="text"
                maxLength={15}
                value={customer.gstin}
                onChange={(e) => setCustomer({ ...customer, gstin: e.target.value.toUpperCase() })}
                placeholder="e.g. 07AAAAA0000A1Z5"
                className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono uppercase"
              />
            </div>
          </form>
        </div>

        {/* Right Summary: Transparent Pricing & Legal Safeties (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--color-decorative-border)] pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-bronze)] font-semibold block">
                  {modeParam === "READY_STOCK" ? "Ready Stock Edition" : "Made to Order Edition"}
                </span>
                <h3 className="font-editorial text-2xl text-[var(--color-ink)]">
                  Order Summary
                </h3>
              </div>
              <span className="text-xs text-[var(--color-muted-light)]">
                {activeItems.length} line item(s)
              </span>
            </div>

            {/* Items Mini List */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {activeItems.map((item) => (
                <div key={item.product.id} className="flex justify-between items-start text-xs">
                  <div>
                    <span className="font-semibold text-[var(--color-ink)] block">{item.product.name}</span>
                    <span className="text-[11px] text-[var(--color-muted-light)]">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-[var(--color-ink)]">
                    {formatPrice(item.product.pricePaise * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown: Two Customer Price Components (TAV-03) */}
            <div className="space-y-3 pt-4 border-t border-[var(--color-decorative-border)] text-xs">
              <div className="flex justify-between text-[var(--color-muted-light)]">
                <span>1. Product Subtotal (Tax Inclusive):</span>
                <span className="font-semibold text-[var(--color-ink)]">{formatPrice(itemsSubtotalPaise)}</span>
              </div>
              <div className="flex justify-between text-[var(--color-muted-light)]">
                <span>2. Insured Crating & Delivery (Tax Inclusive):</span>
                <span className="font-semibold text-[var(--color-ink)]">
                  {shippingResult ? (
                    shippingResult.totalDeliveryFeeRupees === 0 ? (
                      <span className="text-emerald-700 font-semibold">Complimentary</span>
                    ) : (
                      `₹${shippingResult.totalDeliveryFeeRupees.toLocaleString("en-IN")}`
                    )
                  ) : (
                    <span className="text-amber-800 italic">Enter PIN Code</span>
                  )}
                </span>
              </div>
              {shippingResult && (
                <p className="text-[11px] text-[var(--color-muted-light)] leading-snug">
                  ✓ {shippingResult.carrierName} · Transit: {shippingResult.transitDaysEstimate} (Universal PIN Serviceability Presumed)
                </p>
              )}
            </div>

            {/* Mode-Specific Payment Milestones */}
            {modeParam === "MADE_TO_ORDER" ? (
              <div className="space-y-3 pt-4 border-t border-[var(--color-decorative-border)] text-xs">
                <div className="flex justify-between items-center text-sm font-semibold text-[var(--color-bronze)]">
                  <span>25% Advance Due Now:</span>
                  <span className="font-editorial text-2xl">{formatPrice(amountPayableNowPaise)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-muted-light)]">
                  <span>Remaining 75% Balance Due Before Dispatch:</span>
                  <span className="font-semibold text-[var(--color-ink)]">{formatPrice(balanceDueLaterPaise)}</span>
                </div>

                {/* 7-Day Grace Box */}
                <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-4 text-[11px] text-[var(--color-muted-light)] leading-relaxed space-y-1.5">
                  <strong className="text-[var(--color-ink)] block">
                    7-Day Post-Confirmation Grace Window
                  </strong>
                  You may alter specifications or request a full 100% refund cancellation during the initial 7 days. Workshop production commences on Day 8.
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-[var(--color-decorative-border)] text-xs space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-[var(--color-ink)]">
                  <span>Total Payable at Confirmation (100%):</span>
                  <span className="font-editorial text-2xl">{formatPrice(amountPayableNowPaise)}</span>
                </div>
                <p className="text-[11px] text-[var(--color-muted-light)]">
                  Inspected and dispatched from Delhi hubs within 24–48 hours upon electronic verification.
                </p>
              </div>
            )}

            {/* Submit Action Button */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                form="checkout-form"
                disabled={isProcessing || !isFormValid}
                className="w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[var(--color-canvas)]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Secure Payment...
                  </>
                ) : modeParam === "MADE_TO_ORDER" ? (
                  `Pay 25% Advance (${formatPrice(amountPayableNowPaise)})`
                ) : (
                  `Pay & Confirm Order (${formatPrice(amountPayableNowPaise)})`
                )}
              </button>

              {!isFormValid ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-[11px] text-amber-900 space-y-1">
                  <span className="font-semibold block text-amber-950">
                    Required to activate payment button:
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-amber-800">
                    {!isNameValid && <li>Enter full legal name (at least 2 characters)</li>}
                    {!mobileValidation.isValid && (
                      <li>
                        {customer.phone ? mobileValidation.error : "Enter a valid 10-digit Indian mobile number (starts with 6–9)"}
                      </li>
                    )}
                    {!emailValidation.isValid && (
                      <li>
                        {emailValidation.isRelayBanned
                          ? `Use permanent email (@${emailValidation.domain} relay addresses are banned)`
                          : customer.email ? emailValidation.error : "Enter a valid permanent email address"}
                      </li>
                    )}
                    {!isPinValid && (
                      <li>
                        {pinError ? pinError : "Enter a serviceable 6-digit Indian PIN code"}
                      </li>
                    )}
                    {!isAddressValid && <li>Enter delivery address line 1 (building, suite, street)</li>}
                  </ul>
                </div>
              ) : (
                <p className="text-[11px] text-center text-emerald-800 font-semibold flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  All mandatory fields verified · Ready for electronic checkout
                </p>
              )}

              <p className="text-[10px] text-center text-[var(--color-muted-light)] mt-2">
                Protected by 256-bit electronic encryption · Compliant with GST & TAV-03 transparency
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-7xl py-24 px-6 text-center text-xs text-[var(--color-muted-light)]">
              Loading checkout workspace...
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
