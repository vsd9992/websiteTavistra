import React, { useState, useEffect, useMemo } from "react";
import { StaffRole, isActionPermitted } from "../rbac";

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
  coverageMode?: "STRICT_WHITELIST" | "ALLOW_ALL_IN_PREFIX";
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
  staffRole?: StaffRole;
  onLogAudit: (action: string, entityType: string, entityId: string, details: string) => void;
  onPincodesUpdated?: (pincodes: PincodeRuleRow[]) => void;
}

export function LogisticsTab({ staffName, staffRole, onLogAudit, onPincodesUpdated }: LogisticsTabProps) {
  const [subTab, setSubTab] = useState<"PINS" | "SLABS_ZONES" | "PRODUCT_OVERRIDES">("PINS");
  const [loading, setLoading] = useState(true);
  const [statusBanner, setStatusBanner] = useState<{ text: string; isError?: boolean } | null>(null);

  const checkPermitted = () => {
    if (staffRole && !isActionPermitted(staffRole, "PINCODES_MUTATE")) {
      notify(`Unauthorized: Role '${staffRole}' cannot modify delivery logistics or PIN codes. Requires Commerce Admin or Super Admin.`, true);
      return false;
    }
    return true;
  };

  // PINs State
  const [pincodes, setPincodes] = useState<PincodeRuleRow[]>([]);
  const [zones, setZones] = useState<ZoneConfig[]>([]);
  const [urbanCandidateCount, setUrbanCandidateCount] = useState(884);
  const [pinSearch, setPinSearch] = useState("");
  const [filterZone, setFilterZone] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedRegionPrefix, setSelectedRegionPrefix] = useState<string | null>(null);
  const [regionChildSearch, setRegionChildSearch] = useState("");
  const [regionChildStatus, setRegionChildStatus] = useState<string>("ALL");
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
    coverageMode: "STRICT_WHITELIST" as "STRICT_WHITELIST" | "ALLOW_ALL_IN_PREFIX",
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

  // Visual View Mode: MAP vs DONUT vs PROTOCOL
  const [visualMode, setVisualMode] = useState<"MAP" | "DONUT" | "PROTOCOL">("MAP");
  const [pincodeDonutView, setPincodeDonutView] = useState<"ZONE" | "STATUS">("ZONE");
  const [hoveredPincodeSlice, setHoveredPincodeSlice] = useState<string | null>(null);
  const [hoveredMapRegion, setHoveredMapRegion] = useState<string | null>(null);

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

  const REGION_2DIGIT_LABELS: Record<string, { region: string; defaultZone: string }> = {
    "11": { region: "Delhi NCR", defaultZone: "ZONE_A" },
    "12": { region: "Haryana South (Gurgaon / Faridabad)", defaultZone: "ZONE_A" },
    "13": { region: "Haryana North (Ambala / Karnal)", defaultZone: "ZONE_B" },
    "14": { region: "Punjab (Ludhiana / Amritsar)", defaultZone: "ZONE_B" },
    "15": { region: "Punjab West (Bathinda)", defaultZone: "ZONE_B" },
    "16": { region: "Chandigarh / Mohali", defaultZone: "ZONE_B" },
    "17": { region: "Himachal Pradesh (Shimla / Kullu)", defaultZone: "ZONE_B" },
    "18": { region: "Jammu & Kashmir (Jammu)", defaultZone: "ZONE_E" },
    "19": { region: "Kashmir & Ladakh (Srinagar / Leh)", defaultZone: "ZONE_E" },
    "20": { region: "Western UP NCR (Noida / Ghaziabad)", defaultZone: "ZONE_A" },
    "22": { region: "Uttar Pradesh (Lucknow / Varanasi)", defaultZone: "ZONE_B" },
    "24": { region: "Uttarakhand / Rohilkhand (Dehradun)", defaultZone: "ZONE_B" },
    "25": { region: "Western UP (Meerut)", defaultZone: "ZONE_B" },
    "28": { region: "Uttar Pradesh (Agra / Mathura)", defaultZone: "ZONE_B" },
    "30": { region: "Rajasthan (Jaipur)", defaultZone: "ZONE_B" },
    "38": { region: "Gujarat (Ahmedabad / Gandhinagar)", defaultZone: "ZONE_C" },
    "39": { region: "Gujarat South (Surat / Vadodara)", defaultZone: "ZONE_C" },
    "40": { region: "Maharashtra (Mumbai / Thane)", defaultZone: "ZONE_C" },
    "41": { region: "Maharashtra (Pune / Nashik)", defaultZone: "ZONE_C" },
    "44": { region: "Maharashtra East (Nagpur)", defaultZone: "ZONE_D" },
    "45": { region: "Madhya Pradesh (Indore)", defaultZone: "ZONE_D" },
    "46": { region: "Madhya Pradesh (Bhopal)", defaultZone: "ZONE_D" },
    "50": { region: "Telangana (Hyderabad)", defaultZone: "ZONE_C" },
    "56": { region: "Karnataka (Bengaluru)", defaultZone: "ZONE_C" },
    "60": { region: "Tamil Nadu (Chennai)", defaultZone: "ZONE_C" },
    "64": { region: "Tamil Nadu (Coimbatore)", defaultZone: "ZONE_D" },
    "68": { region: "Kerala (Kochi / Ernakulam)", defaultZone: "ZONE_D" },
    "70": { region: "West Bengal (Kolkata)", defaultZone: "ZONE_C" },
    "75": { region: "Odisha (Bhubaneswar)", defaultZone: "ZONE_D" },
    "78": { region: "Assam (Guwahati)", defaultZone: "ZONE_E" },
    "79": { region: "North-East India", defaultZone: "ZONE_E" },
    "80": { region: "Bihar (Patna)", defaultZone: "ZONE_D" },
  };

  interface RegionGroup {
    prefix2: string;
    regionName: string;
    stateName: string;
    zoneCode: string;
    regionRule: PincodeRuleRow | null;
    subPrefixes: PincodeRuleRow[];
    exactPins: PincodeRuleRow[];
    activeCount: number;
    disabledCount: number;
    isRegionActive: boolean;
    coverageMode: "STRICT_WHITELIST" | "ALLOW_ALL_IN_PREFIX";
  }

  // Group all DB PIN rules by 2-digit postal region
  const regionGroups = useMemo<RegionGroup[]>(() => {
    const map = new Map<string, PincodeRuleRow[]>();
    for (const p of pincodes) {
      const p2 = p.pincode.slice(0, 2);
      if (!map.has(p2)) map.set(p2, []);
      map.get(p2)!.push(p);
    }

    const groups: RegionGroup[] = [];
    for (const [p2, rows] of map.entries()) {
      const regionRule = rows.find((r) => r.pincode === p2) || null;
      const subPrefixes = rows.filter((r) => r.pincode.length > 2 && r.pincode.length < 6);
      const exactPins = rows.filter((r) => r.pincode.length === 6);
      const activeCount = exactPins.filter((r) => r.isServiceable).length;
      const disabledCount = exactPins.filter((r) => !r.isServiceable).length;
      const meta = REGION_2DIGIT_LABELS[p2];

      const zoneCode =
        regionRule?.zoneCode ||
        exactPins[0]?.zoneCode ||
        subPrefixes[0]?.zoneCode ||
        meta?.defaultZone ||
        "ZONE_D";
      const stateName =
        regionRule?.state ||
        exactPins[0]?.state ||
        subPrefixes[0]?.state ||
        meta?.region ||
        "India";
      const regionName =
        meta?.region ||
        regionRule?.city ||
        regionRule?.state ||
        stateName;

      groups.push({
        prefix2: p2,
        regionName,
        stateName,
        zoneCode,
        regionRule,
        subPrefixes,
        exactPins,
        activeCount,
        disabledCount,
        isRegionActive: regionRule ? regionRule.isServiceable : true,
        coverageMode: regionRule?.coverageMode || "STRICT_WHITELIST",
      });
    }

    return groups.sort((a, b) => a.prefix2.localeCompare(b.prefix2));
  }, [pincodes]);

  // Filtered Regions on Level 1 Main List
  const filteredRegions = useMemo(() => {
    const q = pinSearch.trim().toLowerCase();
    return regionGroups.filter((g) => {
      if (filterZone !== "ALL" && g.zoneCode !== filterZone) return false;
      if (filterStatus === "ACTIVE" && !g.isRegionActive) return false;
      if (filterStatus === "DISABLED" && g.isRegionActive) return false;

      if (!q) return true;
      if (
        g.prefix2.includes(q) ||
        g.regionName.toLowerCase().includes(q) ||
        g.stateName.toLowerCase().includes(q) ||
        g.zoneCode.toLowerCase().includes(q)
      ) {
        return true;
      }
      return (
        g.subPrefixes.some((sp) => sp.pincode.includes(q) || sp.city.toLowerCase().includes(q)) ||
        g.exactPins.some(
          (ep) =>
            ep.pincode.includes(q) ||
            ep.city.toLowerCase().includes(q) ||
            (ep.locality || "").toLowerCase().includes(q)
        )
      );
    });
  }, [regionGroups, pinSearch, filterZone, filterStatus]);

  const activeRegionGroup = useMemo(
    () => regionGroups.find((g) => g.prefix2 === selectedRegionPrefix) || null,
    [regionGroups, selectedRegionPrefix]
  );

  // Scoped 6-digit PINs inside active Region (Level 2)
  const filteredRegionExactPins = useMemo(() => {
    if (!activeRegionGroup) return [];
    const q = regionChildSearch.trim().toLowerCase();
    return activeRegionGroup.exactPins.filter((p) => {
      if (regionChildStatus === "ACTIVE" && !p.isServiceable) return false;
      if (regionChildStatus === "DISABLED" && p.isServiceable) return false;
      if (!q) return true;
      return (
        p.pincode.includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.locality || "").toLowerCase().includes(q)
      );
    });
  }, [activeRegionGroup, regionChildSearch, regionChildStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredRegionExactPins.length / PAGE_SIZE));
  const pagedRegionPins = filteredRegionExactPins.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [selectedRegionPrefix, regionChildSearch, regionChildStatus]);

  const openRegionDetail = (prefix2: string, initialSearch = "") => {
    setSelectedRegionPrefix(prefix2);
    setRegionChildSearch(initialSearch);
    setRegionChildStatus("ALL");
    setPage(1);
  };

  // Toggle or create a 2-digit Region rule cleanly
  const handleToggleRegionPause = async (group: RegionGroup) => {
    if (!checkPermitted()) return;
    const nextActive = !group.isRegionActive;
    try {
      if (group.regionRule) {
        await handleTogglePin(group.regionRule);
      } else {
        const res = await fetch("/api/admin/pincodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "UPSERT_RULE",
            pincodePrefix: group.prefix2,
            cityLabel: group.regionName,
            stateName: group.stateName,
            zoneCode: group.zoneCode,
            isServiceable: nextActive,
            coverageMode: group.coverageMode,
            unserviceableReason: nextActive
              ? ""
              : `Deliveries to ${group.regionName} (${group.prefix2}xxxx) temporarily suspended by Studio Logistics.`,
            staffName,
          }),
        });
        if (!res.ok) throw new Error("Failed to update region rule");
        notify(`Region ${group.prefix2} (${group.regionName}) marked ${nextActive ? "Active" : "Paused"}.`);
        await loadAll();
      }
    } catch (err) {
      notify((err as Error).message, true);
    }
  };

  // Update 2-digit Region Zone or Coverage Policy
  const handleUpdateRegionPolicy = async (
    group: RegionGroup,
    updates: { zoneCode?: string; coverageMode?: "STRICT_WHITELIST" | "ALLOW_ALL_IN_PREFIX" }
  ) => {
    if (!checkPermitted()) return;
    try {
      if (group.regionRule) {
        const res = await fetch("/api/admin/pincodes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: group.regionRule.id,
            ...updates,
            staffName,
          }),
        });
        if (!res.ok) throw new Error("Failed to update region policy");
      } else {
        const res = await fetch("/api/admin/pincodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "UPSERT_RULE",
            pincodePrefix: group.prefix2,
            cityLabel: group.regionName,
            stateName: group.stateName,
            zoneCode: updates.zoneCode || group.zoneCode,
            isServiceable: group.isRegionActive,
            coverageMode: updates.coverageMode || group.coverageMode,
            staffName,
          }),
        });
        if (!res.ok) throw new Error("Failed to save region policy");
      }
      notify(`Updated policy for Region ${group.prefix2} (${group.regionName}).`);
      await loadAll();
    } catch (err) {
      notify((err as Error).message, true);
    }
  };

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
      coverageMode: pinData?.coverageMode || "STRICT_WHITELIST",
      unserviceableReason: pinData?.unserviceableReason || "",
    });
    setShowRuleModal(true);
  };

  const handleSavePinRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPermitted()) return;
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
    if (!checkPermitted()) return;
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
    if (!checkPermitted()) return;
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
    if (!checkPermitted()) return;
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
    if (!checkPermitted()) return;
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
    if (!checkPermitted()) return;
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
    if (!checkPermitted()) return;
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
    if (!checkPermitted()) return;
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
    if (!checkPermitted()) return;
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

  // Interactive India Map Regional Territories
  const INDIA_MAP_REGIONS = [
    { prefix2: "11", label: "Delhi NCR", state: "Delhi Hub", zone: "ZONE_A", x: 320, y: 195, hub: true },
    { prefix2: "19", label: "Kashmir & Ladakh", state: "Ladakh", zone: "ZONE_E", x: 290, y: 70 },
    { prefix2: "18", label: "Jammu", state: "J&K", zone: "ZONE_E", x: 245, y: 105 },
    { prefix2: "17", label: "Himachal Pradesh", state: "Himachal", zone: "ZONE_B", x: 340, y: 115 },
    { prefix2: "14", label: "Punjab (Ludhiana)", state: "Punjab", zone: "ZONE_B", x: 235, y: 150 },
    { prefix2: "13", label: "Haryana North", state: "Haryana", zone: "ZONE_B", x: 295, y: 155 },
    { prefix2: "24", label: "Uttarakhand", state: "Uttarakhand", zone: "ZONE_B", x: 395, y: 155 },
    { prefix2: "30", label: "Rajasthan (Jaipur)", state: "Rajasthan", zone: "ZONE_B", x: 195, y: 240 },
    { prefix2: "22", label: "Uttar Pradesh", state: "UP", zone: "ZONE_B", x: 440, y: 215 },
    { prefix2: "80", label: "Bihar (Patna)", state: "Bihar", zone: "ZONE_D", x: 530, y: 245 },
    { prefix2: "78", label: "Assam & NE", state: "Assam", zone: "ZONE_E", x: 670, y: 220 },
    { prefix2: "70", label: "West Bengal (Kolkata)", state: "Kolkata", zone: "ZONE_C", x: 560, y: 330 },
    { prefix2: "75", label: "Odisha (Bhubaneswar)", state: "Odisha", zone: "ZONE_D", x: 500, y: 405 },
    { prefix2: "38", label: "Gujarat (Ahmedabad)", state: "Gujarat", zone: "ZONE_C", x: 145, y: 335 },
    { prefix2: "45", label: "Madhya Pradesh", state: "MP", zone: "ZONE_D", x: 310, y: 315 },
    { prefix2: "40", label: "Maharashtra (Mumbai)", state: "Mumbai/Pune", zone: "ZONE_C", x: 195, y: 420 },
    { prefix2: "44", label: "Maharashtra East", state: "Nagpur", zone: "ZONE_D", x: 345, y: 395 },
    { prefix2: "50", label: "Telangana (Hyderabad)", state: "Hyderabad", zone: "ZONE_C", x: 345, y: 475 },
    { prefix2: "56", label: "Karnataka (Bengaluru)", state: "Bengaluru", zone: "ZONE_C", x: 270, y: 545 },
    { prefix2: "60", label: "Tamil Nadu (Chennai)", state: "Chennai", zone: "ZONE_C", x: 375, y: 565 },
    { prefix2: "68", label: "Kerala (Kochi)", state: "Kerala", zone: "ZONE_D", x: 270, y: 625 },
    { prefix2: "64", label: "TN South (Coimbatore)", state: "Tamil Nadu", zone: "ZONE_D", x: 345, y: 625 },
  ];

  const prefixCount = pincodes.filter((p) => p.pincode.length < 6).length;
  const exactPinCount = pincodes.filter((p) => p.pincode.length === 6).length;
  const suspendedCount = pincodes.filter((p) => !p.isServiceable).length;
  const serviceableCount = pincodes.filter((p) => p.isServiceable).length;

  // Donut data computation (100% mathematically consistent)
  const pincodeDonutData = useMemo(() => {
    if (pincodeDonutView === "ZONE") {
      const zoneCounts: Record<string, number> = {
        ZONE_A: 0,
        ZONE_B: 0,
        ZONE_C: 0,
        ZONE_D: 0,
        ZONE_E: 0,
      };
      pincodes.forEach((p) => {
        const code = p.zoneCode || "ZONE_D";
        zoneCounts[code] = (zoneCounts[code] || 0) + 1;
      });

      const zoneColorMap: Record<string, string> = {
        ZONE_A: "#c59b6d",
        ZONE_B: "#38bdf8",
        ZONE_C: "#10b981",
        ZONE_D: "#818cf8",
        ZONE_E: "#f43f5e",
      };

      const slices = Object.entries(zoneCounts).map(([code, count]) => {
        const zoneObj = zones.find((z) => z.code === code);
        return {
          id: code,
          label: zoneObj ? `${zoneObj.code} (${zoneObj.name})` : code,
          count,
          color: zoneColorMap[code] || "#a8a093",
          filterKey: code,
        };
      }).filter((s) => s.count > 0);

      const sumCount = slices.reduce((acc, s) => acc + s.count, 0) || 1;
      return {
        slices: slices.map((s) => ({
          ...s,
          pct: Math.round((s.count / sumCount) * 100),
        })),
        totalCount: sumCount,
        title: "Postal Rules across 5 Shipping Zones",
        centerNumber: sumCount,
        centerLabel: "PIN Rules",
      };
    } else {
      const slices = [
        { id: "SERVICEABLE", label: "Serviceable (Active Whitelist)", count: serviceableCount, color: "#10b981", filterKey: "ACTIVE" },
        { id: "SUSPENDED", label: "Suspended / Blocked", count: suspendedCount, color: "#f43f5e", filterKey: "DISABLED" },
      ].filter((s) => s.count > 0);

      const sumCount = slices.reduce((acc, s) => acc + s.count, 0) || 1;
      return {
        slices: slices.map((s) => ({
          ...s,
          pct: Math.round((s.count / sumCount) * 100),
        })),
        totalCount: sumCount,
        title: "Whitelist Serviceability Health",
        centerNumber: sumCount,
        centerLabel: "Verified Coverage",
      };
    }
  }, [pincodes, zones, pincodeDonutView, serviceableCount, suspendedCount]);

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#38332c] pb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Logistics, Nested PIN Governance &amp; 12-Slab Engine</h2>
          <p className="text-xs text-[#a8a093]">
            Manage 3-tier hierarchical PIN rules (Region Prefix → District Hub → Exact 6-Digit PIN), the DB-backed 12-slab ladder, and product overrides.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#1e1c19] p-1 rounded-xl border border-[#38332c]">
          <button
            onClick={() => setSubTab("PINS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subTab === "PINS" ? "bg-[#c59b6d] text-[#181715]" : "text-[#a8a093] hover:text-white"
            }`}
          >
            PIN Hierarchy ({pincodes.length})
          </button>
          <button
            onClick={() => setSubTab("SLABS_ZONES")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subTab === "SLABS_ZONES" ? "bg-[#c59b6d] text-[#181715]" : "text-[#a8a093] hover:text-white"
            }`}
          >
            12 Slabs &amp; Zone Matrix
          </button>
          <button
            onClick={() => setSubTab("PRODUCT_OVERRIDES")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subTab === "PRODUCT_OVERRIDES" ? "bg-[#c59b6d] text-[#181715]" : "text-[#a8a093] hover:text-white"
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
          {/* 4 Top Metric Pulse Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#24211d] border border-[#38332c]">
              <span className="text-[10px] uppercase font-bold text-[#a8a093] tracking-wider block">Registered PIN Rules</span>
              <span className="text-2xl font-mono font-bold text-white mt-1 block">
                {pincodes.length}
              </span>
              <div className="text-[11px] text-[#a8a093] mt-0.5 flex items-center justify-between">
                <span>{exactPinCount} Exact · {prefixCount} Prefixes</span>
                <span className="text-[#c59b6d] font-medium">Hierarchical</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#24211d] border border-[#38332c]">
              <span className="text-[10px] uppercase font-bold text-[#a8a093] tracking-wider block">Whitelist Health</span>
              <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">
                {pincodes.length > 0 ? Math.round((serviceableCount / pincodes.length) * 100) : 100}%
              </span>
              <div className="text-[11px] text-[#a8a093] mt-0.5 flex items-center justify-between">
                <span>{serviceableCount} Serviceable</span>
                <span className={suspendedCount > 0 ? "text-amber-400 font-medium" : "text-emerald-400 font-medium"}>
                  {suspendedCount} Suspended
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#24211d] border border-[#38332c]">
              <span className="text-[10px] uppercase font-bold text-[#a8a093] tracking-wider block">Commercial Shipping Zones</span>
              <span className="text-2xl font-mono font-bold text-[#38bdf8] mt-1 block">
                {zones.length} Zones
              </span>
              <div className="text-[11px] text-[#a8a093] mt-0.5 flex items-center justify-between">
                <span>Zone A through Zone E</span>
                <span className="text-[#38bdf8] font-medium">Ex-Delhi Hub</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#24211d] border border-[#38332c]">
              <span className="text-[10px] uppercase font-bold text-[#a8a093] tracking-wider block">12-Slab Fee Ladder</span>
              <span className="text-lg font-mono font-bold text-white mt-1.5 block truncate">
                ₹{feeSlabs[0] ?? 0} – ₹{(feeSlabs[feeSlabs.length - 1] ?? 7500).toLocaleString("en-IN")}
              </span>
              <div className="text-[11px] text-[#a8a093] mt-0.5 flex items-center justify-between">
                <span>Origins: 110062, 110019</span>
                <span className="text-emerald-400 font-medium">Approved</span>
              </div>
            </div>
          </div>

          {/* Visual Section: Interactive India Map / Donut / Protocol Switcher */}
          <div className="p-5 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#38332c] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs uppercase font-bold text-[#c59b6d] tracking-wider">
                    {visualMode === "MAP"
                      ? "Interactive India Delivery Zones Map"
                      : visualMode === "DONUT"
                      ? pincodeDonutData.title
                      : "Studio Delivery Governance Protocol (TAV-04)"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#181715] text-emerald-400 border border-[#38332c]">
                    {visualMode === "MAP" ? "22 Regional Postal Nodes" : "Live DB Telemetry"}
                  </span>
                </div>
                <p className="text-[11px] text-[#a8a093] mt-0.5">
                  {visualMode === "MAP"
                    ? "Click any regional node or state card to drill down into its exact 6-digit PIN codes."
                    : visualMode === "DONUT"
                    ? "Interactive mathematical distribution of postal rules across commercial shipping zones."
                    : "Statutory governance rules protecting bespoke solid-brass luxury freight."}
                </p>
              </div>

              {/* View Switcher Controls */}
              <div className="flex items-center gap-1 bg-[#181715] p-1 rounded-xl border border-[#38332c] shrink-0">
                <button
                  type="button"
                  onClick={() => setVisualMode("MAP")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    visualMode === "MAP" ? "bg-[#c59b6d] text-[#181715]" : "text-[#a8a093] hover:text-white"
                  }`}
                >
                  <span>🗺</span>
                  <span>India Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisualMode("DONUT")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    visualMode === "DONUT" ? "bg-[#c59b6d] text-[#181715]" : "text-[#a8a093] hover:text-white"
                  }`}
                >
                  <span>📊</span>
                  <span>Zones Donut</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisualMode("PROTOCOL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    visualMode === "PROTOCOL" ? "bg-[#c59b6d] text-[#181715]" : "text-[#a8a093] hover:text-white"
                  }`}
                >
                  <span>📋</span>
                  <span>Protocol</span>
                </button>
              </div>
            </div>

            {/* VIEW 1: INTERACTIVE MAP OF INDIA */}
            {visualMode === "MAP" && (
              <div className="space-y-4">
                <div className="relative rounded-2xl bg-[#16161a] border border-[#38332c] p-4 overflow-hidden">
                  <svg
                    viewBox="0 0 760 690"
                    className="w-full h-auto select-none"
                    style={{ minHeight: "420px", maxHeight: "680px" }}
                  >
                    <defs>
                      <linearGradient id="hubPulse" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c59b6d" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#c59b6d" stopOpacity="0" />
                      </linearGradient>
                      <radialGradient id="hubBeacon" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#c59b6d" stopOpacity="1" />
                        <stop offset="50%" stopColor="#c59b6d" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#c59b6d" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Subtle Coordinate Graticule Grid */}
                    <g opacity="0.15" stroke="#464037" strokeWidth="0.5" strokeDasharray="3 3">
                      <line x1="50" y1="120" x2="710" y2="120" />
                      <line x1="50" y1="240" x2="710" y2="240" />
                      <line x1="50" y1="360" x2="710" y2="360" />
                      <line x1="50" y1="480" x2="710" y2="480" />
                      <line x1="50" y1="600" x2="710" y2="600" />
                      <line x1="180" y1="50" x2="180" y2="650" />
                      <line x1="320" y1="50" x2="320" y2="650" />
                      <line x1="460" y1="50" x2="460" y2="650" />
                      <line x1="600" y1="50" x2="600" y2="650" />
                    </g>

                    {/* Geographic Cardinal Label Markers */}
                    <text x="60" y="70" fill="#787165" fontSize="10" fontFamily="monospace">NW · 32°N 74°E</text>
                    <text x="650" y="70" fill="#787165" fontSize="10" fontFamily="monospace">NE · 28°N 96°E</text>
                    <text x="60" y="650" fill="#787165" fontSize="10" fontFamily="monospace">SW · 10°N 72°E</text>
                    <text x="650" y="650" fill="#787165" fontSize="10" fontFamily="monospace">SE · 8°N 80°E</text>

                    {/* Transit Corridor Curved Lines connecting Delhi NCR Hub (320, 195) to each region */}
                    {INDIA_MAP_REGIONS.filter((n) => !n.hub).map((n) => {
                      const zoneColors: Record<string, string> = {
                        ZONE_A: "#c59b6d",
                        ZONE_B: "#38bdf8",
                        ZONE_C: "#10b981",
                        ZONE_D: "#818cf8",
                        ZONE_E: "#f43f5e",
                      };
                      const color = zoneColors[n.zone] || "#a8a093";
                      const isHovered = hoveredMapRegion === n.prefix2;
                      const midX = (320 + n.x) / 2 + (n.x > 320 ? 15 : -15);
                      const midY = (195 + n.y) / 2 - 10;

                      return (
                        <path
                          key={`corridor-${n.prefix2}`}
                          d={`M 320 195 Q ${midX} ${midY} ${n.x} ${n.y}`}
                          fill="none"
                          stroke={color}
                          strokeWidth={isHovered ? 2.5 : 1}
                          strokeDasharray={isHovered ? "none" : "3 3"}
                          opacity={isHovered ? 1 : 0.28}
                          className="transition-all duration-300"
                        />
                      );
                    })}

                    {/* Central Dispatch Hub: Delhi NCR Beacon */}
                    <g transform="translate(320, 195)">
                      <circle cx="0" cy="0" r="32" fill="url(#hubBeacon)" opacity="0.3" className="animate-pulse" />
                      <circle cx="0" cy="0" r="18" fill="#c59b6d" fillOpacity="0.2" />
                      <circle cx="0" cy="0" r="7" fill="#c59b6d" stroke="#181715" strokeWidth="2" />
                    </g>

                    {/* 22 Interactive Regional Nodes */}
                    {INDIA_MAP_REGIONS.map((n) => {
                      const isHovered = hoveredMapRegion === n.prefix2;
                      const group = regionGroups.find((g) => g.prefix2 === n.prefix2);
                      const activeCount = group ? group.activeCount : 0;
                      const zoneCode = group ? group.zoneCode : n.zone;

                      const zoneColors: Record<string, string> = {
                        ZONE_A: "#c59b6d",
                        ZONE_B: "#38bdf8",
                        ZONE_C: "#10b981",
                        ZONE_D: "#818cf8",
                        ZONE_E: "#f43f5e",
                      };
                      const color = zoneColors[zoneCode] || "#a8a093";
                      const cardW = 124;
                      const cardH = 46;

                      return (
                        <g
                          key={n.prefix2}
                          transform={`translate(${n.x - cardW / 2}, ${n.y - cardH / 2})`}
                          className="cursor-pointer transition-all duration-200"
                          onClick={() => openRegionDetail(n.prefix2)}
                          onMouseEnter={() => setHoveredMapRegion(n.prefix2)}
                          onMouseLeave={() => setHoveredMapRegion(null)}
                        >
                          {/* Card Background */}
                          <rect
                            width={cardW}
                            height={cardH}
                            rx="10"
                            fill={isHovered ? "#24211d" : "#181715"}
                            stroke={isHovered ? color : "#38332c"}
                            strokeWidth={isHovered ? 2 : 1}
                            filter={isHovered ? "drop-shadow(0 4px 12px rgba(0,0,0,0.6))" : "none"}
                          />

                          {/* Left Accent Color Indicator */}
                          <rect
                            x="0"
                            y="0"
                            width="4"
                            height={cardH}
                            rx="2"
                            fill={color}
                          />

                          {/* Top Row: 2-Digit Postal Prefix & Zone Badge */}
                          <text x="10" y="16" fill={color} fontSize="9" fontWeight="bold" fontFamily="monospace">
                            {n.prefix2}xxxx
                          </text>
                          <text x={cardW - 8} y="16" textAnchor="end" fill={color} fontSize="8.5" fontWeight="600">
                            {zoneCode.replace("_", " ")}
                          </text>

                          {/* Middle Row: Region / City Label */}
                          <text x="10" y="29" fill="#ffffff" fontSize="10.5" fontWeight="600">
                            {n.label}
                          </text>

                          {/* Bottom Row: Active PIN Count */}
                          <text x="10" y="40" fill="#a8a093" fontSize="8.5">
                            {activeCount} verified PINs
                          </text>
                          <text x={cardW - 8} y="40" textAnchor="end" fill="#c59b6d" fontSize="8.5">
                            Drill-down →
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Shipping Zone Legend & Quick Filter */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181715] p-3 rounded-xl border border-[#38332c] text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-[#787165]">Zone Legend:</span>
                    <button
                      type="button"
                      onClick={() => setFilterZone(filterZone === "ZONE_A" ? "ALL" : "ZONE_A")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-colors ${
                        filterZone === "ZONE_A"
                          ? "bg-[#c59b6d] text-[#181715] font-semibold border-[#c59b6d]"
                          : "bg-[#24211d] border-[#38332c] text-white hover:border-[#4d473d]"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-[#c59b6d]" />
                      <span>Zone A: Delhi NCR (2–3d)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterZone(filterZone === "ZONE_B" ? "ALL" : "ZONE_B")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-colors ${
                        filterZone === "ZONE_B"
                          ? "bg-[#38bdf8] text-[#181715] font-semibold border-[#38bdf8]"
                          : "bg-[#24211d] border-[#38332c] text-white hover:border-[#4d473d]"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
                      <span>Zone B: North/Regional (3–5d)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterZone(filterZone === "ZONE_C" ? "ALL" : "ZONE_C")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-colors ${
                        filterZone === "ZONE_C"
                          ? "bg-[#10b981] text-[#181715] font-semibold border-[#10b981]"
                          : "bg-[#24211d] border-[#38332c] text-white hover:border-[#4d473d]"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                      <span>Zone C: Metros (4–6d)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterZone(filterZone === "ZONE_D" ? "ALL" : "ZONE_D")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-colors ${
                        filterZone === "ZONE_D"
                          ? "bg-[#818cf8] text-[#181715] font-semibold border-[#818cf8]"
                          : "bg-[#24211d] border-[#38332c] text-white hover:border-[#4d473d]"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-[#818cf8]" />
                      <span>Zone D: Rest of India (5–7d)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterZone(filterZone === "ZONE_E" ? "ALL" : "ZONE_E")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-colors ${
                        filterZone === "ZONE_E"
                          ? "bg-[#f43f5e] text-[#181715] font-semibold border-[#f43f5e]"
                          : "bg-[#24211d] border-[#38332c] text-white hover:border-[#4d473d]"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-[#f43f5e]" />
                      <span>Zone E: Remote (7–10d)</span>
                    </button>
                  </div>

                  {filterZone !== "ALL" && (
                    <button
                      type="button"
                      onClick={() => setFilterZone("ALL")}
                      className="text-[11px] text-[#c59b6d] hover:underline"
                    >
                      Clear Filter ✕
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: ZONES & COVERAGE DONUT */}
            {visualMode === "DONUT" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#181715] border border-[#38332c] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#38332c] pb-2">
                    <span className="text-xs font-semibold text-white">{pincodeDonutData.title}</span>
                    <div className="flex items-center gap-1 bg-[#1e1c19] p-0.5 rounded-lg border border-[#38332c]">
                      <button
                        type="button"
                        onClick={() => {
                          setPincodeDonutView("ZONE");
                          setHoveredPincodeSlice(null);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                          pincodeDonutView === "ZONE" ? "bg-[#c59b6d] text-[#181715]" : "text-[#a8a093]"
                        }`}
                      >
                        Zones
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPincodeDonutView("STATUS");
                          setHoveredPincodeSlice(null);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                          pincodeDonutView === "STATUS" ? "bg-[#c59b6d] text-[#181715]" : "text-[#a8a093]"
                        }`}
                      >
                        Status
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                    {/* SVG Donut Visual */}
                    <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                      {(() => {
                        const r = 38;
                        const c = 2 * Math.PI * r;
                        let accumulatedPct = 0;
                        return (
                          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r={r}
                              fill="transparent"
                              stroke="#2a2722"
                              strokeWidth="13"
                            />
                            {pincodeDonutData.slices.map((slice) => {
                              const strokeLength = (slice.pct / 100) * c;
                              const strokeGap = c - strokeLength;
                              const currentOffset = (accumulatedPct / 100) * c;
                              accumulatedPct += slice.pct;
                              const isHovered = hoveredPincodeSlice === slice.id;

                              return (
                                <circle
                                  key={slice.id}
                                  cx="50"
                                  cy="50"
                                  r={r}
                                  fill="transparent"
                                  stroke={slice.color}
                                  strokeWidth={isHovered ? 17 : 13}
                                  strokeDasharray={`${strokeLength} ${strokeGap}`}
                                  strokeDashoffset={-currentOffset}
                                  onMouseEnter={() => setHoveredPincodeSlice(slice.id)}
                                  onMouseLeave={() => setHoveredPincodeSlice(null)}
                                  className="transition-all duration-300 cursor-pointer"
                                  style={{
                                    opacity: hoveredPincodeSlice && !isHovered ? 0.45 : 1,
                                  }}
                                >
                                  <title>{`${slice.label}: ${slice.count} (${slice.pct}%)`}</title>
                                </circle>
                              );
                            })}
                          </svg>
                        );
                      })()}

                      {/* Donut Center Hub Info */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center px-4">
                        <span className="text-2xl font-mono font-bold text-white tracking-tight">
                          {hoveredPincodeSlice
                            ? pincodeDonutData.slices.find((s) => s.id === hoveredPincodeSlice)?.count
                            : pincodeDonutData.centerNumber}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-[#c59b6d] tracking-wider max-w-[85px] leading-tight mt-0.5 line-clamp-2">
                          {hoveredPincodeSlice
                            ? pincodeDonutData.slices.find((s) => s.id === hoveredPincodeSlice)?.label
                            : pincodeDonutData.centerLabel}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Legend List */}
                    <div className="flex-1 w-full space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {pincodeDonutData.slices.map((slice) => {
                        const isHovered = hoveredPincodeSlice === slice.id;
                        return (
                          <div
                            key={slice.id}
                            onMouseEnter={() => setHoveredPincodeSlice(slice.id)}
                            onMouseLeave={() => setHoveredPincodeSlice(null)}
                            className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                              isHovered ? "bg-[#2e2a24] text-white" : "hover:bg-[#25221d] text-[#a8a093]"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: slice.color }}
                              />
                              <span className="truncate text-[11px]">{slice.label}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                              <span className="font-semibold text-white">{slice.count}</span>
                              <span className="text-[#787165] text-[10px]">({slice.pct}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Studio Delivery Protocol Summary */}
                <div className="p-4 rounded-xl bg-[#181715] border border-[#38332c] space-y-3 flex flex-col justify-between text-xs">
                  <div>
                    <h4 className="text-xs uppercase font-bold text-[#c59b6d] tracking-wider mb-1">
                      Tavistra Studio Delivery Protocol (TAV-04)
                    </h4>
                    <p className="text-[#a8a093] text-[11px]">
                      Postal coverage operates under strict statutory rules ensuring reliable courier delivery without freight damage.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-[#24211d] border border-[#38332c]">
                      <strong className="text-white block font-medium">Strict Whitelist Policy:</strong>
                      <span className="text-[#a8a093] text-[11px]">
                        PINs not explicitly verified in this directory default to non-serviceable on the storefront.
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#24211d] border border-[#38332c]">
                      <strong className="text-white block font-medium">12-Slab Fee Engine:</strong>
                      <span className="text-[#a8a093] text-[11px]">
                        All delivery fees are tax-inclusive and bind strictly to the approved 12-slab ladder.
                      </span>
                    </div>
                  </div>
                  <div className="pt-1 text-[11px] text-[#787165] border-t border-[#38332c] flex justify-between">
                    <span>Approved Origins: Delhi Hub</span>
                    <span>Divisor: 5,000,000 mm³</span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: PROTOCOL DIRECTORY */}
            {visualMode === "PROTOCOL" && (
              <div className="p-5 rounded-xl bg-[#181715] border border-[#38332c] space-y-3 text-xs text-[#a8a093]">
                <h4 className="text-sm font-semibold text-white">Full TAV-04 Delivery Governance Architecture</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-[#24211d] border border-[#38332c] space-y-1">
                    <strong className="text-[#c59b6d] block font-semibold">1. Whitelist Hierarchy</strong>
                    <p className="text-[11px]">
                      Resolution evaluates from most specific to parent prefix: Exact 6-Digit PIN → 4-Digit District Hub → 2-Digit Region Prefix.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#24211d] border border-[#38332c] space-y-1">
                    <strong className="text-emerald-400 block font-semibold">2. Volumetric Formula</strong>
                    <p className="text-[11px]">
                      Volumetric weight (kg) = (Length × Width × Height in mm) / 5,000,000. Customer fee is calculated on max(actual, volumetric).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#24211d] border border-[#38332c] space-y-1">
                    <strong className="text-[#38bdf8] block font-semibold">3. Ex-Delhi Transit Windows</strong>
                    <p className="text-[11px]">
                      Zone A (2–3d), Zone B (3–5d), Zone C (4–6d), Zone D (5–7d), Zone E (7–10d). All shipments depart strictly from approved studio origins.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live 6-Digit Resolution Simulator */}
          <div className="p-5 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Live Nested PIN Resolution Simulator</h3>
                <p className="text-xs text-[#a8a093]">
                  Test any 6-digit Indian PIN code to trace parent prefix or exact override hierarchy, and create an override in 1 click.
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
                  className="rounded-lg border border-[#464037] bg-[#16161a] px-3 py-1.5 text-xs text-white font-mono w-36 focus:border-[#c59b6d] focus:outline-none"
                />
                <button
                  onClick={handleSimulatePin}
                  disabled={simLoading}
                  className="px-4 py-1.5 rounded-lg bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors"
                >
                  {simLoading ? "Testing..." : "Simulate"}
                </button>
              </div>
            </div>

            {/* Quick Test Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-[#787165] uppercase font-bold mr-1">Quick Presets:</span>
              {[
                { pin: "110001", label: "Delhi NCR (Zone A)" },
                { pin: "141001", label: "Punjab (Zone B)" },
                { pin: "560001", label: "Bengaluru (Zone C)" },
                { pin: "682001", label: "Kochi (Zone D)" },
                { pin: "194101", label: "Leh Ladakh (Zone E)" },
              ].map((p) => (
                <button
                  key={p.pin}
                  type="button"
                  onClick={() => {
                    setSimPin(p.pin);
                    fetch(`/api/pincodes/check?pincode=${p.pin}`)
                      .then((r) => r.ok && r.json())
                      .then((d) => d && setSimResult(d));
                  }}
                  className="px-2 py-0.5 rounded-md bg-[#181715] hover:bg-[#2e2a24] text-[10px] text-[#c59b6d] border border-[#38332c] transition-colors font-mono"
                >
                  ⚡ {p.pin} · {p.label}
                </button>
              ))}
            </div>

            {simResult && (
              <div className="p-4 rounded-xl bg-[#16161a] border border-[#38332c] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
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
                    <span className="px-2 py-0.5 rounded bg-[#2a2722] text-[#c59b6d] text-[10px] font-mono">
                      Resolution: {simResult.resolutionType}
                      {simResult.matchedRulePrefix ? ` (Matched Rule: ${simResult.matchedRulePrefix})` : ""}
                    </span>
                  </div>
                  <p className="text-[#a8a093]">
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
                        isServiceable: true,
                        unserviceableReason: "",
                      })
                    }
                    className="px-3.5 py-2 rounded-lg bg-[#c59b6d] text-[#181715] hover:bg-[#d6aa7c] text-xs font-semibold transition-colors"
                  >
                    {simResult.resolutionType === "EXACT_6_DIGIT"
                      ? `Edit PIN ${simResult.pincode}`
                      : `+ Add & Enable ${simResult.pincode}`}
                  </button>
                  {simResult.pincode?.length === 6 && (
                    <button
                      onClick={() => openRegionDetail(simResult.pincode.slice(0, 2), simResult.pincode)}
                      className="px-3 py-2 rounded-lg bg-[#2a2722] border border-[#464037] text-white hover:border-[#c59b6d] text-xs font-semibold transition-colors"
                    >
                      Open Region {simResult.pincode.slice(0, 2)} →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* LEVEL 1: MAIN REGIONS DIRECTORY (2-DIGIT PREFIXES)              */}
          {/* =============================================================== */}
          {!activeRegionGroup && (
            <div className="space-y-4">
              {/* Action Toolbar & Region Search */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openModalForPin()}
                    className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors"
                  >
                    + Add PIN or Region
                  </button>
                  <button
                    onClick={handleImportUrban884}
                    className="px-4 py-2 rounded-xl bg-[#2a2722] border border-[#464037] text-white font-semibold text-xs hover:border-[#c59b6d] transition-colors"
                  >
                    Sync {urbanCandidateCount} Urban Hub PINs to DB
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search 2-digit region, state, city, or 6-digit PIN..."
                    value={pinSearch}
                    onChange={(e) => setPinSearch(e.target.value)}
                    className="rounded-xl border border-[#464037] bg-[#24211d] px-3 py-1.5 text-xs text-white placeholder-[#787165] w-64 focus:border-[#c59b6d] focus:outline-none"
                  />
                  <select
                    value={filterZone}
                    onChange={(e) => setFilterZone(e.target.value)}
                    className="rounded-xl border border-[#464037] bg-[#24211d] px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Zones</option>
                    {zones.map((z) => (
                      <option key={z.code} value={z.code}>{z.code}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-xl border border-[#464037] bg-[#24211d] px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Regions</option>
                    <option value="ACTIVE">Active Regions</option>
                    <option value="DISABLED">Paused Regions</option>
                  </select>
                </div>
              </div>

              {/* Exact 6-Digit Quick Jump Notice when searching a 6-digit PIN on Main View */}
              {/^\d{6}$/.test(pinSearch.trim()) && (() => {
                const q = pinSearch.trim();
                const exactMatch = pincodes.find((p) => p.pincode === q);
                const p2 = q.slice(0, 2);
                const parentGroup = regionGroups.find((g) => g.prefix2 === p2);

                return (
                  <div className="p-3.5 rounded-xl bg-[#1e1c19] border border-[#c59b6d]/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {exactMatch ? (
                      <>
                        <div>
                          <span className="text-emerald-400 font-semibold">Found PIN {q}</span> in Region{" "}
                          <strong className="text-white">{p2} ({parentGroup?.regionName || exactMatch.state})</strong> —{" "}
                          <span className={exactMatch.isServiceable ? "text-emerald-300" : "text-rose-400"}>
                            {exactMatch.isServiceable ? "Serviceable" : "Disabled"}
                          </span>
                        </div>
                        <button
                          onClick={() => openRegionDetail(p2, q)}
                          className="px-3 py-1.5 rounded-lg bg-[#c59b6d] text-[#181715] font-semibold"
                        >
                          Manage {q} in Region {p2} →
                        </button>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-amber-400 font-semibold">PIN {q} is NOT in the verified system directory</span>{" "}
                          <span className="text-[#a8a093]">(Storefront treats unlisted PINs as Not Serviceable).</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              openModalForPin({
                                pincodePrefix: q,
                                cityLabel: "",
                                stateName: parentGroup?.stateName || "",
                                zoneCode: parentGroup?.zoneCode || "ZONE_D",
                                isServiceable: true,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#c59b6d] text-[#181715] font-semibold"
                          >
                            + Add &amp; Enable {q}
                          </button>
                          {parentGroup && (
                            <button
                              onClick={() => openRegionDetail(p2)}
                              className="px-3 py-1.5 rounded-lg bg-[#2a2722] text-white border border-[#464037]"
                            >
                              Open Region {p2} →
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Main Region List (2-Digit Prefixes) */}
              <div className="rounded-2xl border border-[#38332c] bg-[#24211d] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1e1c19] border-b border-[#38332c] text-[11px] uppercase tracking-wider text-[#a8a093]">
                    <tr>
                      <th className="py-3 px-4">2-Digit Prefix</th>
                      <th className="py-3 px-4">Main Region / State</th>
                      <th className="py-3 px-4">Zone</th>
                      <th className="py-3 px-4">Verified PINs in Region</th>
                      <th className="py-3 px-4">Region Policy</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#38332c]">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-[#a8a093]">Loading regional PIN directory...</td>
                      </tr>
                    ) : filteredRegions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-[#a8a093]">No matching regions found.</td>
                      </tr>
                    ) : (
                      filteredRegions.map((group) => (
                        <tr
                          key={group.prefix2}
                          onClick={() => openRegionDetail(group.prefix2)}
                          className="hover:bg-[#2a2722]/70 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#2a2722] border border-[#464037] font-mono font-bold text-[#c59b6d] text-sm">
                              {group.prefix2}xxxx
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-white font-semibold">{group.regionName}</div>
                            <div className="text-[11px] text-[#a8a093]">{group.stateName}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-[#2a2722] text-[#c59b6d] text-[11px] font-semibold">
                              {group.zoneCode}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-white font-semibold">
                                {group.activeCount} active
                              </span>
                              {group.disabledCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 text-[10px]">
                                  {group.disabledCount} disabled
                                </span>
                              )}
                              {group.subPrefixes.filter((s) => !s.isServiceable).length > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 text-[10px]">
                                  {group.subPrefixes.filter((s) => !s.isServiceable).map((s) => s.pincode).join(", ")} blocked
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {!group.isRegionActive ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                                Paused (Region Blocked)
                              </span>
                            ) : group.coverageMode === "ALLOW_ALL_IN_PREFIX" ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                                Open Prefix (All {group.prefix2}xxxx)
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                Strict 6-Digit Whitelist
                              </span>
                            )}
                          </td>
                          <td
                            className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => openRegionDetail(group.prefix2)}
                              className="px-3 py-1 rounded-lg bg-[#c59b6d] text-[#181715] font-semibold text-[11px] hover:bg-[#d6aa7c]"
                            >
                              View PINs ({group.exactPins.length}) →
                            </button>
                            <button
                              onClick={() => handleToggleRegionPause(group)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                                group.isRegionActive
                                  ? "bg-[#2a2a30] text-rose-400 hover:bg-[#34343c]"
                                  : "bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
                              }`}
                            >
                              {group.isRegionActive ? "Pause Region" : "Resume"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* LEVEL 2: SELECTED REGION DRILL-DOWN (PIN LIST FOR PREFIX XX)    */}
          {/* =============================================================== */}
          {activeRegionGroup && (
            <div className="space-y-5">
              {/* Region Header & Controls */}
              <div className="p-5 rounded-2xl bg-[#24211d] border border-[#464037] space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedRegionPrefix(null)}
                      className="px-3 py-1.5 rounded-xl bg-[#2a2722] border border-[#464037] text-xs font-semibold text-white hover:border-[#c59b6d]"
                    >
                      ← All Regions
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#2a2722] font-mono font-bold text-[#c59b6d] text-xs">
                          {activeRegionGroup.prefix2}xxxx
                        </span>
                        <h3 className="text-sm font-semibold text-white">
                          {activeRegionGroup.regionName} ({activeRegionGroup.stateName})
                        </h3>
                      </div>
                      <p className="text-[11px] text-[#a8a093] mt-0.5">
                        {activeRegionGroup.activeCount} serviceable PINs · {activeRegionGroup.disabledCount} disabled PINs
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() =>
                        openModalForPin({
                          pincodePrefix: activeRegionGroup.prefix2,
                          cityLabel: "",
                          stateName: activeRegionGroup.stateName,
                          zoneCode: activeRegionGroup.zoneCode,
                          isServiceable: true,
                        })
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c]"
                    >
                      + Add PIN to Region {activeRegionGroup.prefix2}
                    </button>
                    <button
                      onClick={() => handleToggleRegionPause(activeRegionGroup)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                        activeRegionGroup.isRegionActive
                          ? "bg-[#2a2722] border-[#464037] text-rose-400 hover:border-rose-600"
                          : "bg-emerald-950 border-emerald-700 text-emerald-300"
                      }`}
                    >
                      {activeRegionGroup.isRegionActive ? "Pause Entire Region" : "Resume Region"}
                    </button>
                  </div>
                </div>

                {/* Region Commercial Zone & Coverage Mode Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-[#38332c] text-xs">
                  <div className="flex items-center justify-between gap-3 bg-[#16161a] px-3.5 py-2.5 rounded-xl border border-[#38332c]">
                    <span className="text-[#a8a093]">Default Region Zone:</span>
                    <select
                      value={activeRegionGroup.zoneCode}
                      onChange={(e) => handleUpdateRegionPolicy(activeRegionGroup, { zoneCode: e.target.value })}
                      className="rounded-lg bg-[#2a2722] border border-[#464037] px-2.5 py-1 text-xs text-[#c59b6d] font-semibold focus:outline-none"
                    >
                      {zones.map((z) => (
                        <option key={z.code} value={z.code}>{z.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-[#16161a] px-3.5 py-2.5 rounded-xl border border-[#38332c]">
                    <span className="text-[#a8a093]">Unlisted PIN Policy:</span>
                    <select
                      value={activeRegionGroup.coverageMode}
                      onChange={(e) =>
                        handleUpdateRegionPolicy(activeRegionGroup, {
                          coverageMode: e.target.value as "STRICT_WHITELIST" | "ALLOW_ALL_IN_PREFIX",
                        })
                      }
                      className="rounded-lg bg-[#2a2722] border border-[#464037] px-2.5 py-1 text-xs text-white font-semibold focus:outline-none"
                    >
                      <option value="STRICT_WHITELIST">Strict 6-Digit Whitelist Only (Recommended)</option>
                      <option value="ALLOW_ALL_IN_PREFIX">Allow All {activeRegionGroup.prefix2}xxxx PINs</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sub-Prefix Exceptions inside this Region (3-digit / 4-digit, e.g. 194 Leh) */}
              {activeRegionGroup.subPrefixes.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#1e1c19] border border-[#38332c] space-y-2">
                  <h4 className="text-[11px] uppercase tracking-wider font-semibold text-[#c59b6d]">
                    Sub-Prefix Exceptions inside {activeRegionGroup.prefix2}xxxx (3–4 Digit Hubs)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeRegionGroup.subPrefixes.map((sp) => (
                      <div
                        key={sp.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#24211d] border border-[#464037] text-xs"
                      >
                        <span className="font-mono font-bold text-white">{sp.pincode}*</span>
                        <span className="text-[#a8a093]">{sp.city}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            sp.isServiceable ? "bg-emerald-950 text-emerald-300" : "bg-rose-950 text-rose-300"
                          }`}
                        >
                          {sp.isServiceable ? "Active" : "Blocked"}
                        </span>
                        <button
                          onClick={() => handleTogglePin(sp)}
                          className="text-[11px] text-[#c59b6d] hover:underline ml-1"
                        >
                          {sp.isServiceable ? "Block" : "Unblock"}
                        </button>
                        <button
                          onClick={() => handleDeleteRule(sp)}
                          className="text-[11px] text-[#a8a093] hover:text-rose-400"
                          title="Delete sub-prefix rule"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scoped Search & Status Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder={`Search 6-digit PIN or locality in ${activeRegionGroup.prefix2}xxxx...`}
                  value={regionChildSearch}
                  onChange={(e) => setRegionChildSearch(e.target.value)}
                  className="rounded-xl border border-[#464037] bg-[#24211d] px-3.5 py-2 text-xs text-white placeholder-[#787165] w-full sm:w-80 focus:border-[#c59b6d] focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={regionChildStatus}
                    onChange={(e) => setRegionChildStatus(e.target.value)}
                    className="rounded-xl border border-[#464037] bg-[#24211d] px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Status ({activeRegionGroup.exactPins.length})</option>
                    <option value="ACTIVE">Serviceable ({activeRegionGroup.activeCount})</option>
                    <option value="DISABLED">Disabled ({activeRegionGroup.disabledCount})</option>
                  </select>
                </div>
              </div>

              {/* Scoped 6-Digit PIN Table */}
              <div className="rounded-2xl border border-[#38332c] bg-[#24211d] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1e1c19] border-b border-[#38332c] text-[11px] uppercase tracking-wider text-[#a8a093]">
                    <tr>
                      <th className="py-3 px-4">6-Digit PIN</th>
                      <th className="py-3 px-4">City / Locality</th>
                      <th className="py-3 px-4">Zone</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#38332c]">
                    {pagedRegionPins.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center space-y-3">
                          <div className="text-[#a8a093]">
                            No 6-digit PINs match{" "}
                            {regionChildSearch ? `"${regionChildSearch}"` : `Region ${activeRegionGroup.prefix2}`}.
                          </div>
                          {/^\d{6}$/.test(regionChildSearch.trim()) && (
                            <button
                              onClick={() =>
                                openModalForPin({
                                  pincodePrefix: regionChildSearch.trim(),
                                  cityLabel: "",
                                  stateName: activeRegionGroup.stateName,
                                  zoneCode: activeRegionGroup.zoneCode,
                                  isServiceable: true,
                                })
                              }
                              className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c]"
                            >
                              + Add &amp; Enable PIN {regionChildSearch.trim()} in Region {activeRegionGroup.prefix2}
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      pagedRegionPins.map((pin) => (
                        <tr key={pin.id} className="hover:bg-[#2a2722]/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-white text-sm">{pin.pincode}</td>
                          <td className="py-3 px-4 text-white">
                            <div>{pin.city}</div>
                            {pin.locality && <div className="text-[10px] text-[#a8a093]">{pin.locality}</div>}
                            {!pin.isServiceable && pin.unserviceableReason && (
                              <div className="text-[10px] text-rose-400 truncate max-w-xs">{pin.unserviceableReason}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={pin.zoneCode}
                              onChange={(e) => handleChangePinZone(pin, e.target.value)}
                              className="rounded-lg bg-[#2a2722] border border-[#464037] px-2 py-1 text-[11px] text-[#c59b6d] font-semibold focus:outline-none"
                            >
                              {zones.map((z) => (
                                <option key={z.code} value={z.code}>{z.code}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-[#2a2722] text-[#a8a093] text-[10px] font-mono">
                              {pin.source || "URBAN_884"}
                            </span>
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
                              {pin.isServiceable ? "Disable" : "Enable"}
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
                              className="px-2.5 py-1 rounded-lg bg-[#2a2722] text-white text-[11px] hover:bg-[#32323a]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRule(pin)}
                              className="px-2 py-1 rounded-lg bg-[#2a2722] text-[#a8a093] hover:text-rose-400 text-[11px]"
                              title="Remove PIN from directory"
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
                  <div className="flex items-center justify-between px-4 py-3 bg-[#1e1c19] border-t border-[#38332c] text-xs text-[#a8a093]">
                    <span>
                      Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRegionExactPins.length)} of {filteredRegionExactPins.length} PINs in Region {activeRegionGroup.prefix2}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1 rounded bg-[#2a2722] text-white disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <span className="font-mono text-white">
                        {page} / {totalPages}
                      </span>
                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="px-3 py-1 rounded bg-[#2a2722] text-white disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* SUB-TAB 2: 12-SLAB LADDER, ZONES & WEIGHT MATRIX                  */}
      {/* ================================================================= */}
      {subTab === "SLABS_ZONES" && (
        <div className="space-y-6">
          {/* Card 1: 12 Approved Slabs Editor */}
          <div className="p-6 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#38332c] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Approved 12 Delivery Fee Slabs (DB-Backed)</h3>
                <p className="text-xs text-[#a8a093]">
                  Tax-inclusive customer-payable fee ladder (INR). All rate matrix cells and product overrides select exclusively from these 12 slabs.
                </p>
              </div>
              <button
                onClick={handleSaveSlabs}
                className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors shrink-0"
              >
                Save 12-Slab Ladder
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2.5">
              {editingSlabs.map((val, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-[10px] text-[#a8a093] font-mono block">Slab {idx + 1}</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-xs text-[#787165]">₹</span>
                    <input
                      type="number"
                      min={0}
                      value={val}
                      onChange={(e) => {
                        const next = [...editingSlabs];
                        next[idx] = e.target.value;
                        setEditingSlabs(next);
                      }}
                      className="w-full rounded-lg border border-[#464037] bg-[#16161a] pl-5 pr-2 py-1.5 text-xs font-mono text-white focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Weight/Volumetric Tier x Distance Zone Matrix */}
          <div className="p-6 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Weight &amp; Volumetric Bracket × Distance Zone Matrix</h3>
              <p className="text-xs text-[#a8a093]">
                Adjusting any cell updates delivery pricing across all matching products in `.md` files immediately—no need to edit individual product files.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#38332c]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1e1c19] border-b border-[#38332c] text-[11px] uppercase tracking-wider text-[#a8a093]">
                  <tr>
                    <th className="py-3 px-4">Weight Bracket &amp; Carrier</th>
                    {zones.map((z) => (
                      <th key={z.code} className="py-3 px-3 text-center">
                        <div className="text-white">{z.code}</div>
                        <div className="text-[10px] font-normal normal-case text-[#a8a093]">
                          {z.estimatedDaysMin}–{z.estimatedDaysMax} days
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#38332c]">
                  {matrixTiers.map((tier) => (
                    <tr key={tier.tierCode} className="hover:bg-[#2a2722]/40">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{tier.tierLabel}</div>
                        <div className="text-[10px] text-[#a8a093]">{tier.carrierName}</div>
                      </td>
                      {zones.map((z) => (
                        <td key={z.code} className="py-3 px-2 text-center">
                          <select
                            value={tier.byZone[z.code] ?? 500}
                            onChange={(e) => handleUpdateMatrixCell(tier.tierCode, z.code, Number(e.target.value))}
                            className="rounded-lg bg-[#16161a] border border-[#464037] px-2.5 py-1.5 text-xs font-mono text-[#c59b6d] font-semibold focus:border-[#c59b6d] focus:outline-none"
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
          <div className="p-6 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">5 Commercial Distance Zones (Ex-Delhi NCR Hub)</h3>
              <p className="text-xs text-[#a8a093]">Configure zone descriptions and estimated transit days shown to customers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((z) => (
                <div key={z.code} className="p-4 rounded-xl bg-[#16161a] border border-[#38332c] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#c59b6d]">{z.code}</span>
                    <button
                      onClick={() => setEditingZone(z)}
                      className="text-[11px] text-white bg-[#2a2722] px-2.5 py-1 rounded-lg hover:bg-[#32323a]"
                    >
                      Edit Zone
                    </button>
                  </div>
                  <div className="font-semibold text-white">{z.name}</div>
                  <p className="text-[11px] text-[#a8a093]">{z.description}</p>
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
          <div className="p-5 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Authoritative Delivery Fee Previewer</h3>
                <p className="text-xs text-[#a8a093]">
                  Test what a customer sees for any product + PIN combination under live DB slabs &amp; overrides.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={calcProductId}
                  onChange={(e) => setCalcProductId(e.target.value)}
                  className="rounded-lg border border-[#464037] bg-[#16161a] px-3 py-1.5 text-xs text-white focus:outline-none"
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
                  className="rounded-lg border border-[#464037] bg-[#16161a] px-3 py-1.5 text-xs font-mono text-white w-28"
                />
                <button
                  onClick={handleCalculatePreview}
                  className="px-4 py-1.5 rounded-lg bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c]"
                >
                  Calculate
                </button>
              </div>
            </div>

            {calcResult && (
              <div className="p-4 rounded-xl bg-[#16161a] border border-[#38332c] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-[#a8a093] block">Destination</span>
                  <span className="font-semibold text-white">
                    {calcResult.pincodeResult.city}, {calcResult.pincodeResult.state}
                  </span>
                  <span className="text-[10px] text-[#c59b6d] block">{calcResult.pincodeResult.zoneCode}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#a8a093] block">Billable Weight</span>
                  <span className="font-semibold text-white font-mono">
                    {calcResult.billableWeightKg} kg
                  </span>
                  <span className="text-[10px] text-[#a8a093] block">
                    (Actual: {calcResult.actualWeightKg} kg / Vol: {calcResult.volumetricWeightKg} kg)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#a8a093] block">Rule Source</span>
                  <span className="font-semibold text-amber-300">{calcResult.ruleSource}</span>
                  <span className="text-[10px] text-[#a8a093] block">{calcResult.carrierName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#a8a093] block">Customer Fee (Tax Incl.)</span>
                  <span className="font-bold text-lg text-emerald-400 font-mono">
                    ₹{calcResult.totalDeliveryFeeRupees.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Product-by-Zone Override Table */}
          <div className="rounded-2xl border border-[#38332c] bg-[#24211d] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1e1c19] border-b border-[#38332c] text-[11px] uppercase tracking-wider text-[#a8a093]">
                <tr>
                  <th className="py-3 px-4">Product (from .md)</th>
                  <th className="py-3 px-3">Specs</th>
                  {zones.map((z) => (
                    <th key={z.code} className="py-3 px-3 text-center">{z.code}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#38332c]">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#2a2722]/40">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{prod.title}</div>
                      <div className="text-[10px] font-mono text-[#a8a093]">{prod.sku}</div>
                    </td>
                    <td className="py-3.5 px-3 text-[11px] font-mono text-[#a8a093]">
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
                                : "bg-[#16161a] border-[#464037] text-[#a8a093]"
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
            className="w-full max-w-md rounded-2xl bg-[#24211d] border border-[#464037] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
              <h3 className="text-sm font-semibold text-white">Configure PIN or Prefix Rule</h3>
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="text-xs text-[#a8a093] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#a8a093] block mb-1">
                  PIN Code or Region Prefix (2, 3, 4, or 6 digits)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={ruleForm.pincodePrefix}
                  onChange={(e) => setRuleForm((p) => ({ ...p, pincodePrefix: e.target.value.replace(/\D/g, "") }))}
                  placeholder="e.g. 11 (Delhi), 110 (Core), or 110043 (Exact)"
                  className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white font-mono focus:border-[#c59b6d] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#a8a093] block mb-1">City / Hub Label</label>
                  <input
                    type="text"
                    required
                    value={ruleForm.cityLabel}
                    onChange={(e) => setRuleForm((p) => ({ ...p, cityLabel: e.target.value }))}
                    placeholder="e.g. South Delhi"
                    className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white focus:border-[#c59b6d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#a8a093] block mb-1">State / UT</label>
                  <input
                    type="text"
                    required
                    value={ruleForm.stateName}
                    onChange={(e) => setRuleForm((p) => ({ ...p, stateName: e.target.value }))}
                    placeholder="e.g. Delhi"
                    className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white focus:border-[#c59b6d] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#a8a093] block mb-1">Assigned Commercial Zone</label>
                <select
                  value={ruleForm.zoneCode}
                  onChange={(e) => setRuleForm((p) => ({ ...p, zoneCode: e.target.value }))}
                  className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white focus:border-[#c59b6d] focus:outline-none"
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
                  <label className="text-[#a8a093] block mb-1">Custom Notice to Customer</label>
                  <input
                    type="text"
                    value={ruleForm.unserviceableReason}
                    onChange={(e) => setRuleForm((p) => ({ ...p, unserviceableReason: e.target.value }))}
                    placeholder="e.g. Fragile pallet route temporarily paused."
                    className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white focus:border-[#c59b6d] focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#38332c]">
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="px-4 py-2 rounded-xl bg-[#2a2722] text-xs text-white hover:bg-[#32323a]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c]"
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
            className="w-full max-w-md rounded-2xl bg-[#24211d] border border-[#464037] p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
              <h3 className="text-sm font-semibold text-white">Edit Shipping Zone: {editingZone.code}</h3>
              <button type="button" onClick={() => setEditingZone(null)} className="text-[#a8a093]">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[#a8a093] block mb-1">Zone Display Name</label>
                <input
                  type="text"
                  required
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-[#a8a093] block mb-1">Coverage Description</label>
                <textarea
                  rows={2}
                  required
                  value={editingZone.description}
                  onChange={(e) => setEditingZone({ ...editingZone, description: e.target.value })}
                  className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#a8a093] block mb-1">Min Transit Days</label>
                  <input
                    type="number"
                    min={1}
                    value={editingZone.estimatedDaysMin}
                    onChange={(e) => setEditingZone({ ...editingZone, estimatedDaysMin: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#a8a093] block mb-1">Max Transit Days</label>
                  <input
                    type="number"
                    min={1}
                    value={editingZone.estimatedDaysMax}
                    onChange={(e) => setEditingZone({ ...editingZone, estimatedDaysMax: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#38332c]">
              <button type="button" onClick={() => setEditingZone(null)} className="px-4 py-2 rounded-xl bg-[#2a2722] text-white">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold">
                Save Zone
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

