"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AccountNav from "@/components/AccountNav";
import { SavedAddress, useAuth } from "@/context/AuthContext";

const EMPTY_FORM = {
  label: "Studio / Office",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  pincode: "",
  city: "",
  state: "",
  isDefault: false,
};

export default function AccountAddressesPage() {
  const {
    user,
    isAuthenticated,
    authLoading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [pinChecking, setPinChecking] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinMessage, setPinMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const openAddForm = () => {
    setEditingId(null);
    setActionError("");
    setFormData({
      ...EMPTY_FORM,
      fullName: user?.name || "",
      phone: user?.phone || "",
      isDefault: (user?.addresses.length ?? 0) === 0,
    });
    setPinVerified(false);
    setPinMessage(null);
    setShowForm(true);
  };

  const openEditForm = (address: SavedAddress) => {
    setEditingId(address.id);
    setActionError("");
    setFormData({
      label: address.label || "Home / Residence",
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      pincode: address.pincode,
      city: address.city,
      state: address.state,
      isDefault: address.isDefault,
    });
    setPinVerified(true);
    setPinMessage({
      text: `Verified delivery zone: ${address.city}, ${address.state}.`,
      isError: false,
    });
    setShowForm(true);
  };

  const verifyLivePincode = async (cleanPin: string) => {
    setPinChecking(true);
    setPinVerified(false);
    setPinMessage({ text: "Checking Tavistra regional delivery whitelist...", isError: false });

    try {
      const res = await fetch(`/api/pincodes/check?pincode=${cleanPin}`);
      const data = await res.json();
      if (data.serviceable) {
        setFormData((prev) => ({
          ...prev,
          pincode: cleanPin,
          city: data.city || "",
          state: data.state || "",
        }));
        setPinVerified(true);
        setPinMessage({
          text: `Serviceable in ${data.city}, ${data.state}${data.zoneName ? ` (${data.zoneName})` : ""}.`,
          isError: false,
        });
      } else {
        setFormData((prev) => ({ ...prev, pincode: cleanPin, city: "", state: "" }));
        setPinVerified(false);
        setPinMessage({
          text:
            data.message ||
            "PIN code is not currently in Tavistra&apos;s verified delivery whitelist.",
          isError: true,
        });
      }
    } catch {
      setFormData((prev) => ({ ...prev, pincode: cleanPin, city: "", state: "" }));
      setPinVerified(false);
      setPinMessage({
        text: "Unable to verify PIN code right now. Please try again.",
        isError: true,
      });
    } finally {
      setPinChecking(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanPin = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({
      ...prev,
      pincode: cleanPin,
      ...(cleanPin.length < 6 ? { city: "", state: "" } : {}),
    }));

    if (cleanPin.length === 6) {
      void verifyLivePincode(cleanPin);
    } else {
      setPinVerified(false);
      setPinMessage(null);
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");

    if (!pinVerified || !formData.city || !formData.state) {
      setActionError("Please enter a verified 6-digit serviceable PIN code.");
      return;
    }

    setSaving(true);
    const payload = {
      label: formData.label.trim() || "Home / Residence",
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2.trim() || undefined,
      pincode: formData.pincode.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      isDefault: formData.isDefault,
    };

    const result = editingId
      ? await updateAddress(editingId, payload)
      : await addAddress(payload);
    setSaving(false);

    if (!result.success) {
      setActionError(result.error || "Unable to save address.");
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setPinMessage(null);
    setPinVerified(false);
  };

  const handleDelete = async (id: string) => {
    setActionError("");
    setBusyId(id);
    const result = await deleteAddress(id);
    setBusyId(null);
    if (!result.success) {
      setActionError(result.error || "Unable to remove address.");
    }
  };

  const handleSetDefault = async (id: string) => {
    setActionError("");
    setBusyId(id);
    const result = await setDefaultAddress(id);
    setBusyId(null);
    if (!result.success) {
      setActionError(result.error || "Unable to update default address.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-12 lg:py-16">
        {authLoading ? (
          <div className="py-24 text-center text-xs text-[var(--color-muted-light)]">
            Verifying your client session...
          </div>
        ) : !isAuthenticated ? (
          <div className="mx-auto max-w-md text-center space-y-6 py-16">
            <h1 className="text-3xl font-serif font-light text-[var(--color-ink)]">
              Sign in to manage addresses
            </h1>
            <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
              Save verified delivery addresses linked to your Tavistra client account for faster checkout.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/account/login?next=/account/addresses"
                className="rounded-full bg-[var(--color-ink)] px-8 py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)]"
              >
                Sign In
              </Link>
              <Link
                href="/account/register"
                className="rounded-full border border-[var(--color-control-border)] px-8 py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
              >
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <AccountNav />
            </div>

            <div className="lg:col-span-3 space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-decorative-border)] pb-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted-light)]">
                    Verified Dispatch Destinations
                  </span>
                  <h1 className="text-3xl font-serif font-light text-[var(--color-ink)]">
                    Saved Delivery Addresses
                  </h1>
                </div>

                {!showForm && (
                  <button
                    type="button"
                    onClick={openAddForm}
                    className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                  >
                    + Add Delivery Address
                  </button>
                )}
              </div>

              {actionError && !showForm && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 font-medium">
                  {actionError}
                </div>
              )}

              {showForm && (
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/80 p-7 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-[var(--color-decorative-border)] pb-3">
                    <h2 className="text-lg font-serif text-[var(--color-ink)]">
                      {editingId ? "Edit Delivery Location" : "New Delivery Location"}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setActionError("");
                      }}
                      className="text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
                    >
                      Close
                    </button>
                  </div>

                  <form onSubmit={handleSaveSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                          Address Label *
                        </label>
                        <select
                          value={formData.label}
                          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                          className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-3.5 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                        >
                          <option value="Studio / Office">Studio / Office</option>
                          <option value="Home / Residence">Home / Residence</option>
                          <option value="Client Project Site">Client Project Site</option>
                        </select>
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
                          className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-3.5 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                          Delivery Contact Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-3.5 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                          Street Address / Building *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.addressLine1}
                          onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                          placeholder="Suite, Building, Street"
                          className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-3.5 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                          Landmark / Floor (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.addressLine2}
                          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                          placeholder="Near landmark or wing"
                          className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-3.5 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                        />
                      </div>
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
                          placeholder="e.g. 380001"
                          className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-3.5 py-2.5 text-xs text-[var(--color-ink)] font-mono focus:outline-none focus:border-[var(--color-ink)]"
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
                          placeholder="Verified city"
                          className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-stone)]/40 px-3.5 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none cursor-not-allowed"
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
                          placeholder="Verified state"
                          className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-stone)]/40 px-3.5 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none cursor-not-allowed"
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

                    {actionError && (
                      <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 font-medium">
                        {actionError}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
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

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving || pinChecking || !pinVerified || !formData.city}
                        className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {saving ? "Saving..." : editingId ? "Save Address Changes" : "Save Address"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingId(null);
                          setActionError("");
                        }}
                        className="rounded-full border border-[var(--color-control-border)] px-6 py-2.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {(user?.addresses.length ?? 0) === 0 && !showForm ? (
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/40 p-10 text-center space-y-4">
                  <p className="text-base font-serif text-[var(--color-ink)]">
                    No saved delivery addresses yet
                  </p>
                  <p className="text-xs text-[var(--color-muted-light)] max-w-md mx-auto">
                    Add your architectural studio, residence, or client project location verified against our white-glove courier PIN whitelist.
                  </p>
                  <button
                    type="button"
                    onClick={openAddForm}
                    className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)]"
                  >
                    + Add First Address
                  </button>
                </div>
              ) : (
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
                            disabled={busyId === address.id}
                            onClick={() => handleSetDefault(address.id)}
                            className="font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)] underline disabled:opacity-50"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditForm(address)}
                          className="font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)] underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={busyId === address.id}
                          onClick={() => handleDelete(address.id)}
                          className="text-red-600 hover:text-red-700 underline ml-auto text-xs disabled:opacity-50"
                        >
                          {busyId === address.id ? "Removing..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
