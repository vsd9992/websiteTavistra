import React, { useState, useEffect, useMemo } from "react";

export interface ZoneConfig {
  id: string;
  code: string;
  name: string;
  description: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
}

export interface PincodeRuleRow {
  id: string;
  pincode: string;
  city: string;
  locality?: string;
  state: string;
  zoneCode: string;
  zoneLabel: string;
  isServiceable: boolean;
  unserviceableReason?: string;
  source?: string;
  specificity?: "EXACT_6" | "PREFIX_4" | "PREFIX_3" | "PREFIX_2";
  verifiedDate?: string;
}

interface RateRuleRow {
  id: string;
  tierCode: string;
  tierLabel: string;
  maxWeightGrams: number;
  carrierTier: string;
  carrierName: string;
  shippingZoneCode: string;
  feeSlabRupees: number;
}

interface ProductSummary {
  id: string;
  slug: string;
  sku: string;
  title: string;
  weightGrams: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  isPublished: boolean;
}

interface ProductOverrideRow {
  id: string;
  productId: string;
  shippingZoneCode: string;
  feeSlabRupees: number;
}

interface LogisticsTabProps {
  staffName: string;
  onLogAudit: (action: string, entityType: string, entityId: string, details: string) => void;
  onPincodesUpdated?: (pincodes: PincodeRuleRow[]) => void;
}

