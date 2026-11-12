"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AccountNav } from "@/components/AccountNav";
import { useAuth, SavedAddress } from "@/context/AuthContext";
import { lookupPincode, validateIndianMobile } from "@tavistra/shared";

export default function AccountAddressesPage() {
  const { user, isAuthenticated, addAddress, deleteAddress, setDefaultAddress } = useAuth();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    label: "Studio Office",
    fullName: user?.name || "",
    phone: user?.phone || "",
    addressLine1: "",
    addressLine2: "",
    pincode: "",
    city: "",
    state: "",
    isDefault: false,
  });

  const [pinMessage, setPinMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: raw }));

    if (raw.length === 6) {
      fetch(`/api/pincodes/check?pincode=${raw}`)
        .then((res) => (res.ok ? res.json() : lookupPincode(raw)))
        .then((info) => {
          if (info && info.isServiceable) {
            setFormData((prev) => ({
              ...prev,
              city: info.city,
              state: info.state,
            }));
            setPinMessage({
              text: `Serviceable destination located: ${info.city}, ${info.state} (Zone ${info.zoneCode})`,
              isError: false,
            });
          } else {
            setFormData((prev) => ({
              ...prev,
              city: "",
              state: "",
            }));
            setPinMessage({
              text: info?.unserviceableReason || "We currently do not service this PIN code. Tavistra delivers exclusively across verified Tier-1 & Tier-2 hubs.",
              isError: true,
            });
          }
        })
        .catch(() => {
          const info = lookupPincode(raw);
          if (info && info.isServiceable) {
            setFormData((prev) => ({ ...prev, city: info.city, state: info.state }));
            setPinMessage({
              text: `Serviceable destination located: ${info.city}, ${info.state} (Zone ${info.zoneCode})`,
              isError: false,
            });
          } else {
            setPinMessage({
              text: "We currently do not service this PIN code. Tavistra delivers exclusively across verified Tier-1 & Tier-2 hubs.",
              isError: true,
            });
          }
        });
    } else {
      setPinMessage(null);
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();

    const phoneValidation = validateIndianMobile(formData.phone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || "Valid 10-digit Indian mobile required.");
      return;
    }
    setPhoneError(null);

    const pinCheck = lookupPincode(formData.pincode);
    if (!pinCheck || !pinCheck.isServiceable) {
      setPinMessage({
        text: "Please provide a serviceable 6-digit Indian PIN code.",
        isError: true,
      });
      return;
    }

    addAddress({
      label: formData.label || "Delivery Location",
      fullName: formData.fullName,
      phone: phoneValidation.normalizedPhone || formData.phone,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      city: formData.city || pinCheck.city,
      state: formData.state || pinCheck.state,
      pincode: formData.pincode,
      isDefault: formData.isDefault || (user?.addresses.length === 0),
    });

    setShowAddForm(false);
    setFormData({
      label: "Studio Office",
      fullName: user?.name || "",
      phone: user?.phone || "",
      addressLine1: "",
      addressLine2: "",
      pincode: "",
      city: "",
      state: "",
      isDefault: false,
    });
    setPinMessage(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
      <Header />
      <main className="flex-1">
        {!isAuthenticated ? (
          <div className="mx-auto max-w-lg py-24 px-6 text-center space-y-6">
            <h1 className="font-editorial text-4xl text-[var(--color-ink)]">
              Sign In to Manage Addresses
            </h1>
            <p className="text-xs text-[var(--color-muted-light)]">
              Manage your delivery locations and ensure white-glove courier dispatch to your design site.
            </p>
            <Link
              href="/account/login"
              className="inline-block rounded-full bg-[var(--color-ink)] px-8 py-3 text-xs font-semibold text-[var(--color-canvas)]"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div>
            <AccountNav />
            <div className="mx-auto max-w-6xl px-6 pb-16 space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-decorative-border)] pb-4">
                <div>
                  <h1 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
                    Saved Addresses
                  </h1>
                  <p className="text-xs text-[var(--color-muted-light)] mt-1">
                    Manage studio, project site, and residence delivery destinations.
                  </p>
                </div>
                {!showAddForm && (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                  >
                    + Add New Address
                  </button>
                )}
              </div>

              {/* Add Address Form Modal / Inline */}
              {showAddForm && (
                <div className="rounded-2xl border-2 border-[var(--color-bronze)]/50 bg-[var(--color-ivory)] p-6 sm:p-8 space-y-6 shadow-md">
                  <div className="flex items-center justify-between border-b border-[var(--color-decorative-border)] pb-3">
                    <h3 className="font-editorial text-2xl text-[var(--color-ink)]">
                      New Delivery Destination
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                          Address Tag / Label *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.label}
                          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                          placeholder="e.g. Design Studio, Site Office"
                          className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-3.5 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                          Recipient Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="Full Name"
                          className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-3.5 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                          Delivery Contact Mobile *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value });
                            if (phoneError) setPhoneError(null);
                          }}
                          placeholder="9876543210"
                          className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-3.5 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                        />
                        {phoneError && (
                          <p className="text-[11px] text-red-600 mt-0.5">{phoneError}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                        Street Address / Premises *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        placeholder="Suite, building number, street name"
                        className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-3.5 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                          6-Digit PIN Code *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={formData.pincode}
                          onChange={handlePincodeChange}
                          placeholder="e.g. 110001"
                          className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-3.5 py-2 text-xs text-[var(--color-ink)] font-mono focus:outline-none focus:border-[var(--color-ink)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                          City (Auto-filled)
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={formData.city}
                          placeholder="City will auto-populate"
                          className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-stone)]/40 px-3.5 py-2 text-xs text-[var(--color-ink)] focus:outline-none cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                          State (Auto-filled)
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={formData.state}
                          placeholder="State will auto-populate"
                          className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-stone)]/40 px-3.5 py-2 text-xs text-[var(--color-ink)] focus:outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {pinMessage && (
                      <div
                        className={`p-3 rounded-xl text-xs font-medium ${
                          pinMessage.isError
                            ? "border border-red-200 bg-red-50 text-red-700"
                            : "border border-emerald-200 bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {pinMessage.text}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="rounded border-[var(--color-control-border)]"
                      />
                      <label htmlFor="isDefault" className="text-xs text-[var(--color-ink)]">
                        Make this my primary delivery location
                      </label>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <button
                        type="submit"
                        disabled={!formData.city || pinMessage?.isError}
                        className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-50 transition-colors shadow-sm"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="rounded-full border border-[var(--color-control-border)] px-6 py-2.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Saved Addresses Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user?.addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`rounded-2xl border p-6 flex flex-col justify-between space-y-4 shadow-sm transition-all ${
                      address.isDefault
                        ? "border-[var(--color-bronze)] bg-[var(--color-ivory)]"
                        : "border-[var(--color-decorative-border)] bg-[var(--color-canvas)]"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                          {address.label}
                        </span>
                        {address.isDefault && (
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">
                            Default Address
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="font-semibold text-[var(--color-ink)]">{address.fullName}</p>
                        <p className="text-[var(--color-muted-light)]">{address.phone}</p>
                        <p className="text-[var(--color-ink)]">{address.addressLine1}</p>
                        {address.addressLine2 && (
                          <p className="text-[var(--color-ink)]">{address.addressLine2}</p>
                        )}
                        <p className="text-[var(--color-ink)] font-medium">
                          {address.city}, {address.state} — {address.pincode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-[var(--color-decorative-border)]/60 text-xs">
                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(address.id)}
                          className="font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)] underline"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteAddress(address.id)}
                        className="text-red-600 hover:text-red-700 underline ml-auto text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
