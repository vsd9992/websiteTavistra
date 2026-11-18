import { useState, useMemo, useEffect } from "react";
import {
  INITIAL_ORDERS,
  INITIAL_BULK_INQUIRIES,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_CUSTOMERS,
  INITIAL_CATALOGUE,
  INITIAL_PINCODES,
  STAFF_USERS,
  INITIAL_AUDIT_LOGS,
  AdminOrder,
  BulkInquiry,
  SupportTicket,
  CustomerProfile,
  CatalogueItem,
  PincodeEntry,
  StaffUser,
  AuditEntry,
} from "./data";
import { LogisticsTab } from "./components/LogisticsTab";
import { parseInquiryLineItems } from "@tavistra/shared";
import { isTabPermitted, isActionPermitted, ROLE_TAB_PERMISSIONS, type AdminTabId } from "./rbac";

export interface ProposalLineItemInput {
  name: string;
  finish: string;
  quantity: number;
  unitPriceRupees: number;
}

export interface AdminProposal {
  id: string;
  quoteNumber: string;
  inquiryId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryPincode: string;
  projectSpecifications: string;
  status: "DRAFT" | "ISSUED" | "ACCEPTED" | "EXPIRED" | "SUPERSEDED";
  expiresAt: string;
  acceptedAt: string | null;
  linkedOrderId: string | null;
  linkedOrderNumber?: string | null;
  linkedOrderStatus?: string | null;
  versions: {
    id: string;
    versionNumber: number;
    specifications: string;
    lineItemsJson?: string | null;
    deliveryCharge?: number | string;
    quotedAmount: number;
    advanceRequired: number;
    estimatedLeadDays: number;
    validUntil?: string;
  }[];
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const raw = await res.text();
  let parsed: unknown = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} (${url}): ${raw.slice(0, 140)}`);
      }
      throw new Error(`Invalid JSON response from ${url}`);
    }
  }
  if (!res.ok) {
    const errObj = (parsed && typeof parsed === "object" ? parsed : {}) as {
      error?: string;
      message?: string;
    };
    throw new Error(errObj.message || errObj.error || `HTTP ${res.status} from ${url}`);
  }
  if (parsed === null) {
    throw new Error(`Empty response body from ${url} (HTTP ${res.status})`);
  }
  return parsed as T;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AdminTabId>("OVERVIEW");

  // State
  const [backendStatus, setBackendStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [backendError, setBackendError] = useState<string | null>(null);
  const [currentStaff, setCurrentStaff] = useState<StaffUser>(STAFF_USERS[0]);
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [inquiries, setInquiries] = useState<BulkInquiry[]>(INITIAL_BULK_INQUIRIES);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [catalogue, setCatalogue] = useState<CatalogueItem[]>(INITIAL_CATALOGUE);
  const [pincodes, setPincodes] = useState<PincodeEntry[]>(INITIAL_PINCODES);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(INITIAL_AUDIT_LOGS);
  const [proposals, setProposals] = useState<AdminProposal[]>([]);

  // Proposal modal state
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalForm, setProposalForm] = useState<{
    inquiryId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryPincode: string;
    lineItems: ProposalLineItemInput[];
    deliveryChargeRupees: number;
    estimatedLeadWeeks: number;
    notes: string;
  }>({
    inquiryId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryPincode: "110001",
    lineItems: [
      { name: "Bespoke Walnut Credenza with aged brass trim", finish: "Hand-rubbed oil & antiqued brass", quantity: 1, unitPriceRupees: 65000 },
    ],
    deliveryChargeRupees: 3500,
    estimatedLeadWeeks: 4,
    notes: "Architectural private residence consignment. All joinery mortise-and-tenon.",
  });
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // Proposal Revision modal state (QOT-05)
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionQuote, setRevisionQuote] = useState<AdminProposal | null>(null);
  const [revisionForm, setRevisionForm] = useState<{
    lineItems: ProposalLineItemInput[];
    deliveryChargeRupees: number;
    estimatedLeadWeeks: number;
    notes: string;
  }>({
    lineItems: [],
    deliveryChargeRupees: 0,
    estimatedLeadWeeks: 4,
    notes: "",
  });
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

  // Markdown Product Importer State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [markdownInput, setMarkdownInput] = useState("");
  const [selectedMdFile, setSelectedMdFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // System Settings State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [studioHiatus, setStudioHiatus] = useState(false);
  const [announcementBanner, setAnnouncementBanner] = useState(
    "Studio craftsmanship running normally. All editions dispatched on schedule."
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Invoice Seller Legal Entity Configuration State
  const [sellerDetails, setSellerDetails] = useState({
    legalEntityName: "VDesign",
    brandName: "Tavistra",
    businessUnitLine: "A business unit of VDesign",
    tagline: "Design-led lifestyle & architectural décor",
    registeredAddressLine1: "New Delhi Design Studio, Okhla Industrial Area Phase III",
    city: "New Delhi",
    state: "Delhi",
    stateCode: "07",
    pincode: "110045",
    country: "India",
    gstin: "07AAAFV1234A1Z5",
    pan: "AAAFV1234A",
    supportEmail: "support@tavistra.com",
    deskHours: "Mon – Fri, 10:00 AM – 5:00 PM IST",
  });
  const [isSavingSellerDetails, setIsSavingSellerDetails] = useState(false);
  const [sellerDetailsSaveSuccess, setSellerDetailsSaveSuccess] = useState(false);

  // Search & Filters
  const [orderSearch, setOrderSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<"ALL" | "READY_STOCK" | "MADE_TO_ORDER">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [refundUtrInput, setRefundUtrInput] = useState("");
  const [isUpdatingRefund, setIsUpdatingRefund] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedLinkOrderId, setCopiedLinkOrderId] = useState<string | null>(null);

  // Studio Overview state & filters
  const [overviewDomainFilter, setOverviewDomainFilter] = useState<"ALL" | "URGENT" | "COMMERCIAL" | "WORKSHOP" | "OPERATIONS" | "AUDIT">("ALL");
  const [urgentCategoryFilter, setUrgentCategoryFilter] = useState<string>("ALL");
  const [commercialLedgerFilter, setCommercialLedgerFilter] = useState<"ALL" | "SETTLED" | "STAGED" | "REFUND_PENDING" | "REFUND_ISSUED">("ALL");
  const [overviewAuditCategory, setOverviewAuditCategory] = useState<string>("ALL");
  const [overviewAuditSearch, setOverviewAuditSearch] = useState<string>("");
  const [syncCountdown, setSyncCountdown] = useState<number>(60);

  // Ticket detail view & filters
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>("ALL");
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<string>("ALL");
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>("ALL");
  const [ticketSearchQuery, setTicketSearchQuery] = useState<string>("");

  // Customer inspector
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  // Product Review Modal
  const [reviewedProduct, setReviewedProduct] = useState<CatalogueItem | null>(null);

  // QC Photos Review Modal
  const [qcOrderModal, setQcOrderModal] = useState<AdminOrder | null>(null);
  const [qcNotesInput, setQcNotesInput] = useState("");
  const [qcImageInput, setQcImageInput] = useState("");
  const [isUploadingQc, setIsUploadingQc] = useState(false);
  const [qcUploadError, setQcUploadError] = useState<string | null>(null);

  // AWB Edit State
  const [editingAwbId, setEditingAwbId] = useState<string | null>(null);
  const [carrierInput, setCarrierInput] = useState("");
  const [awbInput, setAwbInput] = useState("");

  // Helper to record audit log
  const logAuditAction = (action: string, entityType: string, entityId: string, details: string) => {
    const newEntry: AuditEntry = {
      id: `aud_${Date.now()}`,
      staffName: currentStaff.name,
      action,
      entityType,
      entityId,
      timestamp: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " IST",
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Synchronize with PostgreSQL Backend via Next.js API
  const syncBackendData = async () => {
    setBackendStatus("connecting");
    setBackendError(null);

    const results = await Promise.allSettled([
      fetchJson<{ orders?: AdminOrder[] }>("/api/orders").then((d) => {
        if (Array.isArray(d.orders)) setOrders(d.orders);
      }),
      fetchJson<{ inquiries?: BulkInquiry[] }>("/api/inquiries").then((d) => {
        if (Array.isArray(d.inquiries)) setInquiries(d.inquiries);
      }),
      fetchJson<{ tickets?: SupportTicket[] }>("/api/tickets").then((d) => {
        if (Array.isArray(d.tickets)) setTickets(d.tickets);
      }),
      fetchJson<{ customers?: CustomerProfile[] }>("/api/admin/customers").then((d) => {
        if (Array.isArray(d.customers)) setCustomers(d.customers);
      }),
      fetchJson<{ catalogue?: CatalogueItem[] }>("/api/admin/catalogue").then((d) => {
        if (Array.isArray(d.catalogue)) setCatalogue(d.catalogue);
      }),
      fetchJson<{ pincodes?: PincodeEntry[] }>("/api/admin/pincodes").then((d) => {
        if (Array.isArray(d.pincodes)) setPincodes(d.pincodes);
      }),
      fetchJson<{
        maintenanceMode?: boolean;
        studioHiatus?: boolean;
        announcementBanner?: string;
        settings?: Record<string, string>;
      }>("/api/admin/settings").then((d) => {
        if (typeof d.maintenanceMode === "boolean") setMaintenanceMode(d.maintenanceMode);
        if (typeof d.studioHiatus === "boolean") setStudioHiatus(d.studioHiatus);
        if (d.announcementBanner) setAnnouncementBanner(d.announcementBanner);
        if (d.settings?.["INVOICE_SELLER_DETAILS"]) {
          try {
            const parsed = JSON.parse(d.settings["INVOICE_SELLER_DETAILS"]);
            setSellerDetails((prev) => ({ ...prev, ...parsed }));
          } catch {}
        }
      }),
      fetchJson<{ proposals?: AdminProposal[] }>("/api/quotes").then((d) => {
        if (Array.isArray(d.proposals)) setProposals(d.proposals);
      }),
    ]);

    const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
    if (failures.length > 0) {
      setBackendStatus("error");
      setBackendError(
        `${failures.length} backend sync request(s) failed: ${(failures[0].reason as Error)?.message || "Unknown API error"}`
      );
    } else {
      setBackendStatus("connected");
    }
  };

  useEffect(() => {
    if (selectedOrder) {
      setRefundUtrInput(selectedOrder.refund?.reference || "");
    }
  }, [selectedOrder]);

  const handleManualSync = () => {
    setSyncCountdown(60);
    void syncBackendData();
  };

  useEffect(() => {
    void syncBackendData();
    const interval = setInterval(() => {
      setSyncCountdown((prev) => {
        if (prev <= 1) {
          void syncBackendData();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const grossRevenue = orders.reduce((acc, o) => acc + o.amountPaidRupees, 0);
    const cancelledOrders = orders.filter((o) => o.status === "CANCELLED" || o.status === "REFUNDED");
    const totalRefunded = cancelledOrders.reduce(
      (acc, o) => acc + (o.refund?.amountRupees ?? o.amountPaidRupees),
      0
    );
    const netRevenue = Math.max(0, grossRevenue - totalRefunded);
    const mtoGraceCount = orders.filter(
      (o) => o.status === "GRACE_PERIOD_ACTIVE" || o.status === "CONFIRMED"
    ).length;
    const inProductionCount = orders.filter(
      (o) => o.status === "WORKSHOP_CRAFTING" || o.status === "IN_PRODUCTION"
    ).length;
    const openTicketsCount = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
    const newInquiriesCount = inquiries.filter((i) => i.status === "NEW").length;
    const serviceablePinsCount = pincodes.filter((p) => p.isServiceable).length;

    const activeGraceOrders = orders.filter(
      (o) => o.mode === "MADE_TO_ORDER" && o.isGraceActive && o.graceDaysRemaining !== undefined
    );
    const minGraceDays =
      activeGraceOrders.length > 0
        ? Math.min(...activeGraceOrders.map((o) => o.graceDaysRemaining ?? 0))
        : null;

    return {
      totalRevenue: netRevenue,
      grossRevenue,
      totalRefunded,
      netRevenue,
      cancelledOrdersCount: cancelledOrders.length,
      mtoGraceCount,
      inProductionCount,
      openTicketsCount,
      newInquiriesCount,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      serviceablePinsCount,
      minGraceDays,
    };
  }, [orders, tickets, inquiries, customers, pincodes]);

  // Authority Flags for Overview & Telemetry
  const canViewFinancials =
    isTabPermitted(currentStaff.role, "ORDERS") &&
    (currentStaff.role === "SUPER_ADMIN" || currentStaff.role === "COMMERCE_ADMIN");
  const canViewWorkshop = isTabPermitted(currentStaff.role, "PRODUCTION");
  const canViewTickets = isTabPermitted(currentStaff.role, "TICKETS");
  const canViewProposals = isTabPermitted(currentStaff.role, "PROPOSALS");
  const canViewDispatch = isTabPermitted(currentStaff.role, "DISPATCH");
  const canViewAudit = isTabPermitted(currentStaff.role, "AUDIT");
  const canCreateQuote = isActionPermitted(currentStaff.role, "PROPOSAL_CREATE_REVISE");

  // Commercial & Sales Financial Segregation Telemetry
  const commercialFinancials = useMemo(() => {
    const settledOrders = orders.filter(
      (o) =>
        o.status !== "CANCELLED" &&
        o.status !== "REFUNDED" &&
        (o.balanceDueRupees === 0 || o.isFullyPaid || o.amountPaidRupees >= o.totalAmountRupees)
    );
    const stagedOrders = orders.filter(
      (o) =>
        o.status !== "CANCELLED" &&
        o.status !== "REFUNDED" &&
        o.balanceDueRupees > 0 &&
        o.amountPaidRupees > 0
    );
    const refundPendingOrders = orders.filter(
      (o) =>
        o.status === "CANCELLED" &&
        (!o.refund || (o.refund.status !== "COMPLETED" && o.refund.status !== "PROCESSED"))
    );
    const refundIssuedOrders = orders.filter(
      (o) =>
        (o.status === "CANCELLED" || o.status === "REFUNDED") &&
        o.refund &&
        (o.refund.status === "COMPLETED" || o.refund.status === "PROCESSED" || o.status === "REFUNDED")
    );

    const settledRevenue = settledOrders.reduce((sum, o) => sum + o.amountPaidRupees, 0);
    const advanceCollected = stagedOrders.reduce((sum, o) => sum + o.amountPaidRupees, 0);
    const balancePending = stagedOrders.reduce((sum, o) => sum + o.balanceDueRupees, 0);
    const refundPendingTotal = refundPendingOrders.reduce(
      (sum, o) => sum + (o.refund?.amountRupees ?? o.amountPaidRupees),
      0
    );
    const refundIssuedTotal = refundIssuedOrders.reduce(
      (sum, o) => sum + (o.refund?.amountRupees ?? o.amountPaidRupees),
      0
    );

    const totalCommitted = settledRevenue + advanceCollected + balancePending;

    return {
      settledOrders,
      stagedOrders,
      refundPendingOrders,
      refundIssuedOrders,
      settledRevenue,
      advanceCollected,
      balancePending,
      refundPendingTotal,
      refundIssuedTotal,
      totalCommitted,
    };
  }, [orders]);

  // Urgent Cases / Action Required Telemetry (Honoring User Authority)
  interface UrgentCase {
    id: string;
    category: "GRACE_RELEASE" | "BALANCE_DUE" | "URGENT_TICKET" | "PENDING_QUOTE" | "AWAITING_DISPATCH";
    categoryLabel: string;
    title: string;
    description: string;
    badge: string;
    badgeColor: "amber" | "rose" | "emerald" | "bronze";
    timestamp?: string;
    actionLabel: string;
    onAction: () => void;
  }

  const allUrgentCases = useMemo<UrgentCase[]>(() => {
    const list: UrgentCase[] = [];

    // 1. MTO Grace Ending Soon (only if role has PRODUCTION tab permission)
    if (canViewWorkshop) {
      orders
        .filter(
          (o) =>
            o.mode === "MADE_TO_ORDER" &&
            o.isGraceActive &&
            o.graceDaysRemaining !== undefined &&
            o.graceDaysRemaining <= 2
        )
        .forEach((o) => {
          list.push({
            id: `grace-${o.id}`,
            category: "GRACE_RELEASE",
            categoryLabel: "MTO Grace",
            title: `MTO Hold: ${o.orderNumber}`,
            description: `${o.customerName} · ${
              o.graceDaysRemaining === 0
                ? "7-day hold complete, ready for workshop machining release"
                : `${o.graceDaysRemaining} day(s) left in client grace period`
            }`,
            badge: o.graceDaysRemaining === 0 ? "Release Ready" : `${o.graceDaysRemaining}d Left`,
            badgeColor: "amber",
            timestamp: o.placedAt,
            actionLabel: "Inspect Grace Queue →",
            onAction: () => setActiveTab("PRODUCTION"),
          });
        });
    }

    // 2. 75% Balance Collection Pending (only if role can view financial/commercial orders)
    if (canViewFinancials) {
      orders
        .filter(
          (o) =>
            (o.status === "PRODUCTION_COMPLETED" || o.status === "QC_INSPECTION") &&
            (o.balanceDueRupees > 0 || !o.isFullyPaid)
        )
        .forEach((o) => {
          list.push({
            id: `bal-${o.id}`,
            category: "BALANCE_DUE",
            categoryLabel: "Payment Due",
            title: `Balance Due: ${o.orderNumber}`,
            description: `${o.customerName} · Final 75% balance of ${formatPrice(
              o.balanceDueRupees
            )} required before dispatch AWB`,
            badge: formatPrice(o.balanceDueRupees),
            badgeColor: "amber",
            timestamp: o.placedAt,
            actionLabel: "Open Order Details →",
            onAction: () => setSelectedOrder(o),
          });
        });
    }

    // 3. High-Priority or Alteration Support Tickets (only if role has TICKETS permission)
    if (canViewTickets) {
      tickets
        .filter(
          (t) =>
            t.status !== "RESOLVED" &&
            (t.priority === "URGENT" ||
              t.priority === "HIGH" ||
              t.category === "SPEC_ALTERATION" ||
              t.category === "DAMAGE_REPORT" ||
              t.category === "CANCELLATION")
        )
        .forEach((t) => {
          list.push({
            id: `tkt-${t.id}`,
            category: "URGENT_TICKET",
            categoryLabel: "Support",
            title: `Priority Ticket: ${t.ticketNumber}`,
            description: `${t.customerName} · ${t.subject} (${t.category.replace(/_/g, " ")})`,
            badge: t.priority,
            badgeColor: t.priority === "URGENT" ? "rose" : "amber",
            timestamp: t.createdAt,
            actionLabel: "Open Ticket Thread →",
            onAction: () => {
              setSelectedTicket(t);
              setActiveTab("TICKETS");
            },
          });
        });
    }

    // 4. Inbound Bespoke Inquiries & Draft Proposals (only if role has PROPOSALS permission & quote authority)
    if (canViewProposals && canCreateQuote) {
      inquiries
        .filter((i) => i.status === "NEW" || i.status === "IN_REVIEW")
        .forEach((i) => {
          list.push({
            id: `inq-${i.id}`,
            category: "PENDING_QUOTE",
            categoryLabel: "Quote RFQ",
            title: `Bespoke Inquiry: ${i.clientName}`,
            description: `${i.practiceOrStudio || "Private Client"} · Requested: ${
              i.requestedEditions || `${i.quantityUnits} units`
            } (${i.destinationCity})`,
            badge: i.status === "NEW" ? "New RFQ" : "In Review",
            badgeColor: "bronze",
            timestamp: i.submittedAt,
            actionLabel: "Formulate Quote →",
            onAction: () => setActiveTab("PROPOSALS"),
          });
        });

      proposals
        .filter((p) => p.status === "DRAFT")
        .forEach((p) => {
          list.push({
            id: `prop-${p.id}`,
            category: "PENDING_QUOTE",
            categoryLabel: "Proposal",
            title: `Draft Proposal: ${p.quoteNumber}`,
            description: `${p.customerName} · Pending review & official issuance`,
            badge: "Draft",
            badgeColor: "bronze",
            timestamp: p.expiresAt,
            actionLabel: "Review & Issue →",
            onAction: () => setActiveTab("PROPOSALS"),
          });
        });
    }

    // 5. Ready for Dispatch (Packaged & awaiting courier booking, only if DISPATCH permitted)
    if (canViewDispatch) {
      orders
        .filter((o) => o.status === "AWAITING_DISPATCH" && !o.awbNumber)
        .forEach((o) => {
          list.push({
            id: `dsp-${o.id}`,
            category: "AWAITING_DISPATCH",
            categoryLabel: "Fulfilment",
            title: `Ready for AWB: ${o.orderNumber}`,
            description: `${o.customerName} · ${o.city}, ${o.state} · Paid & QC approved, awaiting consignment booking`,
            badge: "Ready to Ship",
            badgeColor: "emerald",
            timestamp: o.placedAt,
            actionLabel: "Assign Carrier & AWB →",
            onAction: () => setActiveTab("DISPATCH"),
          });
        });
    }

    return list;
  }, [orders, tickets, inquiries, proposals, canViewWorkshop, canViewFinancials, canViewTickets, canViewProposals, canViewDispatch, canCreateQuote]);

  const filteredUrgentCases = useMemo(() => {
    if (urgentCategoryFilter === "ALL") return allUrgentCases;
    return allUrgentCases.filter((c) => c.category === urgentCategoryFilter);
  }, [allUrgentCases, urgentCategoryFilter]);

  // Overview Audit Log Category Filtering
  const filteredOverviewAuditLogs = useMemo(() => {
    let list = auditLogs;
    if (overviewAuditCategory !== "ALL") {
      list = list.filter((log) => {
        const cat = overviewAuditCategory;
        const eType = (log.entityType || "").toLowerCase();
        const act = (log.action || "").toUpperCase();
        if (cat === "ORDERS") return eType.includes("order") || act.includes("ORDER") || act.includes("REFUND") || act.includes("PRODUCTION");
        if (cat === "LOGISTICS") return act.includes("AWB") || act.includes("CARRIER") || act.includes("DISPATCH");
        if (cat === "SUPPORT") return eType.includes("ticket") || act.includes("TICKET");
        if (cat === "PROPOSALS") return eType.includes("proposal") || act.includes("PROPOSAL") || act.includes("QUOTE");
        if (cat === "SYSTEM") return eType.includes("setting") || act.includes("SETTING") || act.includes("SYSTEM") || eType.includes("system");
        return true;
      });
    }
    const q = overviewAuditSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (log) =>
          log.staffName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.entityId.toLowerCase().includes(q)
      );
    }
    return list;
  }, [auditLogs, overviewAuditCategory, overviewAuditSearch]);

  // Audit Category Counts for Overview
  const auditCategoryCounts = useMemo(() => {
    let ordersCount = 0;
    let logisticsCount = 0;
    let supportCount = 0;
    let quoteCount = 0;
    let systemCount = 0;

    auditLogs.forEach((log) => {
      const eType = (log.entityType || "").toLowerCase();
      const act = (log.action || "").toUpperCase();
      if (eType.includes("order") || act.includes("ORDER") || act.includes("REFUND") || act.includes("PRODUCTION")) ordersCount++;
      if (act.includes("AWB") || act.includes("CARRIER") || act.includes("DISPATCH")) logisticsCount++;
      if (eType.includes("ticket") || act.includes("TICKET")) supportCount++;
      if (eType.includes("proposal") || act.includes("PROPOSAL") || act.includes("QUOTE")) quoteCount++;
      if (eType.includes("setting") || act.includes("SETTING") || act.includes("SYSTEM") || eType.includes("system")) systemCount++;
    });

    return { ordersCount, logisticsCount, supportCount, quoteCount, systemCount };
  }, [auditLogs]);

  // Filtered Commercial Orders by Financial Ledger Status
  const filteredCommercialOrders = useMemo(() => {
    if (commercialLedgerFilter === "SETTLED") return commercialFinancials.settledOrders;
    if (commercialLedgerFilter === "STAGED") return commercialFinancials.stagedOrders;
    if (commercialLedgerFilter === "REFUND_PENDING") return commercialFinancials.refundPendingOrders;
    if (commercialLedgerFilter === "REFUND_ISSUED") return commercialFinancials.refundIssuedOrders;
    return orders;
  }, [orders, commercialLedgerFilter, commercialFinancials]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesMode = modeFilter === "ALL" || order.mode === modeFilter;
      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
      const query = orderSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.pincode.includes(query);
      return matchesMode && matchesStatus && matchesSearch;
    });
  }, [orders, modeFilter, statusFilter, orderSearch]);

  // Filtered Support Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus = ticketStatusFilter === "ALL" || t.status === ticketStatusFilter;
      const matchesPriority = ticketPriorityFilter === "ALL" || t.priority === ticketPriorityFilter;
      const matchesCategory = ticketCategoryFilter === "ALL" || t.category === ticketCategoryFilter;
      const q = ticketSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.toLowerCase().includes(q) ||
        (t.orderNumber && t.orderNumber.toLowerCase().includes(q)) ||
        t.subject.toLowerCase().includes(q);

      return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    });
  }, [tickets, ticketStatusFilter, ticketPriorityFilter, ticketCategoryFilter, ticketSearchQuery]);

  const getStorefrontUrl = (path: string) => {
    const origin =
      typeof window !== "undefined" && window.location.port === "3002"
        ? `${window.location.protocol}//${window.location.hostname}:3001`
        : typeof window !== "undefined"
        ? window.location.origin
        : "http://192.168.1.100:3001";
    return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const getStorefrontBalanceLink = (orderNumber: string) => {
    return getStorefrontUrl(`/track?orderId=${encodeURIComponent(orderNumber)}`);
  };

  const handleCopyBalanceLink = async (order: AdminOrder) => {
    const link = getStorefrontBalanceLink(order.orderNumber);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      }
    } catch {
      // Clipboard API requires HTTPS or user focus; feedback banner still shows exact URL
    }
    setCopiedLinkOrderId(order.id);
    setActionFeedback({
      type: "success",
      text: `Copied Balance Payment URL for ${order.orderNumber}: ${link}`,
    });
    setTimeout(() => {
      setCopiedLinkOrderId((prev) => (prev === order.id ? null : prev));
    }, 4000);
  };

  // Release MTO order to workshop (strict Day 8 IST enforcement)
  const handleReleaseToProduction = async (orderId: string) => {
    setActionFeedback(null);
    if (!isActionPermitted(currentStaff.role, "WORKSHOP_RELEASE")) {
      setActionFeedback({
        type: "error",
        text: `Unauthorized: Role '${currentStaff.role}' cannot release orders to workshop. Requires Production Staff or Super Admin.`,
      });
      return;
    }
    const target = orders.find((o) => o.id === orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RELEASE_TO_WORKSHOP",
          staffName: currentStaff.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback({
          type: "error",
          text: data.message || data.error || "Unable to release order to workshop.",
        });
        return;
      }
      logAuditAction(
        "PRODUCTION_RELEASE",
        "Order",
        target?.orderNumber || orderId,
        `Released to workshop crafting. Initial 7-day confirmation grace concluded.`
      );
      setActionFeedback({
        type: "success",
        text: data.message || `Released ${target?.orderNumber || orderId} to workshop machining.`,
      });
      await syncBackendData();
    } catch (err) {
      setActionFeedback({
        type: "error",
        text: `Backend release failed: ${(err as Error).message}`,
      });
    }
  };

  // Cancel order pre-production / pre-dispatch (100% refund)
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to process a 100% full pre-production refund cancellation?")) {
      return;
    }
    setActionFeedback(null);
    if (!isActionPermitted(currentStaff.role, "ORDER_CANCEL")) {
      setActionFeedback({
        type: "error",
        text: `Unauthorized: Role '${currentStaff.role}' does not have permission to cancel orders.`,
      });
      return;
    }
    const target = orders.find((o) => o.id === orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CANCEL_ORDER",
          staffName: currentStaff.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback({
          type: "error",
          text: data.message || data.error || "Unable to cancel order.",
        });
        return;
      }
      logAuditAction(
        "ORDER_CANCELLED_REFUND",
        "Order",
        target?.orderNumber || orderId,
        `Processed 100% pre-production refund (₹${(target?.amountPaidRupees || 0).toLocaleString("en-IN")}).`
      );
      setActionFeedback({
        type: "success",
        text: data.message || `Order ${target?.orderNumber || orderId} cancelled cleanly.`,
      });
      await syncBackendData();
    } catch (err) {
      setActionFeedback({
        type: "error",
        text: `Backend cancel failed: ${(err as Error).message}`,
      });
    }
  };

  // Record or update refund reference (Bank UTR / Gateway transaction ID)
  const handleUpdateRefundReference = async (orderId: string) => {
    if (!refundUtrInput.trim()) return;
    if (!isActionPermitted(currentStaff.role, "ORDER_REFUND_MANAGE")) {
      alert(`Unauthorized: Role '${currentStaff.role}' does not have permission to update refund records. Requires Commerce Admin or Super Admin.`);
      return;
    }
    setIsUpdatingRefund(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_REFUND",
          refundReference: refundUtrInput.trim(),
          refundGateway: "PHONEPE_REFUND",
          staffName: currentStaff.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || data.error || "Failed to update refund record.");
        return;
      }
      logAuditAction(
        "ORDER_REFUND_UPDATED",
        "Order",
        selectedOrder?.orderNumber || orderId,
        `Recorded refund gateway/UTR reference ${refundUtrInput.trim()}.`
      );
      await syncBackendData();
      if (selectedOrder) {
        setSelectedOrder({
          ...selectedOrder,
          refund: {
            amountRupees: selectedOrder.refund?.amountRupees ?? selectedOrder.amountPaidRupees,
            status: "COMPLETED",
            reference: refundUtrInput.trim(),
            gateway: "PHONEPE_REFUND",
            verifiedAt: "Just now",
          },
        });
      }
      alert("Refund reference / UTR recorded successfully.");
    } catch (err) {
      alert((err as Error).message || "Network error updating refund.");
    } finally {
      setIsUpdatingRefund(false);
    }
  };

  // Upload local workshop QC images to /uploads/qc/<orderNumber>/
  const handleQcFileUpload = async (files: FileList | null) => {
    if (!qcOrderModal || !files || files.length === 0) return;
    setIsUploadingQc(true);
    setQcUploadError(null);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));
      const res = await fetch(`/api/admin/orders/${qcOrderModal.id}/qc-upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.urls)) {
        setQcUploadError(data.error || "Failed to upload workshop QC images.");
        return;
      }
      const existing = qcImageInput
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const merged = Array.from(new Set([...existing, ...data.urls]));
      setQcImageInput(merged.join("\n"));
    } catch (err) {
      setQcUploadError(`Upload failed: ${(err as Error).message}`);
    } finally {
      setIsUploadingQc(false);
    }
  };

  // Save Workshop QC Inspection Photos & Notes
  const handleSaveQc = async () => {
    if (!qcOrderModal) return;
    setQcUploadError(null);
    if (!isActionPermitted(currentStaff.role, "QC_PHOTO_UPLOAD")) {
      setQcUploadError(`Unauthorized: Role '${currentStaff.role}' does not have permission to publish QC inspections. Requires Production Staff or Super Admin.`);
      return;
    }
    const images = qcImageInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/orders/${qcOrderModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_QC",
          qcNotes: qcNotesInput.trim(),
          qcImages: images,
          staffName: currentStaff.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setQcUploadError(data.message || data.error || "Unable to save QC inspection.");
        return;
      }
      logAuditAction(
        "QC_PHOTOS_PUBLISHED",
        "Order",
        qcOrderModal.orderNumber,
        `Uploaded ${images.length} QC verification photo(s) with craftsman quality notes.`
      );
      setActionFeedback({
        type: "success",
        text: data.message || `Published ${images.length} QC photo(s) for ${qcOrderModal.orderNumber}.`,
      });
      setQcOrderModal(null);
      setQcNotesInput("");
      setQcImageInput("");
      await syncBackendData();
    } catch (err) {
      setQcUploadError(`Backend QC save failed: ${(err as Error).message}`);
    }
  };

  // Save AWB and Carrier with HARD 100% PAYMENT LOCKOUT
  const handleSaveAwb = async (orderId: string) => {
    if (!awbInput.trim()) return;
    setActionFeedback(null);
    const targetOrder = orders.find((o) => o.id === orderId);

    if (!isActionPermitted(currentStaff.role, "DISPATCH_AWB")) {
      setActionFeedback({
        type: "error",
        text: `Unauthorized: Role '${currentStaff.role}' does not have permission to assign carrier AWBs.`,
      });
      return;
    }

    // HARD SECURITY GATE: 100% cumulative payment verified before dispatch
    if (targetOrder && targetOrder.balanceDueRupees > 0) {
      setActionFeedback({
        type: "error",
        text: `Dispatch Blocked — 100% Payment Required. Balance Due: ₹${targetOrder.balanceDueRupees.toLocaleString("en-IN")}.`,
      });
      return;
    }

    const finalCarrier = carrierInput.trim() || targetOrder?.carrierName || "Blue Dart Fragile Surface";
    const finalAwb = awbInput.trim().toUpperCase();

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DISPATCH",
          carrierName: finalCarrier,
          awbNumber: finalAwb,
          staffName: currentStaff.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback({
          type: "error",
          text: data.message || data.error || "Unable to dispatch order.",
        });
        return;
      }
      logAuditAction(
        "AWB_ASSIGNED",
        "Order",
        targetOrder?.orderNumber || orderId,
        `Assigned carrier ${finalCarrier} with AWB tracking ${finalAwb}.`
      );
      setActionFeedback({
        type: "success",
        text: data.message || `Dispatched ${targetOrder?.orderNumber || orderId} via ${finalCarrier}.`,
      });
      setEditingAwbId(null);
      setCarrierInput("");
      setAwbInput("");
      await syncBackendData();
    } catch (err) {
      setActionFeedback({
        type: "error",
        text: `Backend dispatch failed: ${(err as Error).message}`,
      });
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    setActionFeedback(null);
    if (!isActionPermitted(currentStaff.role, "DISPATCH_AWB")) {
      setActionFeedback({
        type: "error",
        text: `Unauthorized: Role '${currentStaff.role}' cannot update delivery status.`,
      });
      return;
    }
    const targetOrder = orders.find((o) => o.id === orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MARK_DELIVERED",
          staffName: currentStaff.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback({
          type: "error",
          text: data.message || data.error || "Unable to mark order delivered.",
        });
        return;
      }
      logAuditAction(
        "ORDER_DELIVERED",
        "Order",
        targetOrder?.orderNumber || orderId,
        "Marked consignment delivered cleanly."
      );
      setActionFeedback({
        type: "success",
        text: data.message || `Order ${targetOrder?.orderNumber || orderId} marked delivered.`,
      });
      await syncBackendData();
    } catch (err) {
      setActionFeedback({
        type: "error",
        text: `Backend update failed: ${(err as Error).message}`,
      });
    }
  };

  // Send reply to support ticket
  const handleSendTicketReply = async () => {
    if (!selectedTicket || !ticketReplyText.trim()) return;
    if (!isActionPermitted(currentStaff.role, "TICKET_MANAGE")) {
      alert(`Unauthorized: Role '${currentStaff.role}' does not have permission to reply to support tickets. Requires Support Staff or Super Admin.`);
      return;
    }

    try {
      const data = await fetchJson<{
        success: boolean;
        message: {
          id: string;
          sender: "STAFF" | "CUSTOMER";
          authorName: string;
          text: string;
          timestamp: string;
        };
        ticketStatus: "OPEN" | "IN_PROGRESS" | "RESOLVED";
      }>(`/api/tickets/${encodeURIComponent(selectedTicket.id)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: ticketReplyText.trim(),
          sender: "STAFF",
          authorName: currentStaff.name,
          status: "IN_PROGRESS",
        }),
      });

      const newMsg = data?.message || {
        id: `msg_${Date.now()}`,
        sender: "STAFF" as const,
        authorName: currentStaff.name,
        text: ticketReplyText.trim(),
        timestamp:
          new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) + " IST",
      };

      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === selectedTicket.id) {
            const updated = {
              ...t,
              status: "IN_PROGRESS" as const,
              messages: [...t.messages, newMsg],
            };
            setSelectedTicket(updated);
            return updated;
          }
          return t;
        })
      );

      logAuditAction(
        "TICKET_REPLY",
        "SupportTicket",
        selectedTicket.ticketNumber,
        `Staff reply dispatched: "${ticketReplyText.trim().substring(0, 60)}..."`
      );

      setTicketReplyText("");
    } catch (err) {
      console.warn("Backend ticket reply error:", err);
      setActionFeedback({
        type: "error",
        text: `Reply dispatch failed: ${(err as Error).message}`,
      });
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: "OPEN" | "IN_PROGRESS" | "RESOLVED") => {
    if (!isActionPermitted(currentStaff.role, "TICKET_MANAGE")) {
      alert(`Unauthorized: Role '${currentStaff.role}' cannot update ticket status. Requires Support Staff or Super Admin.`);
      return;
    }
    try {
      await fetchJson(`/api/tickets/${encodeURIComponent(ticketId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, staffName: currentStaff.name }),
      });
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === ticketId || t.ticketNumber === ticketId) {
            const updated = { ...t, status: newStatus };
            if (selectedTicket?.id === t.id) setSelectedTicket(updated);
            return updated;
          }
          return t;
        })
      );
      logAuditAction(
        "TICKET_STATUS_UPDATED",
        "SupportTicket",
        selectedTicket?.ticketNumber || ticketId,
        `Status updated to ${newStatus}.`
      );
    } catch (err) {
      console.warn("Backend ticket status update error:", err);
      setActionFeedback({
        type: "error",
        text: `Status update failed: ${(err as Error).message}`,
      });
    }
  };

  const handleUpdateTicketPriority = async (ticketId: string, newPriority: "NORMAL" | "HIGH" | "URGENT") => {
    if (!isActionPermitted(currentStaff.role, "TICKET_MANAGE")) {
      alert(`Unauthorized: Role '${currentStaff.role}' cannot update ticket priority. Requires Support Staff or Super Admin.`);
      return;
    }
    try {
      await fetchJson(`/api/tickets/${encodeURIComponent(ticketId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority, staffName: currentStaff.name }),
      });
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === ticketId || t.ticketNumber === ticketId) {
            const updated = { ...t, priority: newPriority };
            if (selectedTicket?.id === t.id) setSelectedTicket(updated);
            return updated;
          }
          return t;
        })
      );
      logAuditAction(
        "TICKET_PRIORITY_UPDATED",
        "SupportTicket",
        selectedTicket?.ticketNumber || ticketId,
        `Priority updated to ${newPriority}.`
      );
    } catch (err) {
      console.warn("Backend ticket priority update error:", err);
      setActionFeedback({
        type: "error",
        text: `Priority update failed: ${(err as Error).message}`,
      });
    }
  };

  // Toggle ticket status to RESOLVED
  const handleResolveTicket = async (ticketId: string) => {
    await handleUpdateTicketStatus(ticketId, "RESOLVED");
  };

  // Toggle Catalogue Publication with DB synchronization
  const handleTogglePublish = async (itemId: string) => {
    if (!isActionPermitted(currentStaff.role, "CATALOGUE_MUTATE")) {
      alert(`Unauthorized: Role '${currentStaff.role}' cannot modify catalogue items. Requires Commerce Admin or Super Admin.`);
      return;
    }
    const item = catalogue.find((c) => c.id === itemId);
    if (!item) return;
    const prevPublished = item.isPublished;
    const nextPublished = !prevPublished;

    setCatalogue((prev) =>
      prev.map((c) => (c.id === itemId ? { ...c, isPublished: nextPublished } : c))
    );

    try {
      await fetchJson("/api/admin/catalogue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: itemId,
          isPublished: nextPublished,
          staffName: currentStaff.name,
        }),
      });
      logAuditAction(
        "CATALOGUE_TOGGLE",
        "CatalogueItem",
        item.slug,
        `Publication status toggled to ${nextPublished ? "PUBLISHED" : "UNPUBLISHED"}.`
      );
    } catch (err) {
      setCatalogue((prev) =>
        prev.map((c) => (c.id === itemId ? { ...c, isPublished: prevPublished } : c))
      );
      alert(`Failed to update catalogue publication: ${(err as Error).message}`);
    }
  };

  // Helper to persist SystemSetting keys safely
  const updateSystemSetting = async (key: string, value: string) => {
    await fetchJson("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        value,
        staffName: currentStaff.name,
      }),
    });
  };

  // Toggle Maintenance Mode with DB synchronization
  const handleToggleMaintenance = async () => {
    if (!isActionPermitted(currentStaff.role, "SETTINGS_MUTATE")) {
      alert(`Unauthorized: Role '${currentStaff.role}' cannot change studio maintenance mode. Requires Super Admin.`);
      return;
    }
    const prev = maintenanceMode;
    const next = !prev;
    setMaintenanceMode(next);

    try {
      await updateSystemSetting("MAINTENANCE_MODE", String(next));
      logAuditAction(
        "MAINTENANCE_TOGGLE",
        "System",
        "Storefront",
        `Maintenance mode set to ${next ? "ENABLED" : "DISABLED"}.`
      );
    } catch (err) {
      setMaintenanceMode(prev);
      alert(`Failed to update Maintenance Mode: ${(err as Error).message}`);
    }
  };

  // Toggle Studio Hiatus with DB synchronization
  const handleToggleHiatus = async () => {
    if (!isActionPermitted(currentStaff.role, "SETTINGS_MUTATE")) {
      alert(`Unauthorized: Role '${currentStaff.role}' cannot change studio hiatus mode. Requires Super Admin.`);
      return;
    }
    const prev = studioHiatus;
    const next = !prev;
    setStudioHiatus(next);

    try {
      await updateSystemSetting("STUDIO_HIATUS", String(next));
      logAuditAction(
        "STUDIO_HIATUS_TOGGLE",
        "System",
        "Workshop",
        `Studio hiatus banner set to ${next ? "ACTIVE" : "INACTIVE"}.`
      );
    } catch (err) {
      setStudioHiatus(prev);
      alert(`Failed to update Studio Hiatus: ${(err as Error).message}`);
    }
  };

  // Save Announcement Banner with DB synchronization
  const handleSaveAnnouncement = async () => {
    if (!isActionPermitted(currentStaff.role, "SETTINGS_MUTATE")) {
      alert(`Unauthorized: Role '${currentStaff.role}' cannot update studio broadcast announcements. Requires Super Admin.`);
      return;
    }
    setIsSavingSettings(true);
    setSettingsSaveSuccess(false);
    try {
      await updateSystemSetting("ANNOUNCEMENT_BANNER", announcementBanner);
      logAuditAction(
        "ANNOUNCEMENT_BANNER_UPDATE",
        "System",
        "Broadcast",
        `Announcement banner updated: "${announcementBanner}"`
      );
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Failed to save announcement banner: ${(err as Error).message}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Save Legal Entity & Statutory GST Invoice Configuration with DB synchronization
  const handleSaveSellerDetails = async () => {
    if (!isActionPermitted(currentStaff.role, "SETTINGS_MUTATE")) {
      alert(`Unauthorized: Role '${currentStaff.role}' cannot update legal invoice configuration. Requires Super Admin.`);
      return;
    }
    setIsSavingSellerDetails(true);
    setSellerDetailsSaveSuccess(false);
    try {
      await updateSystemSetting("INVOICE_SELLER_DETAILS", JSON.stringify(sellerDetails));
      logAuditAction(
        "INVOICE_SELLER_DETAILS_UPDATE",
        "SystemSetting",
        "INVOICE_SELLER_DETAILS",
        `Updated legal entity (${sellerDetails.legalEntityName}), brand (${sellerDetails.brandName}) & GSTIN (${sellerDetails.gstin}) for tax documents`
      );
      setSellerDetailsSaveSuccess(true);
      setTimeout(() => setSellerDetailsSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Failed to save invoice seller details: ${(err as Error).message}`);
    } finally {
      setIsSavingSellerDetails(false);
    }
  };

  // Create Formal 30-Day Architectural Proposal (TAV-07)
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActionPermitted(currentStaff.role, "PROPOSAL_CREATE_REVISE")) {
      alert(`Unauthorized: Role '${currentStaff.role}' cannot issue formal proposals. Requires Commerce Admin or Super Admin.`);
      return;
    }
    setIsSubmittingProposal(true);
    try {
      const itemsSubtotal = proposalForm.lineItems.reduce(
        (sum, it) => sum + (Number(it.quantity) || 1) * (Number(it.unitPriceRupees) || 0),
        0
      );
      const delivery = Math.max(0, Number(proposalForm.deliveryChargeRupees) || 0);
      const quotedAmountRupees = itemsSubtotal + delivery;
      const estimatedLeadDays = Math.max(7, (Number(proposalForm.estimatedLeadWeeks) || 4) * 7);

      const data = await fetchJson<{ proposal: AdminProposal }>("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryId: proposalForm.inquiryId || undefined,
          customerName: proposalForm.customerName.trim(),
          customerEmail: proposalForm.customerEmail.trim(),
          customerPhone: proposalForm.customerPhone.trim(),
          deliveryPincode: proposalForm.deliveryPincode.trim(),
          lineItems: proposalForm.lineItems,
          deliveryChargeRupees: delivery,
          quotedAmountRupees,
          estimatedLeadDays,
          notes: proposalForm.notes,
          staffName: currentStaff.name,
        }),
      });

      setProposals((prev) => [data.proposal, ...prev.filter((p) => p.id !== data.proposal.id)]);
      logAuditAction(
        "QUOTE_PROPOSAL_ISSUED",
        "QuoteProposal",
        data.proposal.quoteNumber,
        `Proposal issued to ${proposalForm.customerEmail} for ₹${Number(quotedAmountRupees).toLocaleString("en-IN")}.`
      );
      setIsProposalModalOpen(false);
      if (proposalForm.inquiryId) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === proposalForm.inquiryId ? { ...i, status: "QUOTE_ISSUED" } : i))
        );
      }
    } catch (err: unknown) {
      alert((err as Error).message || "Error issuing proposal");
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  // Create Proposal Revision (N+1) preserving original 30-day clock (QOT-05)
  const handleCreateRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionQuote) return;
    if (!isActionPermitted(currentStaff.role, "PROPOSAL_CREATE_REVISE")) {
      alert(`Unauthorized: Role '${currentStaff.role}' cannot revise proposals. Requires Commerce Admin or Super Admin.`);
      return;
    }
    setIsSubmittingRevision(true);
    try {
      const itemsSubtotal = revisionForm.lineItems.reduce(
        (sum, it) => sum + (Number(it.quantity) || 1) * (Number(it.unitPriceRupees) || 0),
        0
      );
      const delivery = Math.max(0, Number(revisionForm.deliveryChargeRupees) || 0);
      const quotedAmountRupees = itemsSubtotal + delivery;
      const estimatedLeadDays = Math.max(7, (Number(revisionForm.estimatedLeadWeeks) || 4) * 7);

      const data = await fetchJson<{ proposal: AdminProposal }>(
        `/api/quotes/${encodeURIComponent(revisionQuote.quoteNumber)}/revisions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lineItems: revisionForm.lineItems,
            deliveryChargeRupees: delivery,
            quotedAmountRupees,
            estimatedLeadDays,
            notes: revisionForm.notes,
            staffName: currentStaff.name,
          }),
        }
      );

      const updated = data.proposal;
      setProposals((prev) =>
        prev.map((p) => (p.quoteNumber === updated.quoteNumber ? updated : p))
      );
      logAuditAction(
        "QUOTE_PROPOSAL_REVISED",
        "QuoteProposal",
        revisionQuote.quoteNumber,
        `Revision V${(updated.versions?.[0]?.versionNumber || 2)} issued for ₹${Number(quotedAmountRupees).toLocaleString("en-IN")}. Original 30-day offer clock preserved.`
      );
      setIsRevisionModalOpen(false);
      setRevisionQuote(null);
    } catch (err: unknown) {
      alert((err as Error).message || "Error revising proposal");
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const handleOpenRevisionModal = (proposal: AdminProposal) => {
    const latestVer = proposal.versions?.[0];
    let items: ProposalLineItemInput[] = [];
    if (latestVer?.lineItemsJson) {
      try {
        const parsed = JSON.parse(latestVer.lineItemsJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          items = parsed.map((it) => ({
            name: it.name || "Bespoke Edition",
            finish: it.finish || "",
            quantity: Number(it.quantity) || 1,
            unitPriceRupees: Number(it.unitPriceRupees) || 0,
          }));
        }
      } catch {
        // Fallback to default
      }
    }
    if (items.length === 0 && latestVer) {
      items = [
        {
          name: "Bespoke Architectural Scope",
          finish: "Standard Studio Patina",
          quantity: 1,
          unitPriceRupees: Number(latestVer.quotedAmount) || 50000,
        },
      ];
    }
    setRevisionQuote(proposal);
    setRevisionForm({
      lineItems: items,
      deliveryChargeRupees: Number(latestVer?.deliveryCharge || 0),
      estimatedLeadWeeks: Math.max(1, Math.round((latestVer?.estimatedLeadDays || 28) / 7)),
      notes: latestVer?.specifications || "",
    });
    setIsRevisionModalOpen(true);
  };

  // Sync Markdown Product Editions from docs/products
  const handleSyncMarkdownDocs = async () => {
    if (!isActionPermitted(currentStaff.role, "CATALOGUE_MUTATE")) {
      setImportFeedback(`Unauthorized: Role '${currentStaff.role}' cannot import catalogue data. Requires Commerce Admin or Super Admin.`);
      return;
    }
    setIsImporting(true);
    setImportFeedback("Scanning docs/products/*.md and syncing with PostgreSQL...");
    try {
      const data = await fetchJson<{ count: number }>("/api/admin/catalogue/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncFromDocs: true, staffName: currentStaff.name }),
      });

      setImportFeedback(`Successfully synced ${data.count} editions from docs/products!`);
      const catData = await fetchJson<{ catalogue?: CatalogueItem[] }>("/api/admin/catalogue");
      if (catData.catalogue) setCatalogue(catData.catalogue);

      logAuditAction(
        "MARKDOWN_CATALOGUE_SYNC",
        "Catalogue",
        "docs/products",
        `Synced ${data.count} product markdown editions to database.`
      );
    } catch (err: unknown) {
      setImportFeedback(`Error: ${(err as Error).message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Import Single Custom Markdown Specification
  const handleImportSingleMarkdown = async () => {
    if (!markdownInput.trim()) return;
    if (!isActionPermitted(currentStaff.role, "CATALOGUE_MUTATE")) {
      setImportFeedback(`Unauthorized: Role '${currentStaff.role}' cannot import catalogue data. Requires Commerce Admin or Super Admin.`);
      return;
    }
    setIsImporting(true);
    setImportFeedback("Parsing YAML frontmatter and specifications...");
    try {
      const data = await fetchJson<{ product: { title: string; sku: string; slug: string } }>(
        "/api/admin/catalogue/import",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdownContent: markdownInput, staffName: currentStaff.name }),
        }
      );

      setImportFeedback(`Successfully imported '${data.product.title}' (${data.product.sku})!`);
      const catData = await fetchJson<{ catalogue?: CatalogueItem[] }>("/api/admin/catalogue");
      if (catData.catalogue) setCatalogue(catData.catalogue);

      logAuditAction(
        "MARKDOWN_PRODUCT_IMPORT",
        "Product",
        data.product.slug,
        `Imported product ${data.product.title} from custom markdown.`
      );
      setMarkdownInput("");
    } catch (err: unknown) {
      setImportFeedback(`Error: ${(err as Error).message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Upload single .md specification
  const handleUploadSingleMdFile = async () => {
    if (!selectedMdFile) return;
    if (!isActionPermitted(currentStaff.role, "CATALOGUE_MUTATE")) {
      setImportFeedback(`Unauthorized: Role '${currentStaff.role}' cannot import catalogue data. Requires Commerce Admin or Super Admin.`);
      return;
    }
    setIsImporting(true);
    setImportFeedback(`Parsing and importing '${selectedMdFile.name}'...`);

    try {
      const formData = new FormData();
      formData.append("file", selectedMdFile);
      formData.append("staffName", currentStaff.name);

      const res = await fetch("/api/admin/catalogue/import", {
        method: "POST",
        body: formData,
      });

      const raw = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Server returned HTTP ${res.status}: ${raw.slice(0, 120)}`);
      }

      if (!res.ok) throw new Error(data.error || "Failed to import markdown file");

      setImportFeedback(
        `Successfully imported '${data.product.title}' (${data.product.sku}) with ${data.variants?.length || 0} variant edition(s)!`
      );

      const catData = await fetchJson<{ catalogue?: CatalogueItem[] }>("/api/admin/catalogue");
      if (catData.catalogue) setCatalogue(catData.catalogue);

      logAuditAction(
        "MARKDOWN_FILE_IMPORTED",
        "Product",
        data.product.slug,
        `Imported single markdown file ${selectedMdFile.name}.`
      );

      setSelectedMdFile(null);
    } catch (err: unknown) {
      setImportFeedback(`Error: ${(err as Error).message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Download State Snapshot JSON
  const handleExportStateSnapshot = () => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      orders,
      tickets,
      catalogue,
      pincodes,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tavistra-admin-snapshot-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAuditAction("DATA_EXPORT", "System", "ALL", "Downloaded complete operational state snapshot JSON.");
  };

  const formatPrice = (rupees: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(rupees);

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleStaffChange = (staffId: string) => {
    const found = STAFF_USERS.find((u) => u.id === staffId);
    if (!found) return;
    setCurrentStaff(found);
    if (!isTabPermitted(found.role, activeTab as any)) {
      const allowed = ROLE_TAB_PERMISSIONS[found.role];
      if (allowed && allowed.length > 0) {
        setActiveTab(allowed[0] as typeof activeTab);
      } else {
        setActiveTab("OVERVIEW");
      }
    }
  };

  interface MenuCategory {
    id: string;
    title: string;
    icon: string;
    items: {
      id: AdminTabId;
      label: string;
      badge?: number;
      badgeColor?: "amber" | "rose" | "bronze";
    }[];
  }

  const MENU_GROUPS: MenuCategory[] = [
    {
      id: "commercial",
      title: "Commercial & Sales",
      icon: "💼",
      items: [
        { id: "OVERVIEW", label: "Studio Overview" },
        { id: "ORDERS", label: "Orders & Production", badge: orders.length },
        { id: "PROPOSALS", label: "Inquiries & Quotes", badge: inquiries.length + proposals.length },
        { id: "CUSTOMERS", label: "Client Directory", badge: customers.length },
      ],
    },
    {
      id: "workshop",
      title: "Workshop & Fulfilment",
      icon: "🔨",
      items: [
        { id: "PRODUCTION", label: "Workshop Queue (Grace)", badge: stats.mtoGraceCount, badgeColor: "amber" },
        { id: "DISPATCH", label: "Logistics & AWB" },
        { id: "CATALOGUE", label: "Catalogue & Variants", badge: catalogue.length },
        { id: "PINCODES", label: "Delivery PIN Zones", badge: stats.serviceablePinsCount },
      ],
    },
    {
      id: "operations",
      title: "Operations & Governance",
      icon: "⚙️",
      items: [
        { id: "TICKETS", label: "Support Tickets", badge: stats.openTicketsCount, badgeColor: "rose" },
        { id: "SETTINGS", label: "Storewide Settings" },
        { id: "AUDIT", label: "Audit Log", badge: auditLogs.length },
      ],
    },
  ];

  const currentTabMeta = (() => {
    for (const group of MENU_GROUPS) {
      const match = group.items.find((i) => i.id === activeTab);
      if (match) {
        return {
          group: group.title,
          label: match.label,
          badge: match.badge,
        };
      }
    }
    return { group: "Studio", label: activeTab, badge: undefined };
  })();

  return (
    <div className="min-h-screen flex bg-[#181715] text-[#eae6df]">
      {/* LEFT SIDEBAR: PIANO STYLE */}
      <aside className="w-64 xl:w-72 shrink-0 bg-[#1e1c19] border-r border-[#38332c] flex flex-col justify-between sticky top-0 h-screen z-40 select-none">
        {/* Top: Showcase Brand Logo */}
        <div className="p-5 border-b border-[#38332c] bg-[#1a1816]/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo-name.png"
              alt="Tavistra"
              className="h-8 w-auto object-contain max-w-[140px]"
            />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#2a2722] text-[#c59b6d] border border-[#38332c]">
            Admin
          </span>
        </div>

        {/* Middle: Categorized Menus & Tactile Piano Keys */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {MENU_GROUPS.map((group) => {
            const permittedItems = group.items.filter((item) =>
              isTabPermitted(currentStaff.role, item.id)
            );
            // Completely hide category if no permitted items exist for active staff role
            if (permittedItems.length === 0) return null;

            const isCollapsed = collapsedGroups[group.id] ?? false;
            const isGroupActive = permittedItems.some((item) => item.id === activeTab);
            const totalGroupBadge = permittedItems.reduce((acc, curr) => acc + (curr.badge || 0), 0);

            return (
              <div key={group.id} className="space-y-1">
                {/* Main Piano Category Button */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-left transition-all ${
                    isGroupActive
                      ? "bg-[#25221d] text-[#eae6df] border border-[#464037]"
                      : "bg-[#1f1c19] text-[#a8a093] hover:bg-[#25221d] hover:text-[#eae6df] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{group.icon}</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#d5cfc5]">
                      {group.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {totalGroupBadge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#2e2a24] text-[#c59b6d] border border-[#3e3830]">
                        {totalGroupBadge}
                      </span>
                    )}
                    <span
                      className={`text-[9px] text-[#787165] transition-transform duration-200 ${
                        isCollapsed ? "-rotate-90" : "rotate-0"
                      }`}
                    >
                      ▼
                    </span>
                  </div>
                </button>

                {/* Piano Sub-Keys */}
                {!isCollapsed && (
                  <div className="space-y-1 pt-0.5 pl-1.5">
                    {permittedItems.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveTab(item.id)}
                          className={`group relative flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-md transition-all select-none ${
                            isActive
                              ? "bg-[#2a2620] text-white border-l-4 border-l-[#c59b6d] border-y border-r border-[#38332c] shadow-[0_2px_6px_rgba(0,0,0,0.3)] pl-2.5 font-semibold"
                              : "text-[#a8a093] hover:text-[#eae6df] hover:bg-[#24211d] border-l-4 border-l-transparent border-y border-r border-transparent hover:border-[#332f28]"
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span
                              className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isActive
                                  ? "bg-[#c59b6d] text-[#181715]"
                                  : item.badgeColor === "amber"
                                  ? "bg-amber-950/70 text-amber-300 border border-amber-800/60"
                                  : item.badgeColor === "rose"
                                  ? "bg-rose-950/70 text-rose-300 border border-rose-800/60"
                                  : "bg-[#2a2722] text-[#c59b6d] border border-[#38332c]"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom: Subtle Parent Entity Attribution & Storefront Link */}
        <div className="p-4 border-t border-[#38332c] bg-[#1a1816]/80 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-[#787165]">
            <span className="text-[10px]">A business unit of</span>
            <img
              src="/vdesign-dark.png"
              alt="VDesign"
              className="h-3.5 w-auto object-contain invert opacity-75 hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#787165] pt-2 border-t border-[#2d2923]">
            <span>v1.2.0 · Operations</span>
            <a
              href={getStorefrontUrl("/")}
              target="_blank"
              rel="noreferrer"
              className="text-[#c59b6d] hover:underline flex items-center gap-1 font-medium"
            >
              Storefront ↗
            </a>
          </div>
        </div>
      </aside>

      {/* RIGHT WORKSPACE COLUMN */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Staff Operational Bar */}
        <header className="sticky top-0 z-30 bg-[#1e1c19]/95 backdrop-blur-md border-b border-[#38332c] px-6 h-16 flex items-center justify-between">
          {/* Active Section & Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-[#a8a093]">
              <span className="text-[#787165]">{currentTabMeta.group}</span>
              <span className="mx-2 text-[#464037]">/</span>
              <span className="font-semibold text-white">{currentTabMeta.label}</span>
            </div>
            {currentTabMeta.badge !== undefined && currentTabMeta.badge > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c59b6d]/20 text-[#c59b6d] border border-[#c59b6d]/40">
                {currentTabMeta.badge}
              </span>
            )}
          </div>

          {/* User Account & Role Switcher + Sync Pill */}
          <div className="flex items-center gap-4">
            {/* Sync Pill & Button */}
            <div className="flex items-center gap-2 bg-[#24211d] border border-[#38332c] px-2.5 py-1 rounded-lg text-xs">
              <span
                className={`h-2 w-2 rounded-full ${
                  backendStatus === "connected"
                    ? "bg-emerald-500 animate-pulse"
                    : backendStatus === "connecting"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-rose-500"
                }`}
              />
              <span className="text-[11px] text-[#a8a093] hidden sm:inline">
                {backendStatus === "connected"
                  ? "PostgreSQL Synced"
                  : backendStatus === "connecting"
                  ? "Syncing..."
                  : "Offline"}
              </span>
              <span className="text-[10px] text-[#c59b6d] font-mono hidden md:inline" title="Auto-syncs in seconds">
                {syncCountdown}s
              </span>
              <button
                type="button"
                onClick={handleManualSync}
                title="Sync state from Storefront API (auto-syncs every 60s, click to reset)"
                className="text-[10px] px-1.5 py-0.5 rounded bg-[#2a2722] hover:bg-[#35312b] text-[#eae6df] border border-[#464037] transition-colors"
              >
                Sync
              </button>
            </div>

            {/* Staff User Switcher */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#38332c]">
              <div className="text-right">
                <select
                  value={currentStaff.id}
                  onChange={(e) => handleStaffChange(e.target.value)}
                  className="bg-[#24211d] border border-[#38332c] rounded-lg px-2.5 py-1 text-xs font-medium text-white focus:outline-none focus:border-[#c59b6d] cursor-pointer"
                >
                  {STAFF_USERS.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#10b981] pt-0.5 text-right">● {currentStaff.roleLabel}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#2a2722] border border-[#464037] flex items-center justify-center text-xs font-bold text-[#c59b6d]">
                {currentStaff.avatarInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Optional Disconnection / Sync Warning Banner */}
        {backendStatus === "error" && backendError && (
          <div className="bg-rose-950/80 border-b border-rose-700/60 px-6 py-2 text-xs text-rose-100 flex items-center justify-between gap-4">
            <span>
              <strong>Backend Synchronization Error:</strong> {backendError}. Changes below will not persist until Storefront API is reachable.
            </span>
            <button
              type="button"
              onClick={handleManualSync}
              className="px-2.5 py-1 rounded bg-rose-800 hover:bg-rose-700 text-white font-semibold shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 lg:p-8 space-y-8">
          {!isTabPermitted(currentStaff.role, activeTab as any) ? (
            <div className="p-12 text-center rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#2a2722] text-amber-500 mx-auto flex items-center justify-center text-xl">
                🔒
              </div>
              <h3 className="text-lg font-bold text-white">Access Restricted</h3>
              <p className="text-xs text-[#a8a093] max-w-md mx-auto leading-relaxed">
                The active staff identity (<strong>{currentStaff.name}</strong> · <span className="text-[#10b981]">{currentStaff.role}</span>) does not possess authority to inspect or modify the <strong>{activeTab}</strong> workspace.
              </p>
              <button
                onClick={() => {
                  const allowed = ROLE_TAB_PERMISSIONS[currentStaff.role];
                  setActiveTab((allowed && (allowed[0] as typeof activeTab)) || "OVERVIEW");
                }}
                className="rounded-full bg-[#c59b6d] px-5 py-2 text-xs font-semibold text-black hover:bg-[#d6ad80] transition-colors"
              >
                Return to Permitted Workspace
              </button>
            </div>
          ) : (
            <>
        {/* TAB 1: OVERVIEW */}
        {activeTab === "OVERVIEW" && (() => {
          // Compute domain tabs available to current role
          const domainTabs = [
            { id: "ALL" as const, label: "All Domains", icon: "🌐", count: undefined, visible: true },
            { id: "URGENT" as const, label: "Attention Required", icon: "🚨", count: allUrgentCases.length, highlight: true, visible: true },
            { id: "COMMERCIAL" as const, label: "Commercial & Sales", icon: "💼", count: orders.length, visible: canViewFinancials },
            { id: "WORKSHOP" as const, label: "Workshop & Fulfilment", icon: "🔨", count: stats.mtoGraceCount, visible: canViewWorkshop },
            { id: "OPERATIONS" as const, label: "Client Care & Support", icon: "⚙️", count: stats.openTicketsCount, visible: canViewTickets },
            { id: "AUDIT" as const, label: "Audit Trail", icon: "📜", count: auditLogs.length, visible: canViewAudit },
          ].filter((t) => t.visible);

          // Total committed cash flow for percentage calculations
          const totalCashFlow = Math.max(
            1,
            commercialFinancials.settledRevenue +
              commercialFinancials.advanceCollected +
              commercialFinancials.balancePending +
              commercialFinancials.refundIssuedTotal
          );
          const settledPct = Math.round((commercialFinancials.settledRevenue / totalCashFlow) * 100);
          const advPct = Math.round((commercialFinancials.advanceCollected / totalCashFlow) * 100);
          const balPct = Math.round((commercialFinancials.balancePending / totalCashFlow) * 100);
          const refPct = Math.max(0, 100 - (settledPct + advPct + balPct));

          // Pipeline stage counts for velocity chart
          const pipelineStages = [
            { label: "Grace Hold", count: stats.mtoGraceCount, color: "#f59e0b" },
            { label: "Crafting", count: stats.inProductionCount, color: "#c59b6d" },
            { label: "QC Done", count: orders.filter((o) => o.status === "PRODUCTION_COMPLETED").length, color: "#10b981" },
            { label: "Ready AWB", count: orders.filter((o) => o.status === "AWAITING_DISPATCH").length, color: "#38bdf8" },
            { label: "In Transit", count: orders.filter((o) => o.status === "DISPATCHED").length, color: "#818cf8" },
            { label: "Delivered", count: orders.filter((o) => o.status === "DELIVERED").length, color: "#34d399" },
          ];
          const maxStageCount = Math.max(1, ...pipelineStages.map((s) => s.count));

          return (
            <div className="space-y-8">
              {/* Header & Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#38332c]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#c59b6d] tracking-widest block">
                    Studio Operations Cockpit
                  </span>
                  <h2 className="text-xl font-bold text-white tracking-tight">Studio Overview</h2>
                  <p className="text-xs text-[#a8a093]">
                    Cross-functional telemetry, live operational exceptions, and role-authorized executive metrics.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  {canCreateQuote && (
                    <button
                      type="button"
                      onClick={() => setIsProposalModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#2a2722] hover:bg-[#332f29] text-[#eae6df] border border-[#464037] text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <span>+</span>
                      <span>New Custom Quote</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleManualSync}
                    title="Click to sync immediately (auto-syncs every 60s, resets timer)"
                    className="px-3 py-1.5 rounded-lg bg-[#c59b6d] hover:bg-[#d6aa7c] text-[#181715] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>↻</span>
                    <span>Sync Telemetry</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 font-bold">
                      {syncCountdown}s
                    </span>
                  </button>
                </div>
              </div>

              {/* Domain Filter Bar (Role-Filtered) */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-[#1e1c19] border border-[#38332c]">
                {domainTabs.map((tab) => {
                  const isActive = overviewDomainFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setOverviewDomainFilter(tab.id);
                        if (tab.id !== "URGENT") setUrgentCategoryFilter("ALL");
                      }}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                        isActive
                          ? "bg-[#2a2620] text-white border-l-2 border-l-[#c59b6d] border-y border-r border-[#464037] shadow-sm"
                          : "text-[#a8a093] hover:text-[#eae6df] hover:bg-[#24211d] border border-transparent"
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            tab.highlight && tab.count > 0
                              ? "bg-rose-950/80 text-rose-300 border border-rose-800/70"
                              : isActive
                              ? "bg-[#38332c] text-[#c59b6d]"
                              : "bg-[#2a2722] text-[#a8a093]"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Top 4 Interactive Pulse Cards (Role Authority Honored) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Role Authority */}
                {canViewFinancials ? (
                  <div
                    onClick={() => setOverviewDomainFilter("COMMERCIAL")}
                    className="p-5 rounded-2xl bg-[#24211d] border border-[#38332c] hover:border-[#464037] hover:bg-[#282520] transition-all cursor-pointer group space-y-2 select-none shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#a8a093]">
                      <span>Net Verified Revenue</span>
                      <span className="text-[#c59b6d] opacity-0 group-hover:opacity-100 transition-opacity">Financial Flow →</span>
                    </div>
                    <p className="text-2xl font-bold text-white group-hover:text-[#c59b6d] transition-colors">
                      {formatPrice(stats.netRevenue)}
                    </p>
                    <p className="text-[11px] text-[#10b981]">
                      Gross: {formatPrice(stats.grossRevenue)} · Refunds: {formatPrice(stats.totalRefunded)}
                    </p>
                  </div>
                ) : canViewWorkshop ? (
                  <div
                    onClick={() => setActiveTab("PRODUCTION")}
                    className="p-5 rounded-2xl bg-[#24211d] border border-[#38332c] hover:border-[#464037] hover:bg-[#282520] transition-all cursor-pointer group space-y-2 select-none shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#a8a093]">
                      <span>Workshop Active Units</span>
                      <span className="text-[#c59b6d] opacity-0 group-hover:opacity-100 transition-opacity">Workshop Queue →</span>
                    </div>
                    <p className="text-2xl font-bold text-white group-hover:text-[#c59b6d] transition-colors">
                      {stats.inProductionCount} in Machining/QC
                    </p>
                    <p className="text-[11px] text-[#f59e0b]">
                      {stats.mtoGraceCount} active 7-day grace holds
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => setActiveTab("TICKETS")}
                    className="p-5 rounded-2xl bg-[#24211d] border border-[#38332c] hover:border-[#464037] hover:bg-[#282520] transition-all cursor-pointer group space-y-2 select-none shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#a8a093]">
                      <span>Open Support Tickets</span>
                      <span className="text-[#c59b6d] opacity-0 group-hover:opacity-100 transition-opacity">Support Desk →</span>
                    </div>
                    <p className="text-2xl font-bold text-white group-hover:text-[#c59b6d] transition-colors">
                      {stats.openTicketsCount} Active Requests
                    </p>
                    <p className="text-[11px] text-rose-300">
                      {tickets.filter((t) => t.priority === "URGENT").length} urgent escalations
                    </p>
                  </div>
                )}

                {/* Card 2: Active Pipeline */}
                <div
                  onClick={() => setActiveTab("ORDERS")}
                  className="p-5 rounded-2xl bg-[#24211d] border border-[#38332c] hover:border-[#464037] hover:bg-[#282520] transition-all cursor-pointer group space-y-2 select-none shadow-sm"
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#a8a093]">
                    <span>Active Pipeline</span>
                    <span className="text-[#c59b6d] opacity-0 group-hover:opacity-100 transition-opacity">View Orders →</span>
                  </div>
                  <p className="text-2xl font-bold text-white group-hover:text-[#c59b6d] transition-colors">
                    {orders.length} Consignments
                  </p>
                  <p className="text-[11px] text-[#a8a093]">
                    {orders.filter((o) => o.mode === "READY_STOCK").length} Ready Stock · {orders.filter((o) => o.mode === "MADE_TO_ORDER").length} Made to Order
                  </p>
                </div>

                {/* Card 3: Role Authority */}
                {canViewWorkshop ? (
                  <div
                    onClick={() => setActiveTab("PRODUCTION")}
                    className="p-5 rounded-2xl bg-[#24211d] border border-[#38332c] hover:border-[#464037] hover:bg-[#282520] transition-all cursor-pointer group space-y-2 select-none shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#a8a093]">
                      <span>Workshop Grace Holds</span>
                      <span className="text-[#c59b6d] opacity-0 group-hover:opacity-100 transition-opacity">Grace Queue →</span>
                    </div>
                    <p className="text-2xl font-bold text-[#f59e0b] group-hover:text-[#fbbf24] transition-colors">
                      {stats.mtoGraceCount} Active Holds
                    </p>
                    <p className="text-[11px] text-[#a8a093]">
                      Earliest: {stats.minGraceDays !== null ? (stats.minGraceDays === 0 ? "Release Ready Today" : `${stats.minGraceDays}d remaining`) : "None"} · Day 8 Machining
                    </p>
                  </div>
                ) : canViewProposals ? (
                  <div
                    onClick={() => setActiveTab("PROPOSALS")}
                    className="p-5 rounded-2xl bg-[#24211d] border border-[#38332c] hover:border-[#464037] hover:bg-[#282520] transition-all cursor-pointer group space-y-2 select-none shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#a8a093]">
                      <span>Bespoke Quotes & RFQs</span>
                      <span className="text-[#c59b6d] opacity-0 group-hover:opacity-100 transition-opacity">Quotes Console →</span>
                    </div>
                    <p className="text-2xl font-bold text-[#c59b6d] group-hover:text-[#d6aa7c] transition-colors">
                      {inquiries.length + proposals.length} Active
                    </p>
                    <p className="text-[11px] text-[#a8a093]">
                      {inquiries.filter((i) => i.status === "NEW").length} New Inquiries · {proposals.filter((p) => p.status === "DRAFT").length} Drafts
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => setActiveTab("TICKETS")}
                    className="p-5 rounded-2xl bg-[#24211d] border border-[#38332c] hover:border-[#464037] hover:bg-[#282520] transition-all cursor-pointer group space-y-2 select-none shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#a8a093]">
                      <span>Resolved Client Requests</span>
                      <span className="text-[#c59b6d] opacity-0 group-hover:opacity-100 transition-opacity">Ticket Archive →</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400 transition-colors">
                      {tickets.filter((t) => t.status === "RESOLVED").length} Resolved
                    </p>
                    <p className="text-[11px] text-[#a8a093]">
                      Assistance successfully delivered
                    </p>
                  </div>
                )}

                {/* Card 4: Urgent Bottlenecks */}
                <div
                  onClick={() => setOverviewDomainFilter("URGENT")}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group space-y-2 select-none shadow-sm ${
                    allUrgentCases.length > 0
                      ? "bg-rose-950/20 border-rose-900/60 hover:border-rose-700/80 hover:bg-rose-950/30"
                      : "bg-[#24211d] border-[#38332c] hover:border-[#464037]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#a8a093]">
                    <span className="flex items-center gap-1.5 text-rose-300">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                      Urgent Bottlenecks
                    </span>
                    <span className="text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity">Triage →</span>
                  </div>
                  <p className="text-2xl font-bold text-rose-400 group-hover:text-rose-300 transition-colors">
                    {allUrgentCases.length} Action-Required
                  </p>
                  <p className="text-[11px] text-[#a8a093]">
                    {allUrgentCases.length === 0 ? "All authorized queues operating smoothly" : "Filtered to your staff authority"}
                  </p>
                </div>
              </div>

              {/* ATTENTION REQUIRED SHELF (The Exception-Based Cockpit) */}
              {(overviewDomainFilter === "URGENT" || (overviewDomainFilter === "ALL" && allUrgentCases.length > 0)) && (
                <div className="p-6 rounded-2xl bg-[#24211d] border border-amber-900/40 shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#38332c] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">🚨</span>
                      <div>
                        <h3 className="font-bold text-sm text-white">Attention Required · Urgent Exceptions</h3>
                        <p className="text-[11px] text-[#a8a093]">
                          Actionable operational items requiring staff decisions (filtered by your role: <span className="text-[#c59b6d]">{currentStaff.role}</span>).
                        </p>
                      </div>
                    </div>

                    {/* Sub-filters for urgent items */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: "ALL", label: `All (${allUrgentCases.length})` },
                        { id: "GRACE_RELEASE", label: "Grace Releases" },
                        { id: "BALANCE_DUE", label: "Balance Due" },
                        { id: "URGENT_TICKET", label: "Tickets" },
                        { id: "PENDING_QUOTE", label: "Quotes" },
                        { id: "AWAITING_DISPATCH", label: "Dispatch" },
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setUrgentCategoryFilter(sub.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                            urgentCategoryFilter === sub.id
                              ? "bg-[#c59b6d] text-[#181715]"
                              : "bg-[#2a2722] text-[#a8a093] hover:text-white"
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredUrgentCases.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#a8a093] space-y-2">
                      <span className="text-2xl block text-emerald-400">✓</span>
                      <p className="font-medium text-white">No pending items in this category.</p>
                      <p className="text-[11px]">All queues within your authority are currently on schedule.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {filteredUrgentCases.map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl bg-[#1e1c19] border flex flex-col justify-between space-y-3 transition-all hover:bg-[#23201b] ${
                            item.badgeColor === "rose"
                              ? "border-l-4 border-l-rose-500 border-y border-r border-[#38332c]"
                              : item.badgeColor === "amber"
                              ? "border-l-4 border-l-amber-500 border-y border-r border-[#38332c]"
                              : item.badgeColor === "emerald"
                              ? "border-l-4 border-l-emerald-500 border-y border-r border-[#38332c]"
                              : "border-l-4 border-l-[#c59b6d] border-y border-r border-[#38332c]"
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#a8a093]">
                                {item.categoryLabel}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.badgeColor === "rose"
                                    ? "bg-rose-950 text-rose-300 border border-rose-800"
                                    : item.badgeColor === "amber"
                                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                                    : item.badgeColor === "emerald"
                                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                    : "bg-[#2a2722] text-[#c59b6d] border border-[#38332c]"
                                }`}
                              >
                                {item.badge}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                            <p className="text-[11px] text-[#a8a093] line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={item.onAction}
                            className="w-full py-2 px-3 rounded-lg bg-[#2a2722] hover:bg-[#35312b] text-[#c59b6d] hover:text-[#d6aa7c] border border-[#464037] text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                          >
                            <span>{item.actionLabel}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DOMAIN 1: COMMERCIAL & SALES STREAM (With Financial Segregation & Charts) */}
              {canViewFinancials && (overviewDomainFilter === "ALL" || overviewDomainFilter === "COMMERCIAL") && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#38332c] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💼</span>
                      <h3 className="font-bold text-sm text-white">Commercial & Sales Telemetry</h3>
                      <span className="text-xs text-[#a8a093]">
                        ({orders.length} Consignments · {inquiries.length + proposals.length} Quotes)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {canViewProposals && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("PROPOSALS")}
                          className="text-xs font-semibold text-[#a8a093] hover:text-[#c59b6d] transition-colors"
                        >
                          Inquiries & Quotes ({inquiries.length + proposals.length}) →
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveTab("ORDERS")}
                        className="text-xs font-semibold text-[#c59b6d] hover:underline"
                      >
                        View All Orders ({orders.length}) →
                      </button>
                    </div>
                  </div>

                  {/* Financial Overview Segregation: 4 Distinct Status Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Paid 100% */}
                    <div
                      onClick={() => setCommercialLedgerFilter("SETTLED")}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 shadow-sm ${
                        commercialLedgerFilter === "SETTLED"
                          ? "bg-[#2a2822] border-emerald-500/80 ring-1 ring-emerald-500/50"
                          : "bg-[#24211d] border-[#38332c] hover:border-[#464037]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold uppercase tracking-wider text-[#a8a093]">Paid 100% (Settled)</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                          {commercialFinancials.settledOrders.length}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-emerald-400">
                        {formatPrice(commercialFinancials.settledRevenue)}
                      </p>
                      <p className="text-[10px] text-[#a8a093]">Fully cleared ready stock & delivered</p>
                    </div>

                    {/* 2. Paid 25% Advance */}
                    <div
                      onClick={() => setCommercialLedgerFilter("STAGED")}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 shadow-sm ${
                        commercialLedgerFilter === "STAGED"
                          ? "bg-[#2a2822] border-[#c59b6d] ring-1 ring-[#c59b6d]/50"
                          : "bg-[#24211d] border-[#38332c] hover:border-[#464037]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold uppercase tracking-wider text-[#a8a093]">Paid 25% Advance</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#2e2a22] text-[#c59b6d] border border-[#464037]">
                          {commercialFinancials.stagedOrders.length}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-[#c59b6d]">
                        {formatPrice(commercialFinancials.advanceCollected)}
                      </p>
                      <p className="text-[10px] text-[#a8a093]">Committed MTO production deposits</p>
                    </div>

                    {/* 3. 75% Final Balance Pending */}
                    <div
                      onClick={() => setCommercialLedgerFilter("STAGED")}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 shadow-sm ${
                        commercialLedgerFilter === "STAGED"
                          ? "bg-[#2a2822] border-amber-500/80 ring-1 ring-amber-500/50"
                          : "bg-[#24211d] border-[#38332c] hover:border-[#464037]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold uppercase tracking-wider text-[#a8a093]">75% Balance Pending</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                          Due Pre-AWB
                        </span>
                      </div>
                      <p className="text-xl font-bold text-[#f59e0b]">
                        {formatPrice(commercialFinancials.balancePending)}
                      </p>
                      <p className="text-[10px] text-[#a8a093]">Payable upon QC before consignment release</p>
                    </div>

                    {/* 4. Cancelled & Refunds */}
                    <div
                      onClick={() =>
                        setCommercialLedgerFilter(
                          commercialFinancials.refundPendingOrders.length > 0 ? "REFUND_PENDING" : "REFUND_ISSUED"
                        )
                      }
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 shadow-sm ${
                        commercialLedgerFilter === "REFUND_PENDING" || commercialLedgerFilter === "REFUND_ISSUED"
                          ? "bg-[#2a2822] border-rose-500/80 ring-1 ring-rose-500/50"
                          : "bg-[#24211d] border-[#38332c] hover:border-[#464037]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold uppercase tracking-wider text-[#a8a093]">Cancelled & Refunds</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            commercialFinancials.refundPendingOrders.length > 0
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : "bg-[#2a2722] text-[#a8a093] border border-[#38332c]"
                          }`}
                        >
                          {commercialFinancials.refundPendingOrders.length > 0 ? "Pending Action" : "Settled"}
                        </span>
                      </div>
                      <div className="text-xs space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-[#a8a093]">Pending:</span>
                          <span className="font-bold text-rose-400">
                            {formatPrice(commercialFinancials.refundPendingTotal)} ({commercialFinancials.refundPendingOrders.length})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a8a093]">Settled:</span>
                          <span className="font-semibold text-emerald-400">
                            {formatPrice(commercialFinancials.refundIssuedTotal)} ({commercialFinancials.refundIssuedOrders.length})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Financial Charts (SVG) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Chart 1: Financial Settlement Distribution */}
                    <div className="lg:col-span-6 p-5 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
                        <div>
                          <h4 className="font-semibold text-xs text-white uppercase tracking-wider">
                            Financial Settlement Flow
                          </h4>
                          <p className="text-[11px] text-[#a8a093]">
                            Distribution of total committed ledger volume ({formatPrice(totalCashFlow)})
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-[#c59b6d] font-bold">LEDGER-VERIFIED</span>
                      </div>

                      {/* Multi-segmented Visual Stacked Bar */}
                      <div className="space-y-2 pt-1">
                        <div className="h-4 w-full bg-[#181715] rounded-full overflow-hidden flex border border-[#38332c]">
                          {settledPct > 0 && (
                            <div
                              style={{ width: `${settledPct}%` }}
                              title={`100% Settled: ${formatPrice(commercialFinancials.settledRevenue)} (${settledPct}%)`}
                              className="h-full bg-emerald-500 hover:opacity-90 transition-all cursor-pointer"
                            />
                          )}
                          {advPct > 0 && (
                            <div
                              style={{ width: `${advPct}%` }}
                              title={`25% Advance: ${formatPrice(commercialFinancials.advanceCollected)} (${advPct}%)`}
                              className="h-full bg-[#c59b6d] hover:opacity-90 transition-all cursor-pointer"
                            />
                          )}
                          {balPct > 0 && (
                            <div
                              style={{ width: `${balPct}%` }}
                              title={`75% Due: ${formatPrice(commercialFinancials.balancePending)} (${balPct}%)`}
                              className="h-full bg-amber-400 hover:opacity-90 transition-all cursor-pointer"
                            />
                          )}
                          {refPct > 0 && (
                            <div
                              style={{ width: `${refPct}%` }}
                              title={`Refunds: ${formatPrice(commercialFinancials.refundIssuedTotal)} (${refPct}%)`}
                              className="h-full bg-rose-400 hover:opacity-90 transition-all cursor-pointer"
                            />
                          )}
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[#a8a093] block truncate">100% Settled</span>
                              <strong className="text-white font-mono text-[10px]">{settledPct}%</strong>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#c59b6d] shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[#a8a093] block truncate">25% Advance</span>
                              <strong className="text-white font-mono text-[10px]">{advPct}%</strong>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[#a8a093] block truncate">75% Pending</span>
                              <strong className="text-white font-mono text-[10px]">{balPct}%</strong>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[#a8a093] block truncate">Refunds</span>
                              <strong className="text-white font-mono text-[10px]">{refPct}%</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart 2: Order Pipeline Velocity by Stage */}
                    <div className="lg:col-span-6 p-5 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
                        <div>
                          <h4 className="font-semibold text-xs text-white uppercase tracking-wider">
                            Order Pipeline Milestone Velocity
                          </h4>
                          <p className="text-[11px] text-[#a8a093]">Consignments moving through active workshop gates</p>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">LIVE TELEMETRY</span>
                      </div>

                      {/* SVG Bar Chart */}
                      <div className="h-24 w-full flex items-end justify-between gap-3 pt-3 pb-1 border-b border-[#2d2923]">
                        {pipelineStages.map((stage) => {
                          const heightPct = Math.max(12, Math.round((stage.count / maxStageCount) * 100));
                          return (
                            <div key={stage.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                              <span className="text-[10px] font-bold text-white group-hover:text-[#c59b6d] transition-colors">
                                {stage.count}
                              </span>
                              <div className="w-full max-w-[32px] bg-[#181715] rounded-t-md overflow-hidden h-full flex items-end">
                                <div
                                  style={{
                                    height: `${heightPct}%`,
                                    backgroundColor: stage.color,
                                  }}
                                  className="w-full rounded-t-md transition-all duration-500 hover:opacity-85"
                                />
                              </div>
                              <span className="text-[9px] text-[#a8a093] text-center truncate w-full group-hover:text-white transition-colors">
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Consignments Table & Inquiries (With Ledger Filters) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Consignments Mini-Table */}
                    <div className="lg:col-span-8 p-5 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#38332c] pb-3">
                        <div>
                          <h4 className="font-semibold text-xs text-white uppercase tracking-wider">
                            Consignments by Financial Status
                          </h4>
                          <p className="text-[11px] text-[#a8a093]">Showing {filteredCommercialOrders.length} matching orders</p>
                        </div>

                        {/* Financial Ledger Filter Switcher */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {[
                            { id: "ALL" as const, label: `All (${orders.length})` },
                            { id: "SETTLED" as const, label: `100% Settled (${commercialFinancials.settledOrders.length})` },
                            { id: "STAGED" as const, label: `25% Adv / 75% Due (${commercialFinancials.stagedOrders.length})` },
                            { id: "REFUND_PENDING" as const, label: `Refund Pending (${commercialFinancials.refundPendingOrders.length})` },
                            { id: "REFUND_ISSUED" as const, label: `Refund Issued (${commercialFinancials.refundIssuedOrders.length})` },
                          ].map((btn) => (
                            <button
                              key={btn.id}
                              type="button"
                              onClick={() => setCommercialLedgerFilter(btn.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                commercialLedgerFilter === btn.id
                                  ? "bg-[#c59b6d] text-[#181715]"
                                  : "bg-[#2a2722] text-[#a8a093] hover:text-white"
                              }`}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="divide-y divide-[#38332c]">
                        {filteredCommercialOrders.slice(0, 5).map((order) => (
                          <div
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="py-3 px-2 -mx-2 rounded-lg hover:bg-[#282520] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white">{order.orderNumber}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    order.mode === "READY_STOCK"
                                      ? "bg-[#2a2722] text-[#c59b6d] border border-[#38332c]"
                                      : "bg-amber-950/60 text-amber-300 border border-amber-800/60"
                                  }`}
                                >
                                  {order.mode === "READY_STOCK" ? "Ready Stock" : "Made to Order"}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#1e1c19] text-[#a8a093]">
                                  {order.status.replace(/_/g, " ")}
                                </span>
                              </div>
                              <p className="text-[#a8a093]">
                                {order.customerName} · {order.city}, {order.state} ({order.pincode})
                              </p>
                            </div>
                            <div className="flex items-center gap-4 sm:self-center">
                              <div className="text-right space-y-0.5">
                                <span className="font-semibold text-white block">
                                  {formatPrice(order.totalAmountRupees)}
                                </span>
                                {order.status === "CANCELLED" || order.status === "REFUNDED" ? (
                                  <p className="text-[10px] text-rose-400 font-semibold">
                                    Refund: {formatPrice(order.refund?.amountRupees ?? order.amountPaidRupees)}
                                  </p>
                                ) : (
                                  <>
                                    <p className="text-[10px] text-[#10b981]">Paid: {formatPrice(order.amountPaidRupees)}</p>
                                    {order.balanceDueRupees > 0 && (
                                      <p className="text-[10px] text-[#f59e0b]">Due: {formatPrice(order.balanceDueRupees)}</p>
                                    )}
                                  </>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                }}
                                className="px-2.5 py-1 rounded bg-[#2a2722] hover:bg-[#35312b] text-[#c59b6d] border border-[#464037] text-[11px] font-semibold transition-colors"
                              >
                                Inspect →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Bespoke Quotes & Inquiries Snapshot */}
                    <div className="lg:col-span-4 p-5 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4 shadow-sm flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
                          <h4 className="font-semibold text-xs text-white uppercase tracking-wider">
                            Bespoke Quotes & RFQs
                          </h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2a2722] text-[#c59b6d]">
                            {inquiries.length + proposals.length} Active
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {inquiries.slice(0, 3).map((inq) => (
                            <div
                              key={inq.id}
                              className="p-3 rounded-xl bg-[#1e1c19] border border-[#38332c] text-xs space-y-1.5"
                            >
                              <div className="flex justify-between items-center text-[11px]">
                                <strong className="text-white truncate">{inq.clientName}</strong>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2a2722] text-[#c59b6d] border border-[#38332c]">
                                  {inq.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#a8a093] line-clamp-1">
                                {inq.requestedEditions || `${inq.quantityUnits} unit(s)`} · {inq.destinationCity}
                              </p>
                            </div>
                          ))}

                          {proposals.slice(0, 2).map((prop) => (
                            <div
                              key={prop.id}
                              className="p-3 rounded-xl bg-[#1e1c19] border border-[#38332c] text-xs space-y-1.5"
                            >
                              <div className="flex justify-between items-center text-[11px]">
                                <strong className="text-white truncate font-mono">{prop.quoteNumber}</strong>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-800/60">
                                  {prop.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#a8a093] line-clamp-1">
                                {prop.customerName} · {prop.versions?.[prop.versions.length - 1]?.quotedAmount ? formatPrice(prop.versions[prop.versions.length - 1].quotedAmount) : "Pending"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {canViewProposals && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("PROPOSALS")}
                          className="w-full mt-3 py-2 px-3 rounded-xl bg-[#2a2722] hover:bg-[#35312b] text-[#c59b6d] border border-[#464037] text-xs font-semibold transition-colors text-center"
                        >
                          Open Inquiries & Quotes Console →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* DOMAIN 2: WORKSHOP & FULFILMENT STREAM */}
              {canViewWorkshop && (overviewDomainFilter === "ALL" || overviewDomainFilter === "WORKSHOP") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#38332c] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🔨</span>
                      <h3 className="font-bold text-sm text-white">Workshop & Fulfilment Pipeline</h3>
                      <span className="text-xs text-[#a8a093]">({stats.mtoGraceCount} MTO Grace Holds · Logistics Telemetry)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {canViewDispatch && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("DISPATCH")}
                          className="text-xs font-semibold text-[#a8a093] hover:text-[#c59b6d] transition-colors"
                        >
                          Logistics & AWB →
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveTab("PRODUCTION")}
                        className="text-xs font-semibold text-[#c59b6d] hover:underline"
                      >
                        Workshop Grace Queue ({stats.mtoGraceCount}) →
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: 7-Day Grace Hold Monitor */}
                    <div className="lg:col-span-7 p-5 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
                        <div>
                          <h4 className="font-semibold text-xs text-white uppercase tracking-wider">
                            7-Day Grace Hold Queue
                          </h4>
                          <p className="text-[11px] text-[#a8a093]">
                            Client alterations allowed during Days 1–7. Machining commences Day 8.
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60">
                          {stats.mtoGraceCount} Active
                        </span>
                      </div>

                      <div className="space-y-3">
                        {orders
                          .filter((o) => o.mode === "MADE_TO_ORDER" && o.isGraceActive)
                          .slice(0, 4)
                          .map((order) => {
                            const daysRemaining = order.graceDaysRemaining ?? 0;
                            const elapsedDays = Math.max(0, Math.min(7, 7 - daysRemaining));
                            const percent = Math.round((elapsedDays / 7) * 100);
                            return (
                              <div
                                key={order.id}
                                className="p-3.5 rounded-xl bg-[#1e1c19] border border-[#38332c] space-y-2.5"
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-white">{order.orderNumber}</span>
                                    <span className="text-[#a8a093]">({order.customerName})</span>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      daysRemaining === 0
                                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                        : daysRemaining <= 2
                                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                                        : "bg-[#2a2722] text-[#c59b6d] border border-[#38332c]"
                                    }`}
                                  >
                                    {daysRemaining === 0 ? "Release Ready Today" : `Day ${elapsedDays}/7 (${daysRemaining}d Left)`}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <div className="h-1.5 w-full bg-[#2a2722] rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        daysRemaining === 0
                                          ? "bg-emerald-500"
                                          : daysRemaining <= 2
                                          ? "bg-amber-400"
                                          : "bg-[#c59b6d]"
                                      }`}
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between text-[10px] text-[#787165]">
                                    <span>Day 1 (Hold Placed)</span>
                                    <span>Day 7 (Client Lock)</span>
                                    <span>Day 8 (Machining Release)</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab("PRODUCTION")}
                        className="w-full py-2 px-3 rounded-xl bg-[#2a2722] hover:bg-[#35312b] text-[#c59b6d] border border-[#464037] text-xs font-semibold transition-colors text-center"
                      >
                        Manage Workshop Queue & Release Releases →
                      </button>
                    </div>

                    {/* Right: Logistics & Fulfilment Telemetry */}
                    <div className="lg:col-span-5 p-5 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4 shadow-sm flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
                          <h4 className="font-semibold text-xs text-white uppercase tracking-wider">
                            Logistics & Dispatch
                          </h4>
                          <span className="text-[11px] text-[#a8a093]">Insured Transport Status</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-[#1e1c19] border border-[#38332c] space-y-1">
                            <span className="text-[10px] text-[#a8a093] block uppercase font-medium">Awaiting Dispatch</span>
                            <span className="text-xl font-bold text-amber-300">
                              {orders.filter((o) => o.status === "AWAITING_DISPATCH").length}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-[#1e1c19] border border-[#38332c] space-y-1">
                            <span className="text-[10px] text-[#a8a093] block uppercase font-medium">In Transit / AWB</span>
                            <span className="text-xl font-bold text-blue-300">
                              {orders.filter((o) => o.status === "DISPATCHED").length}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-[#1e1c19] border border-[#38332c] space-y-1">
                            <span className="text-[10px] text-[#a8a093] block uppercase font-medium">Delivered</span>
                            <span className="text-xl font-bold text-emerald-400">
                              {orders.filter((o) => o.status === "DELIVERED").length}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-[#1e1c19] border border-[#38332c] space-y-1">
                            <span className="text-[10px] text-[#a8a093] block uppercase font-medium">Delivery PINs</span>
                            <span className="text-xl font-bold text-[#c59b6d]">
                              {stats.serviceablePinsCount} Active
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 space-y-2">
                          <span className="text-[11px] font-semibold text-white block">Recent Dispatches:</span>
                          {orders
                            .filter((o) => o.awbNumber)
                            .slice(0, 2)
                            .map((o) => (
                              <div key={o.id} className="p-2.5 rounded-lg bg-[#1e1c19] border border-[#38332c] text-xs flex justify-between items-center">
                                <div>
                                  <span className="font-mono font-bold text-white">{o.orderNumber}</span>
                                  <p className="text-[10px] text-[#a8a093]">{o.carrierName || "Delhivery"} · {o.awbNumber}</p>
                                </div>
                                <span className="text-[10px] font-semibold text-[#10b981]">AWB Active</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {canViewDispatch && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("DISPATCH")}
                          className="w-full mt-3 py-2 px-3 rounded-xl bg-[#2a2722] hover:bg-[#35312b] text-[#c59b6d] border border-[#464037] text-xs font-semibold transition-colors text-center"
                        >
                          Open Fulfilment & AWB Console →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* DOMAIN 3: CLIENT CARE & SUPPORT STREAM */}
              {canViewTickets && (overviewDomainFilter === "ALL" || overviewDomainFilter === "OPERATIONS") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#38332c] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚙️</span>
                      <h3 className="font-bold text-sm text-white">Client Care & Support Telemetry</h3>
                      <span className="text-xs text-[#a8a093]">({stats.openTicketsCount} Open Tickets)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("TICKETS")}
                      className="text-xs font-semibold text-[#c59b6d] hover:underline"
                    >
                      Open Support Desk ({stats.openTicketsCount}) →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-12 p-5 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
                        <h4 className="font-semibold text-xs text-white uppercase tracking-wider">
                          Active Support Requests & Alterations
                        </h4>
                        <span className="text-[11px] text-[#a8a093]">Click to reply directly</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tickets
                          .filter((t) => t.status !== "RESOLVED")
                          .slice(0, 4)
                          .map((ticket) => (
                            <div
                              key={ticket.id}
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setActiveTab("TICKETS");
                              }}
                              className="p-3.5 rounded-xl bg-[#1e1c19] border border-[#38332c] hover:bg-[#282520] transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-white">{ticket.ticketNumber}</span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                      ticket.priority === "URGENT"
                                        ? "bg-rose-950 text-rose-300 border border-rose-800"
                                        : ticket.priority === "HIGH"
                                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                                        : "bg-[#2a2722] text-[#a8a093] border border-[#38332c]"
                                    }`}
                                  >
                                    {ticket.priority}
                                  </span>
                                  <span className="text-[10px] text-[#c59b6d] truncate">
                                    {ticket.category.replace(/_/g, " ")}
                                  </span>
                                </div>
                                <p className="text-white font-medium truncate">{ticket.subject}</p>
                                <span className="text-[10px] text-[#a8a093] block">
                                  {ticket.customerName} · {ticket.createdAt}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTicket(ticket);
                                  setActiveTab("TICKETS");
                                }}
                                className="shrink-0 px-2.5 py-1 rounded bg-[#2a2722] hover:bg-[#35312b] text-[#c59b6d] border border-[#464037] text-[11px] font-semibold transition-colors"
                              >
                                Reply →
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DOMAIN 4: DEDICATED AUDIT TRAIL STREAM / TAB */}
              {canViewAudit && (overviewDomainFilter === "ALL" || overviewDomainFilter === "AUDIT") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#38332c] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📜</span>
                      <h3 className="font-bold text-sm text-white">Immutable Staff Governance & Audit Trail</h3>
                      <span className="text-xs text-[#a8a093]">({auditLogs.length} Recorded Entries)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("AUDIT")}
                      className="text-xs font-semibold text-[#c59b6d] hover:underline"
                    >
                      Open Full Audit Tab ({auditLogs.length}) →
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4 shadow-sm">
                    {/* Category Filter Pills & Search */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#38332c] pb-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { id: "ALL", label: `All (${auditLogs.length})` },
                          { id: "ORDERS", label: `Orders (${auditCategoryCounts.ordersCount})` },
                          { id: "LOGISTICS", label: `Logistics (${auditCategoryCounts.logisticsCount})` },
                          { id: "SUPPORT", label: `Support (${auditCategoryCounts.supportCount})` },
                          { id: "PROPOSALS", label: `Quotes (${auditCategoryCounts.quoteCount})` },
                          { id: "SYSTEM", label: `System (${auditCategoryCounts.systemCount})` },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => setOverviewAuditCategory(btn.id)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                              overviewAuditCategory === btn.id
                                ? "bg-[#c59b6d] text-[#181715]"
                                : "bg-[#2a2722] text-[#a8a093] hover:text-white"
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="Search audit actions, staff, ref..."
                        value={overviewAuditSearch}
                        onChange={(e) => setOverviewAuditSearch(e.target.value)}
                        className="rounded-lg border border-[#464037] bg-[#181715] px-3 py-1 text-xs text-white placeholder-[#787165] focus:outline-none focus:border-[#c59b6d] w-full sm:w-60"
                      />
                    </div>

                    {filteredOverviewAuditLogs.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#a8a093]">
                        No audit events match the selected category or query.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredOverviewAuditLogs.slice(0, 6).map((log) => (
                          <div
                            key={log.id}
                            className="p-3 rounded-xl bg-[#1e1c19] border border-[#38332c] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#c59b6d] font-mono text-[11px]">{log.action}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#2a2722] text-[#a8a093] border border-[#38332c]">
                                  {log.entityType || "System"}
                                </span>
                                {log.entityId && (
                                  <span className="font-mono text-[10px] text-white/80">{log.entityId}</span>
                                )}
                              </div>
                              <p className="text-[#eae6df] text-[11px] leading-relaxed">{log.details}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-[#a8a093] block">{log.timestamp}</span>
                              <span className="text-[10px] font-semibold text-[#10b981]">By {log.staffName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveTab("AUDIT")}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-[#2a2722] hover:bg-[#35312b] text-[#c59b6d] border border-[#464037] text-xs font-semibold transition-colors text-center"
                    >
                      Open Full Audit Log ({auditLogs.length}) →
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 2: ORDERS WORKLIST */}
        {activeTab === "ORDERS" && (
          <div className="space-y-6">
            {actionFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                  actionFeedback.type === "error"
                    ? "bg-red-950/50 border-red-800/70 text-red-200"
                    : "bg-emerald-950/50 border-emerald-800/70 text-emerald-200"
                }`}
              >
                <span>{actionFeedback.text}</span>
                <button
                  onClick={() => setActionFeedback(null)}
                  className="text-[11px] opacity-75 hover:opacity-100 ml-4"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="space-y-3 p-4 rounded-2xl bg-[#24211d] border border-[#38332c]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <input
                  type="text"
                  placeholder="Search order ref, client, or PIN..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="rounded-xl border border-[#464037] bg-[#181715] px-4 py-2 text-xs text-white placeholder-[#787165] w-full sm:w-72 focus:outline-none focus:border-[#c59b6d]"
                />
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {(["ALL", "READY_STOCK", "MADE_TO_ORDER"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setModeFilter(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        modeFilter === m
                          ? "bg-[#c59b6d] text-[#181715]"
                          : "bg-[#2a2722] text-[#a8a093] hover:text-white"
                      }`}
                    >
                      {m === "ALL" ? "All Modes" : m === "READY_STOCK" ? "Ready Stock" : "Made to Order"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#38332c]">
                <span className="text-[10px] uppercase tracking-wider text-[#a8a093] mr-1">Status:</span>
                {[
                  { id: "ALL", label: "All" },
                  { id: "CONFIRMED", label: "Confirmed" },
                  { id: "IN_PRODUCTION", label: "In Production" },
                  { id: "PRODUCTION_COMPLETED", label: "QC Completed" },
                  { id: "AWAITING_DISPATCH", label: "Awaiting Dispatch" },
                  { id: "DISPATCHED", label: "Dispatched" },
                  { id: "DELIVERED", label: "Delivered" },
                  { id: "CANCELLED", label: "Cancelled" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      statusFilter === st.id
                        ? "bg-white text-[#181715]"
                        : "bg-[#2a2722] text-[#a8a093] hover:text-white"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#38332c] bg-[#24211d] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1e1c19] border-b border-[#38332c] text-[11px] uppercase tracking-wider text-[#a8a093]">
                  <tr>
                    <th className="py-3 px-4">Order Reference</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Client & Location</th>
                    <th className="py-3 px-4">Financial Ledger</th>
                    <th className="py-3 px-4">Milestone</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#38332c]">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#2a2722]/40 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-white">
                        {order.orderNumber}
                        <span className="block text-[10px] font-normal text-[#a8a093]">{order.placedAt}</span>
                        {order.quoteNumber && (
                          <a
                            href={getStorefrontUrl(`/quote/${order.quoteNumber}`)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800 hover:bg-amber-900"
                          >
                            Quote: {order.quoteNumber} ↗
                          </a>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            order.mode === "READY_STOCK"
                              ? "bg-blue-950 text-blue-300 border border-blue-800"
                              : "bg-amber-950 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {order.mode === "READY_STOCK" ? "Ready Stock" : "Made to Order"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-white">{order.customerName}</p>
                        <p className="text-[11px] text-[#a8a093]">
                          {order.city}, {order.state} ({order.pincode})
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-white">{formatPrice(order.totalAmountRupees)}</p>
                        {order.status === "CANCELLED" || order.status === "REFUNDED" ? (
                          <>
                            <p className="text-[11px] text-rose-400 font-semibold">
                              Refund: {formatPrice(order.refund?.amountRupees ?? order.amountPaidRupees)}
                            </p>
                            <p className="text-[10px] text-[#a8a093] font-mono truncate max-w-[140px]" title={order.refund?.reference || "REF-COMPLETED"}>
                              Ref: {order.refund?.reference || "REF-COMPLETED"}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-[11px] text-[#10b981]">Paid: {formatPrice(order.amountPaidRupees)}</p>
                            {order.balanceDueRupees > 0 && (
                              <p className="text-[11px] text-[#f59e0b]">Due: {formatPrice(order.balanceDueRupees)}</p>
                            )}
                          </>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            order.status === "CANCELLED" || order.status === "REFUNDED"
                              ? "bg-rose-950/80 text-rose-300 border-rose-800"
                              : "bg-[#2a2722] text-white border-[#464037]"
                          }`}
                        >
                          {order.status === "CANCELLED" ? "CANCELLED & REFUNDED" : order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-[#2a2a30] text-xs font-semibold text-white hover:bg-[#34343c]"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTION & 7-DAY GRACE */}
        {activeTab === "PRODUCTION" && (
          <div className="space-y-6">
            {actionFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                  actionFeedback.type === "error"
                    ? "bg-red-950/50 border-red-800/70 text-red-200"
                    : "bg-emerald-950/50 border-emerald-800/70 text-emerald-200"
                }`}
              >
                <span>{actionFeedback.text}</span>
                <button
                  onClick={() => setActionFeedback(null)}
                  className="text-[11px] opacity-75 hover:opacity-100 ml-4"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-2">
              <h3 className="font-semibold text-sm text-amber-300 flex items-center gap-2">
                <span>⚠️</span> 7-Day Confirmation Grace & Production Cutoff (TAV-06)
              </h3>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Made to Order pieces enforce an independent 7-calendar-day grace period (local IST date = Day 0). Physical workshop machining strictly commences on <strong>Day 8</strong>. Customers are entitled to pre-production alterations or 100% full refund cancellations during this grace window, and staff must verify courier feasibility for the destination PIN before release.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders
                .filter((o) => o.mode === "MADE_TO_ORDER")
                .map((order) => {
                  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
                  const isConfirmedAwaitingRelease =
                    order.status === "CONFIRMED" || order.status === "GRACE_PERIOD_ACTIVE";
                  const isGraceWindowOpen =
                    isConfirmedAwaitingRelease &&
                    (order.isGraceActive ?? (order.graceDaysRemaining ?? 0) > 0);
                  const matchedPin = pincodes.find((p) => p.pincode === order.pincode);
                  const isPinFeasible = matchedPin ? matchedPin.isServiceable : false;

                  return (
                    <div
                      key={order.id}
                      className="p-6 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-5"
                    >
                      <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
                        <div>
                          <span className="font-mono font-bold text-white text-sm">{order.orderNumber}</span>
                          <p className="text-xs text-[#a8a093]">{order.customerName}</p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            isCancelled
                              ? "bg-red-950 text-red-300 border border-red-800"
                              : isGraceWindowOpen
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <strong className="text-white block">Ordered Works:</strong>
                        <ul className="list-disc list-inside text-[#a8a093]">
                          {order.items.map((i, idx) => (
                            <li key={idx}>
                              {i.name} (Qty: {i.quantity})
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-[#2a2722] space-y-2 text-xs">
                        <div className="flex justify-between text-[#a8a093]">
                          <span>Amount Verified Paid:</span>
                          <span className="font-semibold text-[#10b981]">{formatPrice(order.amountPaidRupees)}</span>
                        </div>
                        <div className="flex justify-between text-[#a8a093]">
                          <span>Pre-Dispatch Balance:</span>
                          <span className="font-semibold text-white">
                            {order.balanceDueRupees <= 0 ? "₹0 (100% Settled)" : formatPrice(order.balanceDueRupees)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#a8a093]">
                          <span>Courier Feasibility ({order.pincode}):</span>
                          <span className={`font-semibold ${isPinFeasible ? "text-emerald-400" : "text-amber-300"}`}>
                            {isPinFeasible ? `✓ Verified (${matchedPin?.zoneCode || "Active PIN"})` : "⚠ Review PIN Feasibility"}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#f59e0b] pt-1 border-t border-[#38332c]">
                          <span>Grace Window Status:</span>
                          <span className="font-bold">
                            {isCancelled
                              ? "Cancelled & Refunded"
                              : isGraceWindowOpen
                              ? `${order.graceDaysRemaining ?? 7} Day(s) Remaining${order.releaseEligibleDate ? ` (Release ${order.releaseEligibleDate})` : ""}`
                              : isConfirmedAwaitingRelease
                              ? "Day 8 Reached — Eligible for Release"
                              : "Grace Concluded / Released"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        {isCancelled ? (
                          <div className="w-full text-center py-2 text-xs text-red-300 font-semibold bg-red-950/20 border border-red-800/40 rounded-xl">
                            Pre-Production Cancellation Completed
                          </div>
                        ) : isConfirmedAwaitingRelease ? (
                          <div className="w-full space-y-2">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleReleaseToProduction(order.id)}
                                disabled={isGraceWindowOpen}
                                title={
                                  isGraceWindowOpen
                                    ? `Physical production blocked during 7-day grace window until Day 8 (${order.releaseEligibleDate || "grace end"}).`
                                    : "Release order to workshop machining"
                                }
                                className="flex-1 py-2.5 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors shadow-sm disabled:opacity-45 disabled:cursor-not-allowed"
                              >
                                {isGraceWindowOpen
                                  ? `Locked in Grace (${order.graceDaysRemaining ?? 7}d left)`
                                  : "Release to Workshop Machining"}
                              </button>
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="py-2.5 px-4 rounded-xl border border-red-800/60 text-red-400 font-semibold text-xs hover:bg-red-950/40 transition-colors"
                              >
                                100% Pre-Prod Refund
                              </button>
                            </div>
                            {isGraceWindowOpen && (
                              <p className="text-[11px] text-amber-300/80">
                                Hard TAV-06 Gate: Machining release unlocks automatically on Day 8 ({order.releaseEligibleDate || "after grace"}).
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="w-full space-y-2">
                            <div className="w-full text-center py-2 text-xs text-[#10b981] font-semibold bg-emerald-950/20 border border-emerald-800/40 rounded-xl">
                              ✓{" "}
                              {order.status === "PRODUCTION_COMPLETED"
                                ? "QC Passed & Completed"
                                : order.status === "AWAITING_DISPATCH"
                                ? "QC Passed · 100% Paid · Awaiting Dispatch"
                                : order.status === "DISPATCHED" || order.status === "DELIVERED"
                                ? `Consignment ${order.status}`
                                : "Machining in Progress in Tavistra Workshop"}
                            </div>
                            <button
                              onClick={() => {
                                setQcOrderModal(order);
                                setQcNotesInput(order.qcNotes || "");
                                setQcImageInput(order.qcImages?.join("\n") || "");
                                setQcUploadError(null);
                              }}
                              className="w-full py-2.5 rounded-xl bg-[#2a2a30] border border-[#464037] text-xs font-semibold text-white hover:bg-[#34343c] transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4 text-[#c59b6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>
                                {order.qcImages && order.qcImages.length > 0
                                  ? `Manage QC Photos (${order.qcImages.length}) & Notes`
                                  : "Upload Workshop QC Photos & Review"}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 4: DISPATCH & AWB */}
        {activeTab === "DISPATCH" && (
          <div className="space-y-6">
            {actionFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                  actionFeedback.type === "error"
                    ? "bg-red-950/50 border-red-800/70 text-red-200"
                    : "bg-emerald-950/50 border-emerald-800/70 text-emerald-200"
                }`}
              >
                <span>{actionFeedback.text}</span>
                <button
                  onClick={() => setActionFeedback(null)}
                  className="text-[11px] opacity-75 hover:opacity-100 ml-4"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">Carrier Consignment & AWB Assignment</h2>
                <p className="text-xs text-[#a8a093]">
                  Assign verified shipping providers (Blue Dart, Safeexpress) and Air Waybill numbers. Updates customer tracking on /track in real-time.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-[#24211d] border border-[#38332c] flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">{order.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2a2a30] text-[#c59b6d]">
                        {order.mode}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#38332c] text-white">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#a8a093]">
                      Client: <strong className="text-white">{order.customerName}</strong> ({order.phone}) · Destination: {order.city}, {order.state} — {order.pincode}
                    </p>
                    <div className="text-xs text-[#a8a093]">
                      Carrier: <strong className="text-white">{order.carrierName}</strong> · AWB:{" "}
                      <strong className="font-mono text-[#c59b6d]">{order.awbNumber || "Pending Assignment"}</strong>
                    </div>
                  </div>

                  {order.status === "CANCELLED" || order.status === "REFUNDED" ? (
                    <span className="px-3.5 py-2 rounded-xl bg-red-950/30 border border-red-800/50 text-xs text-red-300 font-medium">
                      Cancelled — Dispatch Locked
                    </span>
                  ) : order.balanceDueRupees > 0 ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="px-3.5 py-2 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 flex items-center gap-2 font-medium">
                        <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>
                          Dispatch Blocked — 100% Payment Required. Balance Due: {formatPrice(order.balanceDueRupees)}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled
                        className="px-3.5 py-2 rounded-xl bg-[#2a2722] text-xs font-semibold text-[#787165] border border-[#38332c] cursor-not-allowed"
                      >
                        Packed & Dispatched (Locked)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyBalanceLink(order)}
                        className="px-3.5 py-2 rounded-xl bg-[#2a2a30] text-xs font-semibold text-[#c59b6d] hover:bg-[#34343c] border border-[#464037] transition-colors"
                      >
                        {copiedLinkOrderId === order.id ? "✓ Copied Balance Link" : "Copy Balance Link"}
                      </button>
                    </div>
                  ) : editingAwbId === order.id ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        placeholder="Carrier"
                        value={carrierInput}
                        onChange={(e) => setCarrierInput(e.target.value)}
                        className="rounded-xl border border-[#464037] bg-[#181715] px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="AWB Number"
                        value={awbInput}
                        onChange={(e) => setAwbInput(e.target.value)}
                        className="rounded-xl border border-[#464037] bg-[#181715] px-3 py-2 text-xs text-white font-mono"
                      />
                      <button
                        onClick={() => handleSaveAwb(order.id)}
                        className="px-4 py-2 rounded-xl bg-[#10b981] text-[#181715] font-semibold text-xs"
                      >
                        Packed & Dispatched
                      </button>
                      <button
                        onClick={() => setEditingAwbId(null)}
                        className="px-3 py-2 rounded-xl border border-[#464037] text-xs text-[#a8a093]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {order.status !== "DELIVERED" && (
                        <button
                          onClick={() => {
                            setEditingAwbId(order.id);
                            setCarrierInput(order.carrierName);
                            setAwbInput(order.awbNumber || "");
                          }}
                          className="px-4 py-2 rounded-xl bg-[#2a2a30] text-xs font-semibold text-white hover:bg-[#34343c] transition-colors"
                        >
                          {order.awbNumber ? "Edit AWB / Carrier" : "+ Assign Carrier & Packed & Dispatched"}
                        </button>
                      )}
                      {order.status === "DISPATCHED" && (
                        <button
                          onClick={() => handleMarkDelivered(order.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-700/70 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition-colors"
                        >
                          ✓ Mark Delivered
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SUPPORT TICKETS & CLIENT CONCIERGE DESK */}
        {activeTab === "TICKETS" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#38332c] pb-4 gap-4">
              <div>
                <h2 className="text-base font-semibold text-white">Client Desk Support Tickets</h2>
                <p className="text-xs text-[#a8a093]">
                  Two-way threaded client messaging, pre-production alteration requests during 7-day grace, and studio order coordination.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#a8a093]">
                  Showing <strong className="text-white">{filteredTickets.length}</strong> of {tickets.length} tickets
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#1e1c19] p-3.5 rounded-2xl border border-[#38332c]">
              {/* Search */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#a8a093] mb-1">
                  Search Tickets
                </label>
                <input
                  type="text"
                  placeholder="Ticket #, client, email, order..."
                  value={ticketSearchQuery}
                  onChange={(e) => setTicketSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#38332c] bg-[#181715] px-3 py-2 text-xs text-white placeholder-[#787165] focus:outline-none focus:border-[#c59b6d]"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#a8a093] mb-1">
                  Status
                </label>
                <select
                  value={ticketStatusFilter}
                  onChange={(e) => setTicketStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-[#38332c] bg-[#181715] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c59b6d]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">Open (Awaiting Response)</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#a8a093] mb-1">
                  Priority
                </label>
                <select
                  value={ticketPriorityFilter}
                  onChange={(e) => setTicketPriorityFilter(e.target.value)}
                  className="w-full rounded-xl border border-[#38332c] bg-[#181715] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c59b6d]"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="NORMAL">Normal Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent Priority</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#a8a093] mb-1">
                  Category
                </label>
                <select
                  value={ticketCategoryFilter}
                  onChange={(e) => setTicketCategoryFilter(e.target.value)}
                  className="w-full rounded-xl border border-[#38332c] bg-[#181715] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c59b6d]"
                >
                  <option value="ALL">All Categories</option>
                  <option value="ORDER_INQUIRY">Order Inquiry</option>
                  <option value="SPEC_ALTERATION">Spec Alteration</option>
                  <option value="DELIVERY_SCHEDULE">Delivery Schedule</option>
                  <option value="DAMAGE_REPORT">Damage Report</option>
                  <option value="CANCELLATION">Cancellation &amp; Refund</option>
                  <option value="GENERAL_ASSISTANCE">General Assistance</option>
                </select>
              </div>
            </div>

            {/* Main Workbench: Left List + Right Thread */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Tickets Worklist (Span 5) */}
              <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-1">
                {filteredTickets.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-[#24211d] border border-[#38332c] text-xs text-[#a8a093]">
                    No support tickets match the selected filters.
                  </div>
                ) : (
                  filteredTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedTicket?.id === t.id
                          ? "bg-[#2a2722] border-[#c59b6d]"
                          : "bg-[#24211d] border-[#38332c] hover:border-[#464037]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{t.ticketNumber}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              t.priority === "URGENT"
                                ? "bg-rose-950 text-rose-300 border border-rose-800"
                                : t.priority === "HIGH"
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : "bg-[#282830] text-[#a8a093]"
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            t.status === "OPEN"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : t.status === "IN_PROGRESS"
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-white line-clamp-1">{t.subject}</h4>
                      
                      <div className="flex items-center justify-between text-[11px] text-[#a8a093] mt-1.5">
                        <span className="truncate">{t.customerName}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#181715] text-[#a0a0aa]">
                          {t.category ? t.category.replace(/_/g, " ") : "GENERAL"}
                        </span>
                      </div>

                      {t.orderNumber && (
                        <div className="mt-2 text-[10px] font-mono text-[#c59b6d]">
                          Linked Consignment: {t.orderNumber}
                        </div>
                      )}

                      <span className="text-[10px] text-[#787165] block mt-2">{t.createdAt}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Right Column: Ticket Conversation & Resolution Panel (Span 7) */}
              <div className="lg:col-span-7 rounded-2xl bg-[#24211d] border border-[#38332c] p-6 space-y-5">
                {selectedTicket ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#38332c] pb-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-white">
                            {selectedTicket.ticketNumber}
                          </span>
                          {selectedTicket.orderNumber && (
                            <button
                              type="button"
                              onClick={() => {
                                const matched = orders.find(
                                  (o) => o.id === selectedTicket.orderNumber || o.orderNumber === selectedTicket.orderNumber
                                );
                                if (matched) {
                                  setSelectedOrder(matched);
                                  setActiveTab("ORDERS");
                                }
                              }}
                              className="font-mono text-xs text-[#c59b6d] bg-[#2a2722] px-2 py-0.5 rounded border border-[#464037] hover:border-[#c59b6d] transition-colors"
                              title="Click to view full order in Orders tab"
                            >
                              Linked: {selectedTicket.orderNumber} ↗
                            </button>
                          )}
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#2a2722] text-[#a0a0aa]">
                            {selectedTicket.category.replace(/_/g, " ")}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-white mt-1.5">{selectedTicket.subject}</h3>
                        <p className="text-xs text-[#a8a093] mt-0.5">
                          Client: <strong className="text-white">{selectedTicket.customerName}</strong> ({selectedTicket.phone}) · {selectedTicket.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status dropdown */}
                        <select
                          value={selectedTicket.status}
                          onChange={(e) =>
                            handleUpdateTicketStatus(
                              selectedTicket.id,
                              e.target.value as "OPEN" | "IN_PROGRESS" | "RESOLVED"
                            )
                          }
                          className="rounded-lg bg-[#2a2722] border border-[#464037] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#c59b6d]"
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>

                        {/* Priority dropdown */}
                        <select
                          value={selectedTicket.priority}
                          onChange={(e) =>
                            handleUpdateTicketPriority(
                              selectedTicket.id,
                              e.target.value as "NORMAL" | "HIGH" | "URGENT"
                            )
                          }
                          className="rounded-lg bg-[#2a2722] border border-[#464037] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#c59b6d]"
                        >
                          <option value="NORMAL">Normal Priority</option>
                          <option value="HIGH">High Priority</option>
                          <option value="URGENT">Urgent Priority</option>
                        </select>

                        {/* One-click Resolve Button */}
                        <button
                          onClick={() => handleResolveTicket(selectedTicket.id)}
                          disabled={selectedTicket.status === "RESOLVED"}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold hover:bg-emerald-900 disabled:opacity-40 transition-colors"
                        >
                          {selectedTicket.status === "RESOLVED" ? "✓ Resolved" : "Mark Resolved"}
                        </button>
                      </div>
                    </div>

                    {/* Messages Thread */}
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {selectedTicket.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-xl text-xs space-y-1.5 ${
                            msg.sender === "CUSTOMER"
                              ? "bg-[#2a2722] border border-[#38332c] text-[#eae6df]"
                              : "bg-[#2e2820] border border-[#c59b6d]/40 text-amber-100"
                          }`}
                        >
                          <div className="flex justify-between items-center text-[11px] font-semibold">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider ${
                                  msg.sender === "STAFF"
                                    ? "bg-[#c59b6d] text-[#181715]"
                                    : "bg-[#464037] text-white"
                                }`}
                              >
                                {msg.sender === "STAFF" ? "Studio Staff" : "Client"}
                              </span>
                              <span>{msg.authorName}</span>
                            </div>
                            <span className="text-[#a8a093] font-normal">{msg.timestamp}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Reply Form */}
                    <div className="pt-3 border-t border-[#38332c] space-y-3">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#a8a093]">
                        Compose Staff Response (Dispatches luxury email to client)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Type official studio response or operational instructions for the client..."
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        className="w-full rounded-xl border border-[#464037] bg-[#181715] p-3 text-xs text-white placeholder-[#787165] focus:outline-none focus:border-[#c59b6d] font-mono leading-relaxed"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#a8a093]">
                          Posting will automatically update ticket status to <strong className="text-amber-300">IN_PROGRESS</strong>.
                        </span>
                        <button
                          onClick={handleSendTicketReply}
                          disabled={!ticketReplyText.trim()}
                          className="px-5 py-2 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] disabled:opacity-40 transition-colors shadow-sm"
                        >
                          Send Official Reply
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-24 text-xs text-[#a8a093]">
                    Select a support ticket from the list to inspect thread history and post official studio responses.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMERS & PROFILES */}
        {activeTab === "CUSTOMERS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">Client Directory & Profiles</h2>
                <p className="text-xs text-[#a8a093]">
                  Architectural practices, corporate GSTIN identifiers, and lifetime consignment histories.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#38332c] bg-[#24211d] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1e1c19] border-b border-[#38332c] text-[11px] uppercase tracking-wider text-[#a8a093]">
                  <tr>
                    <th className="py-3 px-4">Client / Studio</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">GSTIN Tax ID</th>
                    <th className="py-3 px-4">Orders</th>
                    <th className="py-3 px-4">Lifetime Spend</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#38332c]">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-[#2a2722]/40 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-semibold text-white">{c.name}</p>
                        <p className="text-[11px] text-[#c59b6d]">{c.practiceOrStudio || "Private Client"}</p>
                      </td>
                      <td className="py-4 px-4 text-[#a8a093]">
                        <p>{c.email}</p>
                        <p className="text-[11px]">{c.phone}</p>
                      </td>
                      <td className="py-4 px-4">
                        {c.gstin ? (
                          <span className="font-mono text-[11px] text-[#10b981] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                            {c.gstin}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#787165]">Unregistered</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">{c.totalOrders}</td>
                      <td className="py-4 px-4 font-semibold text-white">{formatPrice(c.lifetimeSpendRupees)}</td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-3 py-1.5 rounded-lg bg-[#2a2a30] text-xs font-semibold text-white hover:bg-[#34343c]"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: INQUIRIES & PROPOSALS (TAV-07) */}
        {activeTab === "PROPOSALS" && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#38332c] pb-4">
              <div>
                <h2 className="text-base font-semibold text-white">Commercial Inquiries & 30-Day Architectural Proposals</h2>
                <p className="text-xs text-[#a8a093]">
                  Architectural trade inquiries, locked 30-day proposals (TAV-07), and verified 25% production advance conversions.
                </p>
              </div>
              <button
                onClick={() => {
                  setProposalForm({
                    inquiryId: "",
                    customerName: "",
                    customerEmail: "",
                    customerPhone: "",
                    deliveryPincode: "110001",
                    lineItems: [
                      {
                        name: "Bespoke Walnut Credenza with aged brass trim",
                        finish: "Hand-rubbed oil & antiqued brass",
                        quantity: 1,
                        unitPriceRupees: 65000,
                      },
                    ],
                    deliveryChargeRupees: 3500,
                    estimatedLeadWeeks: 6,
                    notes: "",
                  });
                  setIsProposalModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors shadow-sm"
              >
                + Issue Bespoke 30-Day Proposal
              </button>
            </div>

            {/* Section 1: Active 30-Day Quotations */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Formal 30-Day Locked Proposals ({proposals.length})</span>
                <span className="text-[10px] text-[#c59b6d] font-normal">TAV-07 Independent 30-Day Clock</span>
              </h3>

              {proposals.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#24211d] border border-[#38332c] text-center text-xs text-[#a8a093]">
                  No formal proposals issued yet. Issue a bespoke proposal from incoming inquiries below.
                </div>
              ) : (
                <div className="rounded-2xl border border-[#38332c] bg-[#24211d] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1e1c19] border-b border-[#38332c] text-[11px] uppercase tracking-wider text-[#a8a093]">
                      <tr>
                        <th className="py-3 px-4">Quote Number</th>
                        <th className="py-3 px-4">Client & Pincode</th>
                        <th className="py-3 px-4">Quoted Amount</th>
                        <th className="py-3 px-4">25% Advance</th>
                        <th className="py-3 px-4">Status & Clock</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#38332c]">
                      {proposals.map((p) => {
                        const latestVer = p.versions?.[0];
                        const amount = latestVer ? Number(latestVer.quotedAmount) : 0;
                        const advance = latestVer ? Number(latestVer.advanceRequired) : 0;
                        const isAccepted = p.status === "ACCEPTED";
                        const isExpired = p.status === "EXPIRED";

                        return (
                          <tr key={p.id} className="hover:bg-[#2a2722]/40 transition-colors">
                            <td className="py-4 px-4 font-mono font-bold text-white">
                              {p.quoteNumber}
                              <span className="block text-[10px] font-sans text-[#a8a093]">
                                Rev {latestVer?.versionNumber || 1}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-white">
                              {p.customerName}
                              <span className="block text-[10px] text-[#a8a093]">
                                {p.customerEmail} · PIN {p.deliveryPincode}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-semibold text-white">{formatPrice(amount)}</td>
                            <td className="py-4 px-4 font-semibold text-[#c59b6d]">{formatPrice(advance)}</td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                  isAccepted
                                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                    : isExpired
                                    ? "bg-rose-950 text-rose-300 border border-rose-800"
                                    : "bg-amber-950 text-amber-300 border border-amber-800"
                                }`}
                              >
                                {isAccepted ? "Accepted & Order Active" : isExpired ? "Offer Expired" : "30-Day Offer Active"}
                              </span>
                              {(p.linkedOrderNumber || p.linkedOrderId) && (
                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      const found = orders.find(
                                        (o) =>
                                          (p.linkedOrderNumber && o.orderNumber === p.linkedOrderNumber) ||
                                          (p.linkedOrderId && o.id === p.linkedOrderId)
                                      );
                                      if (found) setSelectedOrder(found);
                                    }}
                                    className="text-[10px] font-mono font-semibold text-[#10b981] hover:underline"
                                    title="Inspect converted order"
                                  >
                                    Order: {p.linkedOrderNumber || `${p.linkedOrderId?.slice(0, 12)}...`} ↗
                                  </button>
                                  {p.linkedOrderStatus && (
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${
                                        p.linkedOrderStatus === "CANCELLED" || p.linkedOrderStatus === "REFUNDED"
                                          ? "bg-rose-950 text-rose-300 border-rose-800"
                                          : "bg-emerald-950 text-emerald-300 border-emerald-800"
                                      }`}
                                    >
                                      {p.linkedOrderStatus === "CANCELLED" ? "CANCELLED & REFUNDED" : p.linkedOrderStatus}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right space-x-2">
                              {!isAccepted && !isExpired && (
                                <button
                                  onClick={() => handleOpenRevisionModal(p)}
                                  className="px-3 py-1.5 rounded-lg bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors"
                                >
                                  + Issue Revision (v{(latestVer?.versionNumber || 1) + 1})
                                </button>
                              )}
                              <a
                                href={getStorefrontUrl(`/quote/${p.quoteNumber}`)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-[#2a2a30] text-xs font-semibold text-[#c59b6d] hover:bg-[#34343c]"
                              >
                                View Proposal ↗
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 2: Incoming Bulk & Architectural Inquiries */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Incoming Commercial & Bulk Inquiries ({inquiries.length})</h3>
              <div className="rounded-2xl border border-[#38332c] bg-[#24211d] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1e1c19] border-b border-[#38332c] text-[11px] uppercase tracking-wider text-[#a8a093]">
                    <tr>
                      <th className="py-3 px-4">Inquiry Ref</th>
                      <th className="py-3 px-4">Client / Studio</th>
                      <th className="py-3 px-4">Requested Editions</th>
                      <th className="py-3 px-4">Units</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#38332c]">
                    {inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-[#2a2722]/40 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-white">
                          {inq.inquiryNumber || inq.id}
                          {inq.quoteNumber && (
                            <div className="mt-1">
                              <a
                                href={getStorefrontUrl(`/quote/${inq.quoteNumber}`)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono text-amber-300 bg-amber-950/80 border border-amber-800 hover:bg-amber-900"
                              >
                                Quote: {inq.quoteNumber} ↗
                              </a>
                            </div>
                          )}
                          {inq.orderNumber && (
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              <button
                                onClick={() => {
                                  const found = orders.find(
                                    (o) => o.orderNumber === inq.orderNumber || (inq.orderId && o.id === inq.orderId)
                                  );
                                  if (found) setSelectedOrder(found);
                                }}
                                className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-800 hover:underline"
                                title="Inspect converted order"
                              >
                                Order: {inq.orderNumber} ↗
                              </button>
                              {inq.orderStatus && (
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${
                                    inq.orderStatus === "CANCELLED" || inq.orderStatus === "REFUNDED"
                                      ? "bg-rose-950 text-rose-300 border-rose-800"
                                      : "bg-emerald-950 text-emerald-300 border-emerald-800"
                                  }`}
                                >
                                  {inq.orderStatus === "CANCELLED" ? "CANCELLED" : inq.orderStatus}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-white">
                          {inq.clientName}
                          <span className="block text-[10px] text-[#c59b6d]">{inq.practiceOrStudio || "Private Patron"}</span>
                          <span className="block text-[10px] text-[#a8a093]">{inq.email}</span>
                        </td>
                        <td className="py-4 px-4 text-white max-w-xs">{inq.requestedEditions}</td>
                        <td className="py-4 px-4 font-bold text-white">{inq.quantityUnits}</td>
                        <td className="py-4 px-4 text-[#a8a093]">
                          {inq.destinationCity} (PIN {inq.destinationPincode})
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              inq.status === "ORDER_CANCELLED"
                                ? "bg-rose-950 text-rose-300 border-rose-800"
                                : inq.status === "ORDER_CONFIRMED"
                                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                : inq.status === "QUOTE_ISSUED"
                                ? "bg-blue-950 text-blue-300 border border-blue-800"
                                : inq.status === "NEW"
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : "bg-[#2a2722] text-[#a8a093] border border-[#464037]"
                            }`}
                          >
                            {inq.status === "ORDER_CANCELLED"
                              ? "Order Cancelled & Refunded"
                              : inq.status === "ORDER_CONFIRMED"
                              ? "Converted to Order"
                              : inq.status === "QUOTE_ISSUED"
                              ? "Proposal Issued"
                              : inq.status === "NEW"
                              ? "New Inquiry"
                              : inq.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              const parsedItems =
                                inq.lineItems && inq.lineItems.length > 0
                                  ? inq.lineItems
                                  : parseInquiryLineItems(inq.lineItemsJson, inq.specifications);

                              const units = Math.max(1, inq.quantityUnits || 10);
                              const resolvedLineItems =
                                parsedItems.length > 0
                                  ? parsedItems.map((item) => ({
                                      name: item.name,
                                      finish: item.finish || "Studio Hand-Crafted Patina Finish",
                                      quantity: Math.max(1, Number(item.quantity) || 1),
                                      unitPriceRupees: Math.max(1, Number(item.unitPriceRupees) || 1000),
                                    }))
                                  : [
                                      {
                                        name: inq.requestedEditions || "Bespoke Architectural Editions",
                                        finish: "Studio Hand-Crafted Patina Finish",
                                        quantity: units,
                                        unitPriceRupees: Math.round(125000 / units),
                                      },
                                    ];

                              setProposalForm({
                                inquiryId: inq.id,
                                customerName: inq.clientName,
                                customerEmail: inq.email,
                                customerPhone: inq.phone,
                                deliveryPincode: inq.destinationPincode || "110001",
                                lineItems: resolvedLineItems,
                                deliveryChargeRupees: 4500,
                                estimatedLeadWeeks: 6,
                                notes: `Client Inquiry Brief (${inq.inquiryNumber || inq.id}):\n${inq.specifications || "Trade / hospitality consignment"}`,
                              });
                              setIsProposalModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors"
                          >
                            Issue 30-Day Proposal
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: CATALOGUE & PRODUCT REVIEW */}
        {activeTab === "CATALOGUE" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#38332c] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">Catalogue Editions & Live Inventory</h2>
                <p className="text-xs text-[#a8a093]">
                  Publish status, available workshop stock, and active reservations (TAV-02 & TAV-05). Click "Review Specs" to inspect full editorial copy, dimensions, and Markdown sources.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#38332c] border border-[#464037] text-xs font-semibold text-white hover:bg-[#464037] flex items-center gap-1.5"
                >
                  <span>📝</span> Import / Sync Markdown
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#38332c] bg-[#24211d] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1e1c19] border-b border-[#38332c] text-[11px] uppercase tracking-wider text-[#a8a093]">
                  <tr>
                    <th className="py-3 px-4">Product Work</th>
                    <th className="py-3 px-4">Category / Taxon</th>
                    <th className="py-3 px-4">Purchase Mode</th>
                    <th className="py-3 px-4">Pricing</th>
                    <th className="py-3 px-4">Variants / Editions</th>
                    <th className="py-3 px-4">Stock Ledger</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#38332c]">
                  {catalogue.map((item) => (
                    <tr key={item.id} className="hover:bg-[#2a2722]/40 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          {item.primaryImageUrl ? (
                            <img
                              src={item.primaryImageUrl}
                              alt={item.name}
                              className="h-10 w-10 rounded-lg object-cover border border-[#464037] shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-[#2a2722] border border-[#464037] flex items-center justify-center text-[10px] text-[#c59b6d] font-bold shrink-0">
                              ED
                            </div>
                          )}
                          <div>
                            <span className="text-white block">{item.name}</span>
                            <span className="block text-[10px] font-mono text-[#a8a093]">
                              {item.sku ? `${item.sku} · ` : ""}{item.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#a8a093]">
                        <span className="text-white block">{item.category}</span>
                        {item.subcategory && (
                          <span className="text-[10px] text-[#c59b6d] block">{item.subcategory}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2a2a30] text-[#c59b6d]">
                          {item.mode}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">
                        {item.isVariablePrice && item.minPriceRupees
                          ? `From ${formatPrice(item.minPriceRupees)}`
                          : formatPrice(item.priceRupees)}
                      </td>
                      <td className="py-4 px-4 text-xs text-[#a8a093]">
                        {item.variants && item.variants.length > 0 ? (
                          <span>
                            <strong className="text-white">{item.variants.length}</strong> edition(s)
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#787165]">Standard</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {item.mode === "READY_STOCK" ? (
                          <div className="text-[11px]">
                            <span className="text-[#10b981] font-semibold">{item.availableStock} Available</span>
                            {item.reservedStock > 0 && (
                              <span className="text-[#f59e0b] block">({item.reservedStock} Reserved)</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#a8a093]">Workshop On-Demand</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => setReviewedProduct(item)}
                          className="px-3 py-1 rounded-lg bg-[#2a2722] text-white border border-[#464037] text-xs font-semibold hover:bg-[#38332c]"
                        >
                          Review Specs
                        </button>
                        <button
                          onClick={() => handleTogglePublish(item.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            item.isPublished
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
                              : "bg-[#2a2a30] text-[#787165] hover:text-white"
                          }`}
                        >
                          {item.isPublished ? "Published" : "Draft"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: DELIVERY PIN CODES & SLABS */}
        {activeTab === "PINCODES" && (
          <LogisticsTab
            staffName={currentStaff.name}
            staffRole={currentStaff.role}
            onLogAudit={logAuditAction}
            onPincodesUpdated={(rows) => setPincodes(rows as any)}
          />
        )}

        {/* TAB 9: SYSTEM & SETTINGS */}
        {activeTab === "SETTINGS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">System Settings & Infrastructure</h2>
                <p className="text-xs text-[#a8a093]">
                  Maintenance controls, transactional SMTP infrastructure mapping, and state backup exports.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Maintenance Mode & Studio Hiatus Governance */}
              <div className="p-6 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-5">
                <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
                  <div>
                    <h3 className="font-semibold text-sm text-white">Storefront Checkout Freeze (Maintenance)</h3>
                    <p className="text-[11px] text-[#a8a093]">
                      Freezes checkout and transactions while keeping product catalog reviewable.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleMaintenance}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      maintenanceMode
                        ? "bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900"
                        : "bg-[#2a2722] text-[#a8a093] border border-[#464037] hover:text-white"
                    }`}
                  >
                    {maintenanceMode ? "Maintenance Active" : "Storefront Live"}
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
                  <div>
                    <h3 className="font-semibold text-sm text-white">Studio Hiatus Banner</h3>
                    <p className="text-[11px] text-[#a8a093]">
                      Displays top notification bar alerting patrons of scheduled studio pauses.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleHiatus}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      studioHiatus
                        ? "bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900"
                        : "bg-[#2a2722] text-[#a8a093] border border-[#464037] hover:text-white"
                    }`}
                  >
                    {studioHiatus ? "Hiatus Banner ON" : "Banner Hidden"}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white block">
                    Storefront Broadcast Announcement Text
                  </label>
                  <textarea
                    rows={2}
                    value={announcementBanner}
                    onChange={(e) => setAnnouncementBanner(e.target.value)}
                    className="w-full rounded-xl border border-[#464037] bg-[#16161a] p-3 text-xs text-white placeholder-[#787165] focus:border-[#c59b6d] focus:outline-none"
                    placeholder="Enter announcement text to broadcast to storefront visitors..."
                  />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#a8a093]">
                      Broadcasts live on the storefront header.
                    </span>
                    <button
                      onClick={handleSaveAnnouncement}
                      disabled={isSavingSettings}
                      className="px-4 py-1.5 rounded-lg bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors disabled:opacity-50"
                    >
                      {isSavingSettings ? "Saving..." : settingsSaveSuccess ? "Saved ✓" : "Save Announcement"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Transactional Email (SMTP) Infrastructure */}
              <div className="p-6 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-3">
                <h3 className="font-semibold text-sm text-white">Transactional Email Architecture (SMTP)</h3>
                <div className="p-3.5 rounded-xl bg-[#2a2722] border border-[#38332c] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#a8a093]">Target SMTP Host:</span>
                    <strong className="text-white font-mono">devMachine (192.168.1.100) / VPS</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a8a093]">Local Machine Policy:</span>
                    <span className="text-[#10b981] font-semibold">Zero Local Mail Services (Protected)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a8a093]">Mail Flow:</span>
                    <span className="text-[#c59b6d]">Queued Order Confirmations & Tickets</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#a8a093] leading-relaxed">
                  Per repository operating rules, no local SMTP daemon is installed on this Windows workstation. Outbound notification queues and test relays run exclusively on the Debian devMachine or external provider.
                </p>
              </div>

              {/* Card 3: Data Export & Backup */}
              <div className="p-6 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-3">
                <h3 className="font-semibold text-sm text-white">Operational Snapshot Backup</h3>
                <p className="text-xs text-[#a8a093] leading-relaxed">
                  Export the complete operational state (orders, customer profiles, support tickets, delivery PIN whitelist, and audit logs) as a timestamped JSON file.
                </p>
                <button
                  onClick={handleExportStateSnapshot}
                  className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors shadow-sm"
                >
                  Download State Snapshot JSON
                </button>
              </div>

              {/* Card 4: Legal Entity & Statutory GST Invoice Configuration */}
              <div className="md:col-span-2 p-6 rounded-2xl bg-[#24211d] border border-[#38332c] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#38332c] pb-3 gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                      <span>Legal Entity &amp; Statutory GST Invoice Configuration</span>
                      <span className="text-[10px] bg-[#c59b6d]/20 text-[#c59b6d] px-2 py-0.5 rounded font-mono">
                        Rule 46 &amp; Rule 53 Compliant
                      </span>
                    </h3>
                    <p className="text-[11px] text-[#a8a093]">
                      Authoritative legal details printed on customer GST Tax Invoices, Credit Notes, and statutory PDF downloads.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveSellerDetails}
                    disabled={isSavingSellerDetails}
                    className="px-5 py-2 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors disabled:opacity-50 shrink-0 shadow-sm"
                  >
                    {isSavingSellerDetails ? "Saving..." : sellerDetailsSaveSuccess ? "Saved to Database ✓" : "Save Legal Details"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-[11px] text-[#a8a093] font-medium block mb-1">
                      Legal Entity Name (Registered)
                    </label>
                    <input
                      type="text"
                      value={sellerDetails.legalEntityName}
                      onChange={(e) => setSellerDetails({ ...sellerDetails, legalEntityName: e.target.value })}
                      className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white placeholder-[#787165] focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#a8a093] font-medium block mb-1">
                      Brand / Trade Name
                    </label>
                    <input
                      type="text"
                      value={sellerDetails.brandName}
                      onChange={(e) => setSellerDetails({ ...sellerDetails, brandName: e.target.value })}
                      className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white placeholder-[#787165] focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#a8a093] font-medium block mb-1">
                      Business Unit Relationship Line
                    </label>
                    <input
                      type="text"
                      value={sellerDetails.businessUnitLine}
                      onChange={(e) => setSellerDetails({ ...sellerDetails, businessUnitLine: e.target.value })}
                      className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white placeholder-[#787165] focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="text-[11px] text-[#a8a093] font-medium block mb-1">
                      GSTIN (15-Character)
                    </label>
                    <input
                      type="text"
                      value={sellerDetails.gstin}
                      onChange={(e) => setSellerDetails({ ...sellerDetails, gstin: e.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white font-mono placeholder-[#787165] focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#a8a093] font-medium block mb-1">
                      Permanent Account Number (PAN)
                    </label>
                    <input
                      type="text"
                      value={sellerDetails.pan}
                      onChange={(e) => setSellerDetails({ ...sellerDetails, pan: e.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white font-mono placeholder-[#787165] focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#a8a093] font-medium block mb-1">
                      Support Email
                    </label>
                    <input
                      type="text"
                      value={sellerDetails.supportEmail}
                      onChange={(e) => setSellerDetails({ ...sellerDetails, supportEmail: e.target.value })}
                      className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white placeholder-[#787165] focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#a8a093] font-medium block mb-1">
                      Support Desk Hours
                    </label>
                    <input
                      type="text"
                      value={sellerDetails.deskHours}
                      onChange={(e) => setSellerDetails({ ...sellerDetails, deskHours: e.target.value })}
                      className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white placeholder-[#787165] focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-[#a8a093] font-medium block mb-1">
                      Registered Address Line 1
                    </label>
                    <input
                      type="text"
                      value={sellerDetails.registeredAddressLine1}
                      onChange={(e) => setSellerDetails({ ...sellerDetails, registeredAddressLine1: e.target.value })}
                      className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white placeholder-[#787165] focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#a8a093] font-medium block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={sellerDetails.city}
                      onChange={(e) => setSellerDetails({ ...sellerDetails, city: e.target.value })}
                      className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white placeholder-[#787165] focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#a8a093] font-medium block mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={sellerDetails.pincode}
                      onChange={(e) => setSellerDetails({ ...sellerDetails, pincode: e.target.value })}
                      className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white font-mono placeholder-[#787165] focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-[11px] text-[#a8a093] font-medium block mb-1">
                      State Name
                    </label>
                    <input
                      type="text"
                      value={sellerDetails.state}
                      onChange={(e) => setSellerDetails({ ...sellerDetails, state: e.target.value })}
                      className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white placeholder-[#787165] focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#a8a093] font-medium block mb-1">
                      GST State Code (e.g. 07 for Delhi)
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={sellerDetails.stateCode}
                      onChange={(e) => setSellerDetails({ ...sellerDetails, stateCode: e.target.value })}
                      className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white font-mono placeholder-[#787165] focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#a8a093] font-medium block mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={sellerDetails.country}
                      onChange={(e) => setSellerDetails({ ...sellerDetails, country: e.target.value })}
                      className="w-full rounded-xl border border-[#464037] bg-[#16161a] px-3 py-2 text-white placeholder-[#787165] focus:border-[#c59b6d] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: IMMUTABLE AUDIT LOG */}
        {activeTab === "AUDIT" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">Immutable Operational Audit Trail (TAV-12)</h2>
                <p className="text-xs text-[#a8a093]">
                  Append-only chronological log of all sensitive staff operations, production releases, refunds, and AWB entries.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#38332c] bg-[#24211d] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1e1c19] border-b border-[#38332c] text-[11px] uppercase tracking-wider text-[#a8a093]">
                  <tr>
                    <th className="py-3 px-4">Timestamp (IST)</th>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Operation Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#38332c]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#2a2722]/40 transition-colors font-mono">
                      <td className="py-3.5 px-4 text-[11px] text-[#a8a093] whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">{log.staffName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2a2722] text-[#c59b6d] border border-[#464037]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-white">
                        {log.entityType}: {log.entityId}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-xs text-[#a8a093]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </>
      )}
      </main>

      {/* Workspace Footer with Parent Entity */}
      <footer className="mt-auto px-8 py-4 border-t border-[#38332c] text-[11px] text-[#787165] flex flex-wrap items-center justify-between gap-4 bg-[#1a1816]/60">
        <div className="flex items-center gap-2">
          <span>Tavistra Studio Admin</span>
          <span>·</span>
          <span>A business unit of</span>
          <img
            src="/vdesign-dark.png"
            alt="VDesign"
            className="h-3.5 w-auto object-contain invert opacity-70"
          />
        </div>
        <div>
          <span>Active Session: {currentStaff.name} ({currentStaff.roleLabel})</span>
        </div>
      </footer>
    </div>

      {/* MODAL 1: Selected Order Slide-Over */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#24211d] border border-[#38332c] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#38332c] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-white">{selectedOrder.orderNumber}</span>
                  {selectedOrder.quoteNumber && (
                    <a
                      href={getStorefrontUrl(`/quote/${selectedOrder.quoteNumber}`)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 transition-colors"
                    >
                      Originating Quote: {selectedOrder.quoteNumber} ↗
                    </a>
                  )}
                </div>
                <p className="text-xs text-[#a8a093]">Placed {selectedOrder.placedAt}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-xs text-[#a8a093] hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-[#a8a093] block">Client Contact:</strong>
                  <p className="text-white font-semibold">{selectedOrder.customerName}</p>
                  <p className="text-[#a8a093]">{selectedOrder.email}</p>
                  <p className="text-[#a8a093]">{selectedOrder.phone}</p>
                </div>
                <div>
                  <strong className="text-[#a8a093] block">Delivery Location:</strong>
                  <p className="text-white">{selectedOrder.address}</p>
                  <p className="text-white">{selectedOrder.city}, {selectedOrder.state} — {selectedOrder.pincode}</p>
                </div>
              </div>

              <div>
                <strong className="text-[#a8a093] block mb-1">Acquired Pieces:</strong>
                <div className="rounded-xl border border-[#38332c] bg-[#16161a] divide-y divide-[#38332c]">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between">
                      <span className="text-white">{item.name} × {item.quantity}</span>
                      <span className="font-semibold text-white">{formatPrice(item.priceRupees * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.status === "CANCELLED" || selectedOrder.status === "REFUNDED" ? (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-red-800/40 pb-2">
                    <strong className="text-red-300 font-semibold flex items-center gap-1.5 text-xs">
                      <span>⚠️</span> Consignment Cancelled · 100% Pre-Production Statutory Refund
                    </strong>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-900 text-white">
                      {selectedOrder.refund?.status || "COMPLETED"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-red-200/90">
                    <div>
                      <span className="text-[#a8a093] block text-[10px] uppercase font-semibold">100% Refund Amount</span>
                      <p className="font-mono font-bold text-white text-base">
                        {formatPrice(selectedOrder.refund?.amountRupees ?? selectedOrder.amountPaidRupees)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#a8a093] block text-[10px] uppercase font-semibold">Cancellation Date</span>
                      <p className="text-white font-medium">
                        {selectedOrder.cancelledAt || selectedOrder.placedAt}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-red-800/40 space-y-2">
                    <label className="text-[11px] text-[#a8a093] block font-semibold">
                      Gateway Refund / Bank UTR Reference:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={refundUtrInput}
                        onChange={(e) => setRefundUtrInput(e.target.value)}
                        placeholder="e.g. REF-173143... or UTR12345678"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#141416] border border-[#464037] text-white font-mono text-xs focus:outline-none focus:border-[#c59b6d]"
                      />
                      <button
                        type="button"
                        disabled={isUpdatingRefund || !refundUtrInput.trim()}
                        onClick={() => handleUpdateRefundReference(selectedOrder.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors disabled:opacity-50"
                      >
                        {isUpdatingRefund ? "Saving..." : "Save UTR"}
                      </button>
                    </div>
                    <p className="text-[10px] text-[#a8a093]">
                      Gateway: {selectedOrder.refund?.gateway || "PHONEPE_REFUND"} · Verified: {selectedOrder.refund?.verifiedAt || "Recorded"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#2a2722] space-y-2">
                  <div className="flex justify-between text-[#a8a093]">
                    <span>Component 1: Items (Tax-Inclusive):</span>
                    <span className="text-white font-semibold">{formatPrice(selectedOrder.itemsSubtotalRupees)}</span>
                  </div>
                  <div className="flex justify-between text-[#a8a093]">
                    <span>Component 2: Insured Delivery Fee:</span>
                    <span className="text-white font-semibold">{formatPrice(selectedOrder.deliveryFeeRupees)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#38332c] font-bold text-white">
                    <span>Total Order Value:</span>
                    <span>{formatPrice(selectedOrder.totalAmountRupees)}</span>
                  </div>
                  <div className="flex justify-between text-[#10b981] font-semibold">
                    <span>Amount Verified Paid:</span>
                    <span>{formatPrice(selectedOrder.amountPaidRupees)}</span>
                  </div>
                  {selectedOrder.balanceDueRupees > 0 ? (
                    <div className="flex justify-between text-[#f59e0b] font-semibold">
                      <span>Pre-Dispatch Balance Due (75%):</span>
                      <span>{formatPrice(selectedOrder.balanceDueRupees)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-[#10b981] font-semibold">
                      <span>Payment Settlement:</span>
                      <span>100% Paid & Cleared</span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#16161a] border border-[#38332c] space-y-1 text-[11px] text-[#a8a093]">
                <div className="flex justify-between">
                  <span>Milestone Status:</span>
                  <strong className="text-white">{selectedOrder.status}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Carrier & AWB:</span>
                  <strong className="text-white">
                    {selectedOrder.carrierName} {selectedOrder.awbNumber ? `(${selectedOrder.awbNumber})` : "(Pending)"}
                  </strong>
                </div>
                {selectedOrder.qcImages && selectedOrder.qcImages.length > 0 && (
                  <div className="pt-2">
                    <span className="block mb-1.5 text-white font-semibold">
                      Uploaded QC Inspection Photos ({selectedOrder.qcImages.length}):
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedOrder.qcImages.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`QC ${i + 1}`}
                          className="h-16 w-full object-cover rounded-lg border border-[#38332c]"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#38332c] pt-4">
              {selectedOrder.status !== "CANCELLED" &&
              selectedOrder.status !== "REFUNDED" &&
              selectedOrder.status !== "DISPATCHED" &&
              selectedOrder.status !== "DELIVERED" ? (
                <button
                  type="button"
                  onClick={async () => {
                    await handleCancelOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-950/70 text-xs font-semibold text-red-300 border border-red-800 hover:bg-red-900 transition-colors"
                >
                  Cancel Order & 100% Refund
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-[#38332c] text-xs font-semibold text-white hover:bg-[#464037]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Product Review Modal */}
      {reviewedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#24211d] border border-[#38332c] p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#38332c] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#c59b6d] tracking-wider block">
                  Product Editorial & Commercial Review
                </span>
                <h3 className="font-semibold text-lg text-white">{reviewedProduct.name}</h3>
                <p className="text-xs text-[#a8a093]">Category: {reviewedProduct.category}</p>
              </div>
              <button
                onClick={() => setReviewedProduct(null)}
                className="text-xs text-[#a8a093] hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Product Gallery Images Preview in Review Modal */}
              {reviewedProduct.imageUrls && reviewedProduct.imageUrls.length > 0 && (
                <div className="space-y-2">
                  <strong className="text-[#a8a093] block">Attached Media Gallery ({reviewedProduct.imageUrls.length}):</strong>
                  <div className="flex flex-wrap gap-2">
                    {reviewedProduct.imageUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative h-16 w-20 rounded-lg overflow-hidden border border-[#464037] hover:border-[#c59b6d] transition-all shrink-0"
                      >
                        <img src={url} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#2a2722] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#a8a093]">Purchase Mode:</span>
                  <span className="font-semibold text-[#c59b6d]">{reviewedProduct.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a8a093]">Tax-Inclusive Price:</span>
                  <span className="font-semibold text-white">
                    {reviewedProduct.isVariablePrice && reviewedProduct.minPriceRupees
                      ? `From ${formatPrice(reviewedProduct.minPriceRupees)}`
                      : formatPrice(reviewedProduct.priceRupees)}
                  </span>
                </div>
                {reviewedProduct.subcategory && (
                  <div className="flex justify-between">
                    <span className="text-[#a8a093]">Subcategory:</span>
                    <span className="text-white font-medium">{reviewedProduct.subcategory}</span>
                  </div>
                )}
                {reviewedProduct.productType && (
                  <div className="flex justify-between">
                    <span className="text-[#a8a093]">Product Type:</span>
                    <span className="text-[#c59b6d] font-mono">{reviewedProduct.productType}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#a8a093]">Dimensions:</span>
                  <span className="text-white font-mono">{reviewedProduct.dimensions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a8a093]">Net Product Weight:</span>
                  <span className="text-white font-mono">{(reviewedProduct.weightGrams / 1000).toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a8a093]">Packed Weight vs Volumetric:</span>
                  <span className="text-white font-mono">
                    {reviewedProduct.packedWeightKg} kg actual / {reviewedProduct.packedVolumetricKg} kg volumetric
                  </span>
                </div>
              </div>

              {/* Variants Breakdown in Review Modal */}
              {reviewedProduct.variants && reviewedProduct.variants.length > 0 && (
                <div className="space-y-2">
                  <strong className="text-[#a8a093] block">Configured Editions / Variants ({reviewedProduct.variants.length}):</strong>
                  <div className="divide-y divide-[#38332c] border border-[#38332c] rounded-xl overflow-hidden bg-[#16161a]">
                    {reviewedProduct.variants.map((v) => (
                      <div key={v.id} className="p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {v.imageUrl && (
                              <img src={v.imageUrl} alt={v.title} className="h-8 w-8 rounded object-cover border border-[#464037]" />
                            )}
                            <div>
                              <span className="text-white font-medium block">{v.title}</span>
                              <span className="text-[10px] text-[#a8a093] font-mono">{v.sku}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[#c59b6d] font-semibold block">{formatPrice(v.priceRupees)}</span>
                            <span className="text-[10px] text-emerald-400">{v.stock} in stock</span>
                          </div>
                        </div>
                        {(v.dimensions || v.weightGrams || v.description || v.materialFinish) && (
                          <div className="pl-10 text-[10px] text-[#a8a093] space-y-0.5">
                            {v.materialFinish && <div>Finish: <span className="text-white">{v.materialFinish}</span></div>}
                            {v.dimensions && <div>Dimensions: <span className="text-white">{v.dimensions}</span></div>}
                            {v.weightGrams && <div>Weight: <span className="text-white">{(v.weightGrams / 1000).toFixed(2)} kg</span></div>}
                            {v.description && <div className="italic text-[#c59b6d]">{v.description}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <strong className="text-[#a8a093] block mb-1">Editorial Description:</strong>
                <p className="p-3 rounded-xl bg-[#16161a] border border-[#38332c] text-white leading-relaxed">
                  {reviewedProduct.fullDescription}
                </p>
              </div>

              <div>
                <strong className="text-[#a8a093] block mb-1">Materials & Fine Craft:</strong>
                <div className="flex flex-wrap gap-2">
                  {reviewedProduct.materials.map((mat, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#2a2a30] text-white text-[11px]">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#2a2722] border border-[#38332c] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#a8a093] tracking-wider block">
                  Markdown Source Reference (Architecture Spec)
                </span>
                <p className="font-mono text-[11px] text-[#c59b6d]">{reviewedProduct.markdownFile}</p>
                <p className="text-[11px] text-[#a8a093]">{reviewedProduct.returnPolicy}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#38332c]">
              <div className="flex items-center gap-3">
                <a
                  href={`http://localhost:3000/product/${reviewedProduct.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[#c59b6d] hover:underline"
                >
                  Open in Public Storefront ↗
                </a>
                <button
                  onClick={() => {
                    handleTogglePublish(reviewedProduct.id);
                    setReviewedProduct({
                      ...reviewedProduct,
                      isPublished: !reviewedProduct.isPublished,
                    });
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    reviewedProduct.isPublished
                      ? "bg-[#2a2a30] text-[#f43f5e] hover:bg-[#34343c]"
                      : "bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
                  }`}
                >
                  {reviewedProduct.isPublished ? "Switch to Draft" : "Publish to Storefront"}
                </button>
              </div>
              <button
                onClick={() => setReviewedProduct(null)}
                className="px-5 py-2 rounded-xl bg-[#38332c] text-xs font-semibold text-white hover:bg-[#464037]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Customer Profile Inspector */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#24211d] border border-[#38332c] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
              <div>
                <h3 className="font-semibold text-base text-white">{selectedCustomer.name}</h3>
                <p className="text-xs text-[#c59b6d]">{selectedCustomer.practiceOrStudio || "Private Client"}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-xs text-[#a8a093] hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-[#2a2722] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#a8a093]">Email:</span>
                  <span className="text-white font-semibold">
                    {selectedCustomer.email}{" "}
                    {selectedCustomer.emailVerified && (
                      <span className="ml-1.5 text-[10px] text-emerald-400">(Verified)</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a8a093]">Mobile Phone:</span>
                  <span className="text-white font-semibold">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a8a093]">Practice / Studio:</span>
                  <span className="text-white">
                    {selectedCustomer.practiceOrStudio || "Private Client"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a8a093]">GSTIN Identifier:</span>
                  <span className="font-mono text-[#10b981] font-bold">
                    {selectedCustomer.gstin || "None (Retail Client)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a8a093]">Primary Location:</span>
                  <span className="text-white">
                    {selectedCustomer.city}, {selectedCustomer.state} ({selectedCustomer.pincode})
                  </span>
                </div>
              </div>

              {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                <div className="p-3 rounded-xl bg-[#1e1c19] border border-[#38332c] space-y-2 max-h-40 overflow-y-auto">
                  <span className="text-[10px] text-[#a8a093] uppercase font-semibold block">
                    Saved Delivery Addresses ({selectedCustomer.addresses.length})
                  </span>
                  {selectedCustomer.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="text-[11px] text-[#d0d0d8] border-t border-[#38332c] pt-1.5 first:border-t-0 first:pt-0"
                    >
                      <div className="flex justify-between font-semibold text-white">
                        <span>{addr.label} · {addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] text-emerald-400 uppercase">Default</span>
                        )}
                      </div>
                      <p className="text-[#a8a093]">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ""} — {addr.city}, {addr.state} ({addr.pincode})
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#1e1c19] border border-[#38332c] text-center">
                  <span className="text-[10px] text-[#a8a093] uppercase block">Lifetime Orders</span>
                  <strong className="text-lg text-white">{selectedCustomer.totalOrders}</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#1e1c19] border border-[#38332c] text-center">
                  <span className="text-[10px] text-[#a8a093] uppercase block">Lifetime Spend</span>
                  <strong className="text-lg text-white">{formatPrice(selectedCustomer.lifetimeSpendRupees)}</strong>
                </div>
              </div>

              {selectedCustomer.notes && (
                <div className="p-3 rounded-xl bg-[#2a2722] border border-[#38332c]">
                  <strong className="text-[11px] text-[#a8a093] block mb-0.5">Staff Internal Notes:</strong>
                  <p className="text-white text-xs">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-[#38332c] text-xs font-semibold text-white hover:bg-[#464037]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WORKSHOP QC INSPECTION & CUSTOMER TRANSPARENCY */}
      {qcOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#464037] bg-[#24211d] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#38332c] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#c59b6d] block">
                  Studio Workshop Quality Control
                </span>
                <h3 className="font-semibold text-white text-base">
                  QC Inspection & Customer Photo Upload
                </h3>
                <p className="text-xs text-[#a8a093]">
                  Order: <strong className="font-mono text-white">{qcOrderModal.orderNumber}</strong> · Client: {qcOrderModal.customerName}
                </p>
              </div>
              <button
                onClick={() => setQcOrderModal(null)}
                className="text-[#a8a093] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-white font-semibold">
                  Craftsman Quality Control Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Hand-beveled brass edges polished and verified. Clear coat baked."
                  value={qcNotesInput}
                  onChange={(e) => setQcNotesInput(e.target.value)}
                  className="w-full rounded-xl border border-[#464037] bg-[#181715] p-3 text-xs text-white placeholder-[#787165] focus:outline-none focus:border-[#c59b6d]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-white font-semibold">
                    Workshop QC Photos (Upload from Computer or Paste URLs)
                  </label>
                  <label className="cursor-pointer rounded-lg bg-[#2a2a30] border border-[#464037] px-3 py-1.5 text-[11px] font-semibold text-[#c59b6d] hover:bg-[#34343c] transition-colors">
                    {isUploadingQc ? "Uploading..." : "+ Upload Image Files"}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      multiple
                      disabled={isUploadingQc}
                      onChange={(e) => {
                        void handleQcFileUpload(e.target.files);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {qcUploadError && (
                  <div className="rounded-lg border border-red-800/70 bg-red-950/50 p-2.5 text-[11px] text-red-200">
                    {qcUploadError}
                  </div>
                )}

                {qcImageInput
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {qcImageInput
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((imgUrl, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-[#38332c] aspect-[16/10] bg-[#181715]">
                          <img src={imgUrl} alt={`QC preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const next = qcImageInput
                                .split("\n")
                                .map((s) => s.trim())
                                .filter((u, i) => u && i !== idx);
                              setQcImageInput(next.join("\n"));
                            }}
                            className="absolute top-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] text-white opacity-90 hover:opacity-100"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                <textarea
                  rows={3}
                  placeholder="/uploads/qc/TAV-.../photo-1.jpg&#10;https://.../photo-2.jpg"
                  value={qcImageInput}
                  onChange={(e) => setQcImageInput(e.target.value)}
                  className="w-full rounded-xl border border-[#464037] bg-[#181715] p-3 text-xs font-mono text-white placeholder-[#787165] focus:outline-none focus:border-[#c59b6d]"
                />
                <p className="text-[11px] text-[#a8a093]">
                  Uploaded photos are stored in `/uploads/qc/{qcOrderModal.orderNumber}/` and rendered inside the customer's /track and account order portal.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#2a2722] border border-[#38332c] text-[11px] text-[#a8a093]">
                Financial Status: Verified Advance ₹{qcOrderModal.amountPaidRupees.toLocaleString("en-IN")} · Balance Due: ₹{qcOrderModal.balanceDueRupees.toLocaleString("en-IN")}.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#38332c]">
              <button
                type="button"
                onClick={() => setQcOrderModal(null)}
                className="px-4 py-2 rounded-xl border border-[#464037] text-xs text-[#a8a093] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQc}
                className="px-5 py-2 rounded-xl bg-[#10b981] text-[#181715] font-semibold text-xs hover:bg-[#059669] transition-colors"
              >
                Publish QC Photos to Customer Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Issue 30-Day Formal Architectural Proposal (TAV-07) */}
      {isProposalModalOpen && (() => {
        const itemsSubtotal = proposalForm.lineItems.reduce(
          (sum, it) => sum + (Number(it.quantity) || 1) * (Number(it.unitPriceRupees) || 0),
          0
        );
        const delivery = Math.max(0, Number(proposalForm.deliveryChargeRupees) || 0);
        const totalQuoted = itemsSubtotal + delivery;
        const advanceRequired = Math.round(totalQuoted * 0.25);
        const balanceDue = totalQuoted - advanceRequired;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-[#24211d] border border-[#38332c] p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#c59b6d] tracking-wider block">
                    Commercial Offer Engine · TAV-07
                  </span>
                  <h3 className="font-semibold text-base text-white">Issue 30-Day Locked Architectural Proposal</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProposalModalOpen(false)}
                  className="text-xs text-[#a8a093] hover:text-white"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleCreateProposal} className="space-y-5 text-xs">
                {/* Client Identifiers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-white font-semibold">Client Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={proposalForm.customerName}
                      onChange={(e) => setProposalForm({ ...proposalForm, customerName: e.target.value })}
                      className="w-full rounded-xl border border-[#464037] bg-[#181715] p-2.5 text-white focus:outline-none focus:border-[#c59b6d]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white font-semibold">Client Email (Proposal Destination) *</label>
                    <input
                      type="email"
                      required
                      value={proposalForm.customerEmail}
                      onChange={(e) => setProposalForm({ ...proposalForm, customerEmail: e.target.value })}
                      className="w-full rounded-xl border border-[#464037] bg-[#181715] p-2.5 text-white focus:outline-none focus:border-[#c59b6d]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-white font-semibold">Client Contact Phone</label>
                    <input
                      type="text"
                      value={proposalForm.customerPhone}
                      onChange={(e) => setProposalForm({ ...proposalForm, customerPhone: e.target.value })}
                      className="w-full rounded-xl border border-[#464037] bg-[#181715] p-2.5 text-white focus:outline-none focus:border-[#c59b6d]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white font-semibold">Destination Delivery PIN (6-Digit) *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={proposalForm.deliveryPincode}
                      onChange={(e) => setProposalForm({ ...proposalForm, deliveryPincode: e.target.value.replace(/\D/g, "") })}
                      className="w-full rounded-xl border border-[#464037] bg-[#181715] p-2.5 font-mono text-white focus:outline-none focus:border-[#c59b6d]"
                    />
                  </div>
                </div>

                {/* Bespoke Line Items Editor */}
                <div className="space-y-3 pt-2 border-t border-[#38332c]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">Bespoke Architectural Line Items ({proposalForm.lineItems.length})</h4>
                      <p className="text-[11px] text-[#a8a093]">Add individual custom editions, materials, and artisan finish specifications.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setProposalForm({
                          ...proposalForm,
                          lineItems: [
                            ...proposalForm.lineItems,
                            { name: "Additional Bespoke Piece", finish: "Hand-crafted studio patina", quantity: 1, unitPriceRupees: 25000 },
                          ],
                        })
                      }
                      className="px-3 py-1 rounded-lg bg-[#38332c] text-[#c59b6d] hover:bg-[#464037] text-xs font-semibold"
                    >
                      + Add Line Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {proposalForm.lineItems.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#181715] border border-[#38332c] grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-12 sm:col-span-5 space-y-1">
                          <label className="text-[10px] text-[#a8a093] font-semibold uppercase">Item Name / Edition</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Monolith Console Table"
                            value={item.name}
                            onChange={(e) => {
                              const next = [...proposalForm.lineItems];
                              next[idx].name = e.target.value;
                              setProposalForm({ ...proposalForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#464037] bg-[#24211d] p-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-3 space-y-1">
                          <label className="text-[10px] text-[#a8a093] font-semibold uppercase">Finish / Patina</label>
                          <input
                            type="text"
                            placeholder="e.g. Antiqued Brass"
                            value={item.finish}
                            onChange={(e) => {
                              const next = [...proposalForm.lineItems];
                              next[idx].finish = e.target.value;
                              setProposalForm({ ...proposalForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#464037] bg-[#24211d] p-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-1 space-y-1">
                          <label className="text-[10px] text-[#a8a093] font-semibold uppercase">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const next = [...proposalForm.lineItems];
                              next[idx].quantity = Math.max(1, Number(e.target.value));
                              setProposalForm({ ...proposalForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#464037] bg-[#24211d] p-1.5 text-white text-xs text-center font-bold"
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-2 space-y-1">
                          <label className="text-[10px] text-[#a8a093] font-semibold uppercase">Rate (₹)</label>
                          <input
                            type="number"
                            min="1"
                            value={item.unitPriceRupees}
                            onChange={(e) => {
                              const next = [...proposalForm.lineItems];
                              next[idx].unitPriceRupees = Math.max(0, Number(e.target.value));
                              setProposalForm({ ...proposalForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#464037] bg-[#24211d] p-1.5 text-white text-xs font-mono"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1 flex justify-end pt-4">
                          {proposalForm.lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = proposalForm.lineItems.filter((_, i) => i !== idx);
                                setProposalForm({ ...proposalForm, lineItems: next });
                              }}
                              className="text-rose-400 hover:text-rose-300 text-xs px-2 py-1"
                              title="Remove Line Item"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery & Production Lead Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#38332c]">
                  <div className="space-y-1">
                    <label className="text-white font-semibold">Custom Insured Wooden Crating &amp; Freight (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={proposalForm.deliveryChargeRupees}
                      onChange={(e) => setProposalForm({ ...proposalForm, deliveryChargeRupees: Math.max(0, Number(e.target.value)) })}
                      className="w-full rounded-xl border border-[#464037] bg-[#181715] p-2.5 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white font-semibold">Workshop Production Lead Time (Weeks)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      required
                      value={proposalForm.estimatedLeadWeeks}
                      onChange={(e) => setProposalForm({ ...proposalForm, estimatedLeadWeeks: Math.max(1, Number(e.target.value)) })}
                      className="w-full rounded-xl border border-[#464037] bg-[#181715] p-2.5 text-white"
                    />
                  </div>
                </div>

                {/* Scope & Notes */}
                <div className="space-y-1">
                  <label className="text-white font-semibold">Project Scope &amp; Special Client Instructions</label>
                  <textarea
                    rows={3}
                    value={proposalForm.notes}
                    onChange={(e) => setProposalForm({ ...proposalForm, notes: e.target.value })}
                    className="w-full rounded-xl border border-[#464037] bg-[#181715] p-2.5 text-white font-mono text-[11px]"
                  />
                </div>

                {/* Computed Ledger Breakdown */}
                <div className="p-4 rounded-xl bg-[#181715] border border-[#38332c] space-y-1.5">
                  <div className="flex justify-between text-[#a8a093]">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-white">{formatPrice(itemsSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#a8a093]">
                    <span>Insured Crating &amp; Transport:</span>
                    <span className="font-semibold text-white">{delivery === 0 ? "Complimentary" : formatPrice(delivery)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1.5 border-t border-[#38332c]">
                    <span>Total Quoted Value (Tax-Inclusive):</span>
                    <span className="text-[#c59b6d]">{formatPrice(totalQuoted)}</span>
                  </div>
                  <div className="flex justify-between text-[#c59b6d] font-semibold pt-1">
                    <span>25% Production Advance Required:</span>
                    <span>{formatPrice(advanceRequired)}</span>
                  </div>
                  <div className="flex justify-between text-[#a8a093]">
                    <span>75% Final Balance (Due post-QC before dispatch):</span>
                    <span>{formatPrice(balanceDue)}</span>
                  </div>
                  <div className="pt-2 text-[10px] text-[#a8a093] border-t border-[#38332c]">
                    ⏳ <strong>TAV-07 Clock Lock:</strong> Automatically valid for 30 calendar days from issuance.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#38332c]">
                  <button
                    type="button"
                    onClick={() => setIsProposalModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#464037] text-xs text-[#a8a093] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingProposal || totalQuoted <= 0}
                    className="px-5 py-2 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors disabled:opacity-50"
                  >
                    {isSubmittingProposal ? "Dispatching Proposal..." : `Issue 30-Day Proposal (${formatPrice(totalQuoted)})`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* MODAL 5B: Issue Proposal Revision (N+1) with Preserved 30-Day Clock (QOT-05) */}
      {isRevisionModalOpen && revisionQuote && (() => {
        const itemsSubtotal = revisionForm.lineItems.reduce(
          (sum, it) => sum + (Number(it.quantity) || 1) * (Number(it.unitPriceRupees) || 0),
          0
        );
        const delivery = Math.max(0, Number(revisionForm.deliveryChargeRupees) || 0);
        const totalQuoted = itemsSubtotal + delivery;
        const advanceRequired = Math.round(totalQuoted * 0.25);
        const balanceDue = totalQuoted - advanceRequired;
        const nextVer = (revisionQuote.versions?.[0]?.versionNumber || 1) + 1;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-[#24211d] border border-[#38332c] p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#c59b6d] tracking-wider block">
                    Offer Revision Engine · TAV-07
                  </span>
                  <h3 className="font-semibold text-base text-white">
                    Issue Proposal Revision V{nextVer} for {revisionQuote.quoteNumber}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsRevisionModalOpen(false);
                    setRevisionQuote(null);
                  }}
                  className="text-xs text-[#a8a093] hover:text-white"
                >
                  ✕ Close
                </button>
              </div>

              {/* TAV-07 Clock Immutability Banner */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-200 text-xs space-y-1">
                <strong>CRITICAL (TAV-07 Policy):</strong> Revisions update bespoke specifications or pricing but{" "}
                <strong>strictly preserve the original 30-day offer clock</strong>. This quotation expires on{" "}
                <strong>
                  {new Date(revisionQuote.expiresAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "Asia/Kolkata",
                  })}
                </strong>{" "}
                (no extension).
              </div>

              <form onSubmit={handleCreateRevision} className="space-y-5 text-xs">
                {/* Client Reference Summary */}
                <div className="p-3 rounded-xl bg-[#181715] border border-[#38332c] flex flex-wrap justify-between gap-2 text-[#a8a093]">
                  <span>Client: <strong className="text-white">{revisionQuote.customerName}</strong></span>
                  <span>Email: <strong className="text-white">{revisionQuote.customerEmail}</strong></span>
                  <span>Destination: <strong className="text-white font-mono">PIN {revisionQuote.deliveryPincode}</strong></span>
                </div>

                {/* Line Items Editor */}
                <div className="space-y-3 pt-2 border-t border-[#38332c]">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">Revised Line Items ({revisionForm.lineItems.length})</h4>
                    <button
                      type="button"
                      onClick={() =>
                        setRevisionForm({
                          ...revisionForm,
                          lineItems: [
                            ...revisionForm.lineItems,
                            { name: "Additional Bespoke Piece", finish: "Hand-crafted patina", quantity: 1, unitPriceRupees: 25000 },
                          ],
                        })
                      }
                      className="px-3 py-1 rounded-lg bg-[#38332c] text-[#c59b6d] hover:bg-[#464037] text-xs font-semibold"
                    >
                      + Add Line Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {revisionForm.lineItems.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#181715] border border-[#38332c] grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-12 sm:col-span-5 space-y-1">
                          <label className="text-[10px] text-[#a8a093] font-semibold uppercase">Item Name</label>
                          <input
                            type="text"
                            required
                            value={item.name}
                            onChange={(e) => {
                              const next = [...revisionForm.lineItems];
                              next[idx].name = e.target.value;
                              setRevisionForm({ ...revisionForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#464037] bg-[#24211d] p-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-3 space-y-1">
                          <label className="text-[10px] text-[#a8a093] font-semibold uppercase">Finish</label>
                          <input
                            type="text"
                            value={item.finish}
                            onChange={(e) => {
                              const next = [...revisionForm.lineItems];
                              next[idx].finish = e.target.value;
                              setRevisionForm({ ...revisionForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#464037] bg-[#24211d] p-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-1 space-y-1">
                          <label className="text-[10px] text-[#a8a093] font-semibold uppercase">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const next = [...revisionForm.lineItems];
                              next[idx].quantity = Math.max(1, Number(e.target.value));
                              setRevisionForm({ ...revisionForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#464037] bg-[#24211d] p-1.5 text-white text-xs text-center font-bold"
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-2 space-y-1">
                          <label className="text-[10px] text-[#a8a093] font-semibold uppercase">Rate (₹)</label>
                          <input
                            type="number"
                            min="1"
                            value={item.unitPriceRupees}
                            onChange={(e) => {
                              const next = [...revisionForm.lineItems];
                              next[idx].unitPriceRupees = Math.max(0, Number(e.target.value));
                              setRevisionForm({ ...revisionForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#464037] bg-[#24211d] p-1.5 text-white text-xs font-mono"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1 flex justify-end pt-4">
                          {revisionForm.lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = revisionForm.lineItems.filter((_, i) => i !== idx);
                                setRevisionForm({ ...revisionForm, lineItems: next });
                              }}
                              className="text-rose-400 hover:text-rose-300 text-xs px-2 py-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery & Production Lead Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#38332c]">
                  <div className="space-y-1">
                    <label className="text-white font-semibold">Custom Insured Freight (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={revisionForm.deliveryChargeRupees}
                      onChange={(e) => setRevisionForm({ ...revisionForm, deliveryChargeRupees: Math.max(0, Number(e.target.value)) })}
                      className="w-full rounded-xl border border-[#464037] bg-[#181715] p-2.5 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white font-semibold">Workshop Production Lead Time (Weeks)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      required
                      value={revisionForm.estimatedLeadWeeks}
                      onChange={(e) => setRevisionForm({ ...revisionForm, estimatedLeadWeeks: Math.max(1, Number(e.target.value)) })}
                      className="w-full rounded-xl border border-[#464037] bg-[#181715] p-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-white font-semibold">Scope Modifications &amp; Revision Notes</label>
                  <textarea
                    rows={3}
                    value={revisionForm.notes}
                    onChange={(e) => setRevisionForm({ ...revisionForm, notes: e.target.value })}
                    className="w-full rounded-xl border border-[#464037] bg-[#181715] p-2.5 text-white font-mono text-[11px]"
                  />
                </div>

                {/* Computed Ledger Breakdown */}
                <div className="p-4 rounded-xl bg-[#181715] border border-[#38332c] space-y-1.5">
                  <div className="flex justify-between text-[#a8a093]">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-white">{formatPrice(itemsSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#a8a093]">
                    <span>Insured Crating &amp; Transport:</span>
                    <span className="font-semibold text-white">{delivery === 0 ? "Complimentary" : formatPrice(delivery)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1.5 border-t border-[#38332c]">
                    <span>Revised Quoted Commitment:</span>
                    <span className="text-[#c59b6d]">{formatPrice(totalQuoted)}</span>
                  </div>
                  <div className="flex justify-between text-[#c59b6d] font-semibold pt-1">
                    <span>25% Advance Required:</span>
                    <span>{formatPrice(advanceRequired)}</span>
                  </div>
                  <div className="flex justify-between text-[#a8a093]">
                    <span>75% Final Balance:</span>
                    <span>{formatPrice(balanceDue)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#38332c]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRevisionModalOpen(false);
                      setRevisionQuote(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-[#464037] text-xs text-[#a8a093] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRevision || totalQuoted <= 0}
                    className="px-5 py-2 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors disabled:opacity-50"
                  >
                    {isSubmittingRevision ? "Issuing Revision..." : `Issue Revision V${nextVer} (${formatPrice(totalQuoted)})`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* MODAL 6: Markdown Product Importer */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#24211d] border border-[#38332c] p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#38332c] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#c59b6d] tracking-wider block">
                  Markdown Publishing Pipeline (WEB-007 / WEB-008)
                </span>
                <h3 className="font-semibold text-base text-white">Import & Review Product Specifications</h3>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFeedback(null);
                }}
                className="text-xs text-[#a8a093] hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            {/* Option 1: Synchronize all product folders from docs/products/* */}
            <div className="p-4 rounded-xl bg-[#2a2722] border border-[#38332c] flex flex-wrap items-center justify-between gap-4">
              <div>
                <strong className="text-white text-xs block">Sync Authoritative Product Folders</strong>
                <p className="text-[11px] text-[#a8a093]">
                  Automatically parse and upsert all product folder packages from <code className="font-mono text-[#c59b6d]">docs/products/*</code> and sync their <code className="font-mono text-[#c59b6d]">images/</code>.
                </p>
              </div>
              <button
                onClick={handleSyncMarkdownDocs}
                disabled={isImporting}
                className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors disabled:opacity-50"
              >
                {isImporting ? "Syncing Folders..." : "Sync docs/products/*"}
              </button>
            </div>

            {/* Option 2: Upload single .md specification */}
            <div className="p-4 rounded-xl bg-[#2a2722] border border-[#38332c] space-y-3">
              <div>
                <strong className="text-white text-xs block">Upload Single Markdown File (.md)</strong>
                <p className="text-[11px] text-[#a8a093]">
                  Import an individual product markdown specification containing YAML frontmatter headers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept=".md"
                  onChange={(e) => setSelectedMdFile(e.target.files?.[0] || null)}
                  className="text-xs text-[#a8a093] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#38332c] file:text-white hover:file:bg-[#464037] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleUploadSingleMdFile}
                  disabled={isImporting || !selectedMdFile}
                  className="px-4 py-2 rounded-xl bg-[#38332c] border border-[#464037] text-white font-semibold text-xs hover:bg-[#464037] transition-colors disabled:opacity-50"
                >
                  {isImporting ? "Importing File..." : "Import .md"}
                </button>
              </div>
            </div>

            {/* Option 3: Custom Paste / Upload Option */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white block">
                Or Paste Custom Product Markdown (YAML Frontmatter + Body)
              </label>
              <textarea
                rows={8}
                placeholder="---&#10;sku: TAV-ED-001&#10;slug: kinetic-brass-object&#10;title: Kinetic Brass Object&#10;category: art-collectibles&#10;subcategory: Sculptures & Art Objects&#10;primaryMode: READY_STOCK&#10;taxInclusivePrice: 18500&#10;variants:&#10;  - sku: TAV-ED-001-A&#10;    title: Brushed Brass&#10;    taxInclusivePrice: 18500&#10;    initialStock: 5&#10;---&#10;&#10;# Title&#10;Description..."
                value={markdownInput}
                onChange={(e) => setMarkdownInput(e.target.value)}
                className="w-full rounded-xl border border-[#464037] bg-[#181715] p-3 text-xs font-mono text-white placeholder-[#787165] focus:outline-none focus:border-[#c59b6d]"
              />
            </div>

            {/* Feedback Message */}
            {importFeedback && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  importFeedback.startsWith("Error")
                    ? "bg-rose-950/60 border border-rose-800 text-rose-300"
                    : "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
                }`}
              >
                {importFeedback}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#38332c]">
              <span className="text-[11px] text-[#a8a093]">
                Preserves two-component pricing and non-executable documentation integrity.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportFeedback(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-[#464037] text-xs text-[#a8a093] hover:text-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleImportSingleMarkdown}
                  disabled={isImporting || !markdownInput.trim()}
                  className="px-5 py-2 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors disabled:opacity-50"
                >
                  {isImporting ? "Importing..." : "Import Specification"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