export function LogisticsTab({ staffName, onLogAudit, onPincodesUpdated }: LogisticsTabProps) {
  const [subTab, setSubTab] = useState<"PINS" | "SLABS_ZONES" | "PRODUCT_OVERRIDES">("PINS");
  const [loading, setLoading] = useState(true);
  const [statusBanner, setStatusBanner] = useState<{ text: string; isError?: boolean } | null>(null);

  // PINs State
  const [pincodes, setPincodes] = useState<PincodeRuleRow[]>([]);
  const [zones, setZones] = useState<ZoneConfig[]>([]);
  const [urbanCandidateCount, setUrbanCandidateCount] = useState(884);
  const [pinSearch, setPinSearch] = useState("");
  const [filterZone, setFilterZone] = useState<string>("ALL");
  const [filterSpecificity, setFilterSpecificity] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  // Live PIN Simulator State
  const [simPin, setSimPin] = useState("");
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Add/Edit PIN Rule Modal
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    pincodePrefix: "",
    cityLabel: "",
    stateName: "",
    zoneCode: "ZONE_A",
    isServiceable: true,
    unserviceableReason: "",
  });

  // 12-Slab & Rate Matrix State
  const [feeSlabs, setFeeSlabs] = useState<number[]>([0, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500]);
  const [editingSlabs, setEditingSlabs] = useState<string[]>([]);
  const [rateMatrix, setRateMatrix] = useState<RateRuleRow[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [productOverrides, setProductOverrides] = useState<ProductOverrideRow[]>([]);
  const [editingZone, setEditingZone] = useState<ZoneConfig | null>(null);

  // Shipping Calculator Simulator State
  const [calcProductId, setCalcProductId] = useState<string>("");
  const [calcPin, setCalcPin] = useState<string>("560001");
  const [calcResult, setCalcResult] = useState<any | null>(null);

  const notify = (text: string, isError = false) => {
    setStatusBanner({ text, isError });
    setTimeout(() => setStatusBanner(null), 5000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pinsRes, logRes] = await Promise.all([
        fetch("/api/admin/pincodes"),
        fetch("/api/admin/logistics"),
      ]);

      if (pinsRes.ok) {
        const pinsData = await pinsRes.json();
        setPincodes(pinsData.pincodes || []);
        setZones(pinsData.zones || []);
        if (pinsData.urbanCandidateCount) setUrbanCandidateCount(pinsData.urbanCandidateCount);
        onPincodesUpdated?.(pinsData.pincodes || []);
      }

      if (logRes.ok) {
        const logData = await logRes.json();
        if (Array.isArray(logData.feeSlabs)) {
          setFeeSlabs(logData.feeSlabs);
          setEditingSlabs(logData.feeSlabs.map(String));
        }
        if (Array.isArray(logData.zones)) setZones(logData.zones);
        setRateMatrix(logData.rateMatrix || []);
        setProducts(logData.products || []);
        setProductOverrides(logData.productOverrides || []);
        if (!calcProductId && logData.products?.length > 0) {
          setCalcProductId(logData.products[0].id);
        }
      }
    } catch (err) {
      notify(`Failed to load logistics configuration: ${(err as Error).message}`, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Filtered PIN list
  const filteredPincodes = useMemo(() => {
    const q = pinSearch.trim().toLowerCase();
    return pincodes.filter((p) => {
      if (filterZone !== "ALL" && p.zoneCode !== filterZone) return false;
      if (filterStatus === "ACTIVE" && !p.isServiceable) return false;
      if (filterStatus === "DISABLED" && p.isServiceable) return false;
      if (filterSpecificity === "PREFIX" && p.pincode.length === 6) return false;
      if (filterSpecificity === "EXACT" && p.pincode.length !== 6) return false;

      if (!q) return true;
      return (
        p.pincode.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.zoneCode.toLowerCase().includes(q)
      );
    });
  }, [pincodes, pinSearch, filterZone, filterSpecificity, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredPincodes.length / PAGE_SIZE));
  const pagedPincodes = filteredPincodes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [pinSearch, filterZone, filterSpecificity, filterStatus]);

  // PIN Simulator
  const handleSimulatePin = async () => {
    const clean = simPin.replace(/\D/g, "");
    if (clean.length !== 6) {
      notify("Enter a full 6-digit PIN code to simulate hierarchy resolution.", true);
      return;
    }
    setSimLoading(true);
    try {
      const res = await fetch(`/api/pincodes/check?pincode=${clean}`);
      if (res.ok) {
        const data = await res.json();
        setSimResult(data);
      } else {
        notify("Failed to resolve PIN simulation", true);
      }
    } finally {
      setSimLoading(false);
    }
  };

  const openModalForPin = (pinData?: Partial<typeof ruleForm>) => {
    setRuleForm({
      pincodePrefix: pinData?.pincodePrefix || "",
      cityLabel: pinData?.cityLabel || "",
      stateName: pinData?.stateName || "",
      zoneCode: pinData?.zoneCode || "ZONE_A",
      isServiceable: pinData?.isServiceable !== undefined ? pinData.isServiceable : true,
      unserviceableReason: pinData?.unserviceableReason || "",
    });
    setShowRuleModal(true);
  };

  const handleSavePinRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/pincodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPSERT_RULE",
          ...ruleForm,
          staffName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save rule");

      notify(`Saved PIN rule '${ruleForm.pincodePrefix}' cleanly.`);
      onLogAudit("PINCODE_RULE_UPSERT", "PincodeRange", ruleForm.pincodePrefix, `Configured rule for ${ruleForm.pincodePrefix} -> ${ruleForm.zoneCode}`);
      setShowRuleModal(false);
      await loadAll();
      if (simPin === ruleForm.pincodePrefix) handleSimulatePin();
    } catch (err) {
      notify((err as Error).message, true);
    }
  };

  const handleImportUrban884 = async () => {
    if (!confirm(`Import up to ${urbanCandidateCount} curated urban 6-digit PIN codes into PostgreSQL? Existing custom rules will be preserved.`)) {
      return;
    }
    try {
      const res = await fetch("/api/admin/pincodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "IMPORT_URBAN_884", staffName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      notify(data.message || `Imported ${data.insertedCount} urban PINs.`);
      onLogAudit("PINCODE_URBAN_884_IMPORT", "PincodeRange", "BATCH_884", data.message || "Imported 884 urban hub PINs");
      await loadAll();
    } catch (err) {
      notify((err as Error).message, true);
    }
  };

  const handleTogglePin = async (rule: PincodeRuleRow) => {
    const nextState = !rule.isServiceable;
    setPincodes((prev) => prev.map((p) => (p.id === rule.id ? { ...p, isServiceable: nextState } : p)));
    try {
      const res = await fetch("/api/admin/pincodes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rule.id,
          isServiceable: nextState,
          staffName,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      onLogAudit("PINCODE_SERVICEABILITY_TOGGLE", "PincodeRange", rule.pincode, `${rule.pincode} -> ${nextState ? "Serviceable" : "Disabled"}`);
      notify(`PIN rule '${rule.pincode}' marked ${nextState ? "Serviceable" : "Disabled"}.`);
    } catch {
      setPincodes((prev) => prev.map((p) => (p.id === rule.id ? { ...p, isServiceable: rule.isServiceable } : p)));
      notify("Failed to toggle PIN serviceability.", true);
    }
  };

  const handleChangePinZone = async (rule: PincodeRuleRow, newZone: string) => {
    try {
      const res = await fetch("/api/admin/pincodes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id, zoneCode: newZone, staffName }),
      });
      if (!res.ok) throw new Error("Zone update failed");
      notify(`Reassigned '${rule.pincode}' to ${newZone}.`);
      await loadAll();
    } catch (err) {
      notify((err as Error).message, true);
    }
  };

  const handleDeleteRule = async (rule: PincodeRuleRow) => {
    if (!confirm(`Delete rule '${rule.pincode}'? Nested PINs matching this prefix will inherit the parent prefix or fallback.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/pincodes?id=${rule.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      notify(`Deleted PIN rule '${rule.pincode}'.`);
      onLogAudit("PINCODE_RULE_DELETE", "PincodeRange", rule.pincode, `Deleted override ${rule.pincode}`);
      await loadAll();
    } catch (err) {
      notify((err as Error).message, true);
    }
  };

  // Save 12 Slabs
  const handleSaveSlabs = async () => {
    const nums = editingSlabs.map((s) => Number(s));
    if (nums.length !== 12 || nums.some((n) => isNaN(n) || n < 0)) {
      notify("All 12 slab values must be valid non-negative INR amounts.", true);
      return;
    }
    try {
      const res = await fetch("/api/admin/logistics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_SLABS", slabs: nums, staffName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeeSlabs(data.feeSlabs);
      setEditingSlabs(data.feeSlabs.map(String));
      notify("12-Slab Fee Ladder updated in PostgreSQL.");
      onLogAudit("DELIVERY_SLABS_UPDATE", "SystemSetting", "DELIVERY_FEE_SLABS", `Slabs updated: ${data.feeSlabs.join(", ")}`);
    } catch (err) {
      notify((err as Error).message, true);
    }
  };

  // Update Matrix Cell
  const handleUpdateMatrixCell = async (tierCode: string, shippingZoneCode: string, feeSlabRupees: number) => {
    setRateMatrix((prev) =>
      prev.map((r) =>
        r.tierCode === tierCode && r.shippingZoneCode === shippingZoneCode
          ? { ...r, feeSlabRupees }
          : r
      )
    );
    try {
      const res = await fetch("/api/admin/logistics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_RATE_RULE",
          tierCode,
          shippingZoneCode,
          feeSlabRupees,
          staffName,
        }),
      });
      if (!res.ok) throw new Error("Failed to update matrix cell");
      notify(`Updated ${tierCode} × ${shippingZoneCode} -> ₹${feeSlabRupees.toLocaleString("en-IN")}`);
    } catch (err) {
      notify((err as Error).message, true);
      await loadAll();
    }
  };

  // Update Zone Config
  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;
    try {
      const res = await fetch("/api/admin/logistics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_ZONE",
          ...editingZone,
          staffName,
        }),
      });
      if (!res.ok) throw new Error("Failed to update zone");
      notify(`Updated ${editingZone.code} configuration.`);
      setEditingZone(null);
      await loadAll();
    } catch (err) {
      notify((err as Error).message, true);
    }
  };

  // Set Product Zone Override
  const handleSetProductOverride = async (productId: string, zoneCode: string, valueStr: string) => {
    const feeSlabRupees = valueStr === "AUTO" ? null : Number(valueStr);
    try {
      const res = await fetch("/api/admin/logistics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_PRODUCT_OVERRIDE",
          productId,
          shippingZoneCode: zoneCode,
          feeSlabRupees,
          staffName,
        }),
      });
      if (!res.ok) throw new Error("Failed to save product override");
      notify(
        feeSlabRupees === null
          ? `Cleared ${zoneCode} override (reverted to Weight Matrix).`
          : `Set ${zoneCode} delivery slab to ₹${feeSlabRupees.toLocaleString("en-IN")}.`
      );
      await loadAll();
    } catch (err) {
      notify((err as Error).message, true);
    }
  };

  // Live Fee Previewer
  const handleCalculatePreview = async () => {
    const prod = products.find((p) => p.id === calcProductId);
    if (!prod || !/^\d{6}$/.test(calcPin)) {
      notify("Select a product and enter a valid 6-digit PIN code.", true);
      return;
    }
    try {
      const res = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pincode: calcPin,
          items: [
            {
              productId: prod.id,
              slug: prod.slug,
              title: prod.title,
              quantity: 1,
              priceRupees: 10000,
              weightGrams: prod.weightGrams,
              lengthMm: prod.lengthMm,
              widthMm: prod.widthMm,
              heightMm: prod.heightMm,
            },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCalcResult(data);
      }
    } catch (err) {
      notify((err as Error).message, true);
    }
  };

  // Group matrix rules by tierCode
  const matrixTiers = useMemo(() => {
    const map = new Map<string, { tierCode: string; tierLabel: string; carrierName: string; maxWeightGrams: number; byZone: Record<string, number> }>();
    for (const r of rateMatrix) {
      if (!map.has(r.tierCode)) {
        map.set(r.tierCode, {
          tierCode: r.tierCode,
          tierLabel: r.tierLabel,
          carrierName: r.carrierName,
          maxWeightGrams: r.maxWeightGrams,
          byZone: {},
        });
      }
      map.get(r.tierCode)!.byZone[r.shippingZoneCode] = r.feeSlabRupees;
    }
    return Array.from(map.values()).sort((a, b) => a.maxWeightGrams - b.maxWeightGrams);
  }, [rateMatrix]);

  const prefixCount = pincodes.filter((p) => p.pincode.length < 6).length;
  const exactPinCount = pincodes.filter((p) => p.pincode.length === 6).length;
  const suspendedCount = pincodes.filter((p) => !p.isServiceable).length;

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2e2e34] pb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Logistics, Nested PIN Governance &amp; 12-Slab Engine</h2>
          <p className="text-xs text-[#9e9ea8]">
            Manage 3-tier hierarchical PIN rules (Region Prefix → District Hub → Exact 6-Digit PIN), the DB-backed 12-slab ladder, and product overrides.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#18181c] p-1 rounded-xl border border-[#2e2e34]">
          <button
            onClick={() => setSubTab("PINS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subTab === "PINS" ? "bg-[#c59b6d] text-[#121214]" : "text-[#9e9ea8] hover:text-white"
            }`}
          >
            PIN Hierarchy ({pincodes.length})
          </button>
          <button
            onClick={() => setSubTab("SLABS_ZONES")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subTab === "SLABS_ZONES" ? "bg-[#c59b6d] text-[#121214]" : "text-[#9e9ea8] hover:text-white"
            }`}
          >
            12 Slabs &amp; Zone Matrix
          </button>
          <button
            onClick={() => setSubTab("PRODUCT_OVERRIDES")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subTab === "PRODUCT_OVERRIDES" ? "bg-[#c59b6d] text-[#121214]" : "text-[#9e9ea8] hover:text-white"
            }`}
          >
            Product Zone Overrides
          </button>
        </div>
      </div>

      {statusBanner && (
        <div
          className={`p-3 rounded-xl text-xs font-medium border ${
            statusBanner.isError
              ? "bg-rose-950/50 border-rose-800 text-rose-200"
              : "bg-emerald-950/50 border-emerald-800 text-emerald-200"
          }`}
        >
          {statusBanner.text}
        </div>
      )}

      {/* ================================================================= */}
      {/* SUB-TAB 1: HIERARCHICAL PIN DIRECTORY & SIMULATOR                 */}
      {/* ================================================================= */}
      {subTab === "PINS" && (
        <div className="space-y-6">
          {/* Stats & Origin Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#1c1c20] border border-[#2e2e34]">
              <span className="text-[10px] uppercase tracking-wider text-[#9e9ea8] block">Region Prefixes (2–4 digit)</span>
              <span className="text-lg font-bold text-white font-mono">{prefixCount}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#1c1c20] border border-[#2e2e34]">
              <span className="text-[10px] uppercase tracking-wider text-[#9e9ea8] block">Exact 6-Digit PINs</span>
              <span className="text-lg font-bold text-[#c59b6d] font-mono">{exactPinCount}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#1c1c20] border border-[#2e2e34]">
              <span className="text-[10px] uppercase tracking-wider text-[#9e9ea8] block">Suspended Rules</span>
              <span className="text-lg font-bold text-rose-400 font-mono">{suspendedCount}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#1c1c20] border border-[#2e2e34]">
              <span className="text-[10px] uppercase tracking-wider text-[#9e9ea8] block">Approved Origins</span>
              <span className="text-xs font-mono font-semibold text-emerald-400 mt-1 block">110062, 110019, 110074</span>
            </div>
          </div>

          {/* Live 6-Digit Resolution Simulator */}
          <div className="p-5 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Live Nested PIN Resolution Simulator</h3>
                <p className="text-xs text-[#9e9ea8]">
                  Test any 6-digit Indian PIN code (e.g. <span className="font-mono text-white">110043</span>, <span className="font-mono text-white">560103</span>, <span className="font-mono text-white">194101</span>) to see which parent prefix or exact override governs it, and create an override in 1 click.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN"
                  value={simPin}
                  onChange={(e) => setSimPin(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleSimulatePin()}
                  className="rounded-lg border border-[#3e3e46] bg-[#16161a] px-3 py-1.5 text-xs text-white font-mono w-36 focus:border-[#c59b6d] focus:outline-none"
                />
                <button
                  onClick={handleSimulatePin}
                  disabled={simLoading}
                  className="px-4 py-1.5 rounded-lg bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors"
                >
                  {simLoading ? "Testing..." : "Simulate"}
                </button>
              </div>
            </div>

            {simResult && (
              <div className="p-4 rounded-xl bg-[#16161a] border border-[#2e2e34] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white">{simResult.pincode}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        simResult.isServiceable
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {simResult.isServiceable ? "SERVICEABLE" : "SUSPENDED / BLOCKED"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#24242a] text-[#c59b6d] text-[10px] font-mono">
                      Resolution: {simResult.resolutionType}
                      {simResult.matchedRulePrefix ? ` (Matched Rule: ${simResult.matchedRulePrefix})` : ""}
                    </span>
                  </div>
                  <p className="text-[#9e9ea8]">
                    Destination: <strong className="text-white">{simResult.city || "Unknown"}, {simResult.state}</strong> · Assigned Zone: <strong className="text-white">{simResult.zoneName}</strong> ({simResult.transitDaysEstimate})
                  </p>
                  {simResult.unserviceableReason && (
                    <p className="text-rose-400">Notice: {simResult.unserviceableReason}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      openModalForPin({
                        pincodePrefix: simResult.pincode,
                        cityLabel: simResult.city || "",
                        stateName: simResult.state || "",
                        zoneCode: simResult.zoneCode || "ZONE_D",
                        isServiceable: !simResult.isServiceable,
                        unserviceableReason: simResult.isServiceable ? "Temporarily suspended by Studio Logistics." : "",
                      })
                    }
                    className="px-3.5 py-2 rounded-lg bg-[#24242a] border border-[#3e3e46] text-white hover:border-[#c59b6d] text-xs font-semibold transition-colors"
                  >
                    {simResult.resolutionType === "EXACT_6_DIGIT"
                      ? `Edit Exact Override (${simResult.pincode})`
                      : `Create Exact Nested Override for ${simResult.pincode}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Toolbar & Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => openModalForPin()}
                className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors"
              >
                + Add PIN or Prefix Rule
              </button>
              <button
                onClick={handleImportUrban884}
                className="px-4 py-2 rounded-xl bg-[#24242a] border border-[#3e3e46] text-white font-semibold text-xs hover:border-[#c59b6d] transition-colors"
              >
                Sync {urbanCandidateCount} Urban Hub PINs to DB
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search PIN, city, state..."
                value={pinSearch}
                onChange={(e) => setPinSearch(e.target.value)}
                className="rounded-xl border border-[#3e3e46] bg-[#1c1c20] px-3 py-1.5 text-xs text-white placeholder-[#6e6e76] w-48 focus:border-[#c59b6d] focus:outline-none"
              />
              <select
                value={filterSpecificity}
                onChange={(e) => setFilterSpecificity(e.target.value)}
                className="rounded-xl border border-[#3e3e46] bg-[#1c1c20] px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Levels ({pincodes.length})</option>
                <option value="PREFIX">Region Prefixes ({prefixCount})</option>
                <option value="EXACT">Exact 6-Digit PINs ({exactPinCount})</option>
              </select>
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="rounded-xl border border-[#3e3e46] bg-[#1c1c20] px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Zones</option>
                {zones.map((z) => (
                  <option key={z.code} value={z.code}>{z.code}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-[#3e3e46] bg-[#1c1c20] px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Serviceable</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
          </div>

          {/* PIN Table */}
          <div className="rounded-2xl border border-[#2e2e34] bg-[#1c1c20] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181c] border-b border-[#2e2e34] text-[11px] uppercase tracking-wider text-[#9e9ea8]">
                <tr>
                  <th className="py-3 px-4">PIN / Prefix</th>
                  <th className="py-3 px-4">Hierarchy Level</th>
                  <th className="py-3 px-4">City / Region &amp; State</th>
                  <th className="py-3 px-4">Zone Assignment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e2e34]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#9e9ea8]">Loading PIN hierarchy...</td>
                  </tr>
                ) : pagedPincodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#9e9ea8]">No matching PIN rules found.</td>
                  </tr>
                ) : (
                  pagedPincodes.map((pin) => (
                    <tr key={pin.id} className="hover:bg-[#222228]/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white text-sm">{pin.pincode}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            pin.pincode.length === 6
                              ? "bg-amber-950/60 text-amber-300 border border-amber-800/60"
                              : "bg-[#24242a] text-[#9e9ea8] border border-[#3e3e46]"
                          }`}
                        >
                          {pin.pincode.length === 6
                            ? "Exact 6-Digit Override"
                            : pin.pincode.length === 3
                            ? "3-Digit Hub Prefix"
                            : "2-Digit Region Prefix"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">
                        <div>{pin.city}, {pin.state}</div>
                        {!pin.isServiceable && pin.unserviceableReason && (
                          <div className="text-[10px] text-rose-400 truncate max-w-xs">{pin.unserviceableReason}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={pin.zoneCode}
                          onChange={(e) => handleChangePinZone(pin, e.target.value)}
                          className="rounded-lg bg-[#24242a] border border-[#3e3e46] px-2 py-1 text-[11px] text-[#c59b6d] font-semibold focus:outline-none"
                        >
                          {zones.map((z) => (
                            <option key={z.code} value={z.code}>
                              {z.code} — {z.name.replace(/^Zone [A-E] /, "")}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            pin.isServiceable
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-rose-950 text-rose-300 border border-rose-800"
                          }`}
                        >
                          {pin.isServiceable ? "Serviceable" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePin(pin)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                            pin.isServiceable
                              ? "bg-[#2a2a30] text-rose-400 hover:bg-[#34343c]"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
                          }`}
                        >
                          {pin.isServiceable ? "Suspend" : "Enable"}
                        </button>
                        <button
                          onClick={() =>
                            openModalForPin({
                              pincodePrefix: pin.pincode,
                              cityLabel: pin.city,
                              stateName: pin.state,
                              zoneCode: pin.zoneCode,
                              isServiceable: pin.isServiceable,
                              unserviceableReason: pin.unserviceableReason || "",
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-[#24242a] text-white text-[11px] hover:bg-[#32323a]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRule(pin)}
                          className="px-2 py-1 rounded-lg bg-[#24242a] text-[#9e9ea8] hover:text-rose-400 text-[11px]"
                          title="Delete override"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-[#18181c] border-t border-[#2e2e34] text-xs text-[#9e9ea8]">
                <span>
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredPincodes.length)} of {filteredPincodes.length} rules
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded bg-[#24242a] text-white disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="font-mono text-white">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 rounded bg-[#24242a] text-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SUB-TAB 2: 12-SLAB LADDER, ZONES & WEIGHT MATRIX                  */}
      {/* ================================================================= */}
      {subTab === "SLABS_ZONES" && (
        <div className="space-y-6">
          {/* Card 1: 12 Approved Slabs Editor */}
          <div className="p-6 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2e2e34] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Approved 12 Delivery Fee Slabs (DB-Backed)</h3>
                <p className="text-xs text-[#9e9ea8]">
                  Tax-inclusive customer-payable fee ladder (INR). All rate matrix cells and product overrides select exclusively from these 12 slabs.
                </p>
              </div>
              <button
                onClick={handleSaveSlabs}
                className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors shrink-0"
              >
                Save 12-Slab Ladder
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2.5">
              {editingSlabs.map((val, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-[10px] text-[#9e9ea8] font-mono block">Slab {idx + 1}</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-xs text-[#6e6e76]">₹</span>
                    <input
                      type="number"
                      min={0}
                      value={val}
                      onChange={(e) => {
                        const next = [...editingSlabs];
                        next[idx] = e.target.value;
                        setEditingSlabs(next);
                      }}
                      className="w-full rounded-lg border border-[#3e3e46] bg-[#16161a] pl-5 pr-2 py-1.5 text-xs font-mono text-white focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Weight/Volumetric Tier x Distance Zone Matrix */}
          <div className="p-6 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Weight &amp; Volumetric Bracket × Distance Zone Matrix</h3>
              <p className="text-xs text-[#9e9ea8]">
                Adjusting any cell updates delivery pricing across all matching products in `.md` files immediately—no need to edit individual product files.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#2e2e34]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181c] border-b border-[#2e2e34] text-[11px] uppercase tracking-wider text-[#9e9ea8]">
                  <tr>
                    <th className="py-3 px-4">Weight Bracket &amp; Carrier</th>
                    {zones.map((z) => (
                      <th key={z.code} className="py-3 px-3 text-center">
                        <div className="text-white">{z.code}</div>
                        <div className="text-[10px] font-normal normal-case text-[#9e9ea8]">
                          {z.estimatedDaysMin}–{z.estimatedDaysMax} days
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2e2e34]">
                  {matrixTiers.map((tier) => (
                    <tr key={tier.tierCode} className="hover:bg-[#222228]/40">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{tier.tierLabel}</div>
                        <div className="text-[10px] text-[#9e9ea8]">{tier.carrierName}</div>
                      </td>
                      {zones.map((z) => (
                        <td key={z.code} className="py-3 px-2 text-center">
                          <select
                            value={tier.byZone[z.code] ?? 500}
                            onChange={(e) => handleUpdateMatrixCell(tier.tierCode, z.code, Number(e.target.value))}
                            className="rounded-lg bg-[#16161a] border border-[#3e3e46] px-2.5 py-1.5 text-xs font-mono text-[#c59b6d] font-semibold focus:border-[#c59b6d] focus:outline-none"
                          >
                            {feeSlabs.map((slab) => (
                              <option key={slab} value={slab}>
                                {slab === 0 ? "₹0 (Free)" : `₹${slab.toLocaleString("en-IN")}`}
                              </option>
                            ))}
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Distance Zone Configuration (Transit Windows) */}
          <div className="p-6 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">5 Commercial Distance Zones (Ex-Delhi NCR Hub)</h3>
              <p className="text-xs text-[#9e9ea8]">Configure zone descriptions and estimated transit days shown to customers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((z) => (
                <div key={z.code} className="p-4 rounded-xl bg-[#16161a] border border-[#2e2e34] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#c59b6d]">{z.code}</span>
                    <button
                      onClick={() => setEditingZone(z)}
                      className="text-[11px] text-white bg-[#24242a] px-2.5 py-1 rounded-lg hover:bg-[#32323a]"
                    >
                      Edit Zone
                    </button>
                  </div>
                  <div className="font-semibold text-white">{z.name}</div>
                  <p className="text-[11px] text-[#9e9ea8]">{z.description}</p>
                  <div className="text-[11px] text-emerald-400 font-mono">
                    Transit: {z.estimatedDaysMin}–{z.estimatedDaysMax} business days
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SUB-TAB 3: PRODUCT-SPECIFIC OVERRIDES & FEE PREVIEWER             */}
      {/* ================================================================= */}
      {subTab === "PRODUCT_OVERRIDES" && (
        <div className="space-y-6">
          {/* Live Shipping Fee Previewer */}
          <div className="p-5 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Authoritative Delivery Fee Previewer</h3>
                <p className="text-xs text-[#9e9ea8]">
                  Test what a customer sees for any product + PIN combination under live DB slabs &amp; overrides.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={calcProductId}
                  onChange={(e) => setCalcProductId(e.target.value)}
                  className="rounded-lg border border-[#3e3e46] bg-[#16161a] px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({(p.weightGrams / 1000).toFixed(2)} kg)
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  maxLength={6}
                  value={calcPin}
                  onChange={(e) => setCalcPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="PIN (e.g. 560001)"
                  className="rounded-lg border border-[#3e3e46] bg-[#16161a] px-3 py-1.5 text-xs font-mono text-white w-28"
                />
                <button
                  onClick={handleCalculatePreview}
                  className="px-4 py-1.5 rounded-lg bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c]"
                >
                  Calculate
                </button>
              </div>
            </div>

            {calcResult && (
              <div className="p-4 rounded-xl bg-[#16161a] border border-[#2e2e34] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-[#9e9ea8] block">Destination</span>
                  <span className="font-semibold text-white">
                    {calcResult.pincodeResult.city}, {calcResult.pincodeResult.state}
                  </span>
                  <span className="text-[10px] text-[#c59b6d] block">{calcResult.pincodeResult.zoneCode}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#9e9ea8] block">Billable Weight</span>
                  <span className="font-semibold text-white font-mono">
                    {calcResult.billableWeightKg} kg
                  </span>
                  <span className="text-[10px] text-[#9e9ea8] block">
                    (Actual: {calcResult.actualWeightKg} kg / Vol: {calcResult.volumetricWeightKg} kg)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#9e9ea8] block">Rule Source</span>
                  <span className="font-semibold text-amber-300">{calcResult.ruleSource}</span>
                  <span className="text-[10px] text-[#9e9ea8] block">{calcResult.carrierName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#9e9ea8] block">Customer Fee (Tax Incl.)</span>
                  <span className="font-bold text-lg text-emerald-400 font-mono">
                    ₹{calcResult.totalDeliveryFeeRupees.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Product-by-Zone Override Table */}
          <div className="rounded-2xl border border-[#2e2e34] bg-[#1c1c20] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181c] border-b border-[#2e2e34] text-[11px] uppercase tracking-wider text-[#9e9ea8]">
                <tr>
                  <th className="py-3 px-4">Product (from .md)</th>
                  <th className="py-3 px-3">Specs</th>
                  {zones.map((z) => (
                    <th key={z.code} className="py-3 px-3 text-center">{z.code}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e2e34]">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#222228]/40">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{prod.title}</div>
                      <div className="text-[10px] font-mono text-[#9e9ea8]">{prod.sku}</div>
                    </td>
                    <td className="py-3.5 px-3 text-[11px] font-mono text-[#9e9ea8]">
                      {(prod.weightGrams / 1000).toFixed(2)} kg
                    </td>
                    {zones.map((z) => {
                      const ov = productOverrides.find(
                        (o) => o.productId === prod.id && o.shippingZoneCode === z.code
                      );
                      return (
                        <td key={z.code} className="py-3 px-2 text-center">
                          <select
                            value={ov ? String(ov.feeSlabRupees) : "AUTO"}
                            onChange={(e) => handleSetProductOverride(prod.id, z.code, e.target.value)}
                            className={`rounded-lg border px-2 py-1 text-xs font-mono focus:outline-none ${
                              ov
                                ? "bg-amber-950/60 border-amber-700 text-amber-200 font-semibold"
                                : "bg-[#16161a] border-[#3e3e46] text-[#9e9ea8]"
                            }`}
                          >
                            <option value="AUTO">Auto (Matrix)</option>
                            {feeSlabs.map((slab) => (
                              <option key={slab} value={String(slab)}>
                                ₹{slab.toLocaleString("en-IN")}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: ADD / EDIT HIERARCHICAL PIN RULE                           */}
      {/* ================================================================= */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form
            onSubmit={handleSavePinRule}
            className="w-full max-w-md rounded-2xl bg-[#1c1c20] border border-[#3e3e46] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
              <h3 className="text-sm font-semibold text-white">Configure PIN or Prefix Rule</h3>
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="text-xs text-[#9e9ea8] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#9e9ea8] block mb-1">
                  PIN Code or Region Prefix (2, 3, 4, or 6 digits)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={ruleForm.pincodePrefix}
                  onChange={(e) => setRuleForm((p) => ({ ...p, pincodePrefix: e.target.value.replace(/\D/g, "") }))}
                  placeholder="e.g. 11 (Delhi), 110 (Core), or 110043 (Exact)"
                  className="w-full rounded-xl border border-[#3e3e46] bg-[#16161a] px-3 py-2 text-white font-mono focus:border-[#c59b6d] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9e9ea8] block mb-1">City / Hub Label</label>
                  <input
                    type="text"
                    required
                    value={ruleForm.cityLabel}
                    onChange={(e) => setRuleForm((p) => ({ ...p, cityLabel: e.target.value }))}
                    placeholder="e.g. South Delhi"
                    className="w-full rounded-xl border border-[#3e3e46] bg-[#16161a] px-3 py-2 text-white focus:border-[#c59b6d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#9e9ea8] block mb-1">State / UT</label>
                  <input
                    type="text"
                    required
                    value={ruleForm.stateName}
                    onChange={(e) => setRuleForm((p) => ({ ...p, stateName: e.target.value }))}
                    placeholder="e.g. Delhi"
                    className="w-full rounded-xl border border-[#3e3e46] bg-[#16161a] px-3 py-2 text-white focus:border-[#c59b6d] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#9e9ea8] block mb-1">Assigned Commercial Zone</label>
                <select
                  value={ruleForm.zoneCode}
                  onChange={(e) => setRuleForm((p) => ({ ...p, zoneCode: e.target.value }))}
                  className="w-full rounded-xl border border-[#3e3e46] bg-[#16161a] px-3 py-2 text-white focus:border-[#c59b6d] focus:outline-none"
                >
                  {zones.map((z) => (
                    <option key={z.code} value={z.code}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-white font-medium">Serviceability Status</span>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleForm.isServiceable}
                    onChange={(e) => setRuleForm((p) => ({ ...p, isServiceable: e.target.checked }))}
                    className="accent-[#c59b6d]"
                  />
                  <span className={ruleForm.isServiceable ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                    {ruleForm.isServiceable ? "Serviceable (Active)" : "Suspended (Blocked)"}
                  </span>
                </label>
              </div>

              {!ruleForm.isServiceable && (
                <div>
                  <label className="text-[#9e9ea8] block mb-1">Custom Notice to Customer</label>
                  <input
                    type="text"
                    value={ruleForm.unserviceableReason}
                    onChange={(e) => setRuleForm((p) => ({ ...p, unserviceableReason: e.target.value }))}
                    placeholder="e.g. Fragile pallet route temporarily paused."
                    className="w-full rounded-xl border border-[#3e3e46] bg-[#16161a] px-3 py-2 text-white focus:border-[#c59b6d] focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#2e2e34]">
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="px-4 py-2 rounded-xl bg-[#24242a] text-xs text-white hover:bg-[#32323a]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c]"
              >
                Save PIN Rule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: EDIT SHIPPING ZONE                                         */}
      {/* ================================================================= */}
      {editingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form
            onSubmit={handleSaveZone}
            className="w-full max-w-md rounded-2xl bg-[#1c1c20] border border-[#3e3e46] p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
              <h3 className="text-sm font-semibold text-white">Edit Shipping Zone: {editingZone.code}</h3>
              <button type="button" onClick={() => setEditingZone(null)} className="text-[#9e9ea8]">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[#9e9ea8] block mb-1">Zone Display Name</label>
                <input
                  type="text"
                  required
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  className="w-full rounded-xl border border-[#3e3e46] bg-[#16161a] px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-[#9e9ea8] block mb-1">Coverage Description</label>
                <textarea
                  rows={2}
                  required
                  value={editingZone.description}
                  onChange={(e) => setEditingZone({ ...editingZone, description: e.target.value })}
                  className="w-full rounded-xl border border-[#3e3e46] bg-[#16161a] px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9e9ea8] block mb-1">Min Transit Days</label>
                  <input
                    type="number"
                    min={1}
                    value={editingZone.estimatedDaysMin}
                    onChange={(e) => setEditingZone({ ...editingZone, estimatedDaysMin: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#3e3e46] bg-[#16161a] px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#9e9ea8] block mb-1">Max Transit Days</label>
                  <input
                    type="number"
                    min={1}
                    value={editingZone.estimatedDaysMax}
                    onChange={(e) => setEditingZone({ ...editingZone, estimatedDaysMax: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#3e3e46] bg-[#16161a] px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#2e2e34]">
              <button type="button" onClick={() => setEditingZone(null)} className="px-4 py-2 rounded-xl bg-[#24242a] text-white">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#121214] font-semibold">
                Save Zone
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
