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
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "ORDERS" | "PRODUCTION" | "DISPATCH" | "TICKETS" | "CUSTOMERS" | "PROPOSALS" | "CATALOGUE" | "PINCODES" | "SETTINGS" | "AUDIT"
  >("OVERVIEW");

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

  // Search & Filters
  const [orderSearch, setOrderSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<"ALL" | "READY_STOCK" | "MADE_TO_ORDER">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [refundUtrInput, setRefundUtrInput] = useState("");
  const [isUpdatingRefund, setIsUpdatingRefund] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedLinkOrderId, setCopiedLinkOrderId] = useState<string | null>(null);

  // Ticket detail view
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");

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
      fetchJson<{ maintenanceMode?: boolean; studioHiatus?: boolean; announcementBanner?: string }>("/api/admin/settings").then(
        (d) => {
          if (typeof d.maintenanceMode === "boolean") setMaintenanceMode(d.maintenanceMode);
          if (typeof d.studioHiatus === "boolean") setStudioHiatus(d.studioHiatus);
          if (d.announcementBanner) setAnnouncementBanner(d.announcementBanner);
        }
      ),
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

  useEffect(() => {
    void syncBackendData();
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
    };
  }, [orders, tickets, inquiries, customers, pincodes]);

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

    try {
      await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: ticketReplyText.trim(),
          sender: "STAFF",
          authorName: currentStaff.name,
          status: "IN_PROGRESS",
        }),
      });
    } catch (err) {
      console.warn("Backend ticket reply error:", err);
    }

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: "STAFF" as const,
      authorName: currentStaff.name,
      text: ticketReplyText.trim(),
      timestamp: new Date().toLocaleDateString("en-IN", {
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
  };

  // Toggle ticket status
  const handleResolveTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updated = { ...t, status: "RESOLVED" as const };
          if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
          logAuditAction("TICKET_RESOLVED", "SupportTicket", t.ticketNumber, "Ticket marked as resolved.");
          return updated;
        }
        return t;
      })
    );
  };

  // Toggle Catalogue Publication with DB synchronization
  const handleTogglePublish = async (itemId: string) => {
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

  // Create Formal 30-Day Architectural Proposal (TAV-07)
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen flex flex-col bg-[#121214] text-[#f4f4f6]">
      {/* Top Notice: Backend Connectivity & Mode Banner */}
      <div className="bg-[#1c1c20] border-b border-[#2e2e34] px-6 py-1.5 text-[11px] text-[#9e9ea8] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              backendStatus === "connected"
                ? "bg-emerald-500 animate-pulse"
                : backendStatus === "connecting"
                ? "bg-amber-400 animate-pulse"
                : "bg-rose-500"
            }`}
          ></span>
          <span>
            <strong className="text-white">Internal Studio Console</strong> ·{" "}
            {backendStatus === "connected"
              ? "Backend API & PostgreSQL connected"
              : backendStatus === "connecting"
              ? "Synchronizing with backend API..."
              : "Backend API Disconnected"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <button
            type="button"
            onClick={() => void syncBackendData()}
            className="px-2 py-0.5 rounded bg-[#2a2a32] hover:bg-[#35353f] text-white border border-[#3e3e46]"
          >
            Refresh Sync
          </button>
          <span className="text-[#c59b6d]">Role switcher active for operational testing.</span>
        </div>
      </div>

      {backendStatus === "error" && backendError && (
        <div className="bg-rose-950/80 border-b border-rose-700/60 px-6 py-2 text-xs text-rose-100 flex items-center justify-between gap-4">
          <span>
            <strong>Backend Synchronization Error:</strong> {backendError}. Changes below will not persist until Storefront API is reachable.
          </span>
          <button
            type="button"
            onClick={() => void syncBackendData()}
            className="px-2.5 py-1 rounded bg-rose-800 hover:bg-rose-700 text-white font-semibold shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Top Staff Operational Bar */}
      <header className="border-b border-[#2e2e34] bg-[#18181c] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-lg bg-[#c59b6d] text-[#121214] flex items-center justify-center font-bold text-sm tracking-wider">
              VD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-wide text-white">Tavistra</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#2e2e34] text-[#c59b6d]">
                  by VDesign
                </span>
              </div>
              <p className="text-[11px] text-[#9e9ea8]">Staff Administration & Fulfilment Operations</p>
            </div>
          </div>

          {/* User Account & Role Switcher */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <select
                value={currentStaff.id}
                onChange={(e) => {
                  const found = STAFF_USERS.find((u) => u.id === e.target.value);
                  if (found) setCurrentStaff(found);
                }}
                className="bg-[#24242a] border border-[#3e3e46] rounded-lg px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:border-[#c59b6d]"
              >
                {STAFF_USERS.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#10b981] pt-0.5">● {currentStaff.roleLabel}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-[#2e2e34] border border-[#3e3e46] flex items-center justify-center text-xs font-bold text-[#c59b6d]">
              {currentStaff.avatarInitials}
            </div>
          </div>
        </div>

        {/* Dense Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 overflow-x-auto border-t border-[#24242a]">
          {[
            { id: "OVERVIEW", label: "Overview" },
            { id: "ORDERS", label: `Orders (${orders.length})` },
            { id: "PRODUCTION", label: `7-Day Grace (${stats.mtoGraceCount})` },
            { id: "DISPATCH", label: "Fulfilment & AWB" },
            { id: "TICKETS", label: `Support Tickets (${stats.openTicketsCount})` },
            { id: "CUSTOMERS", label: `Customers (${customers.length})` },
            { id: "PROPOSALS", label: `Inquiries & Quotes (${inquiries.length + proposals.length})` },
            { id: "CATALOGUE", label: `Catalogue (${catalogue.length})` },
            { id: "PINCODES", label: `Delivery PINs (${stats.serviceablePinsCount})` },
            { id: "SETTINGS", label: "System & Settings" },
            { id: "AUDIT", label: `Audit Log (${auditLogs.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-[#c59b6d] text-white bg-[#222228]/50"
                  : "border-transparent text-[#9e9ea8] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9e9ea8]">
                  Net Verified Revenue
                </span>
                <p className="text-2xl font-bold text-white">{formatPrice(stats.netRevenue)}</p>
                <p className="text-[11px] text-[#10b981]">
                  Gross: {formatPrice(stats.grossRevenue)} · Refunds: {formatPrice(stats.totalRefunded)}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9e9ea8]">
                  Cancelled & Refunds
                </span>
                <p className="text-2xl font-bold text-red-400">{stats.cancelledOrdersCount}</p>
                <p className="text-[11px] text-[#9e9ea8]">
                  {formatPrice(stats.totalRefunded)} total refunded
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9e9ea8]">
                  MTO 7-Day Grace Holds
                </span>
                <p className="text-2xl font-bold text-[#f59e0b]">{stats.mtoGraceCount}</p>
                <p className="text-[11px] text-[#9e9ea8]">Machining commences Day 8</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9e9ea8]">
                  Open Support Tickets
                </span>
                <p className="text-2xl font-bold text-[#f43f5e]">{stats.openTicketsCount}</p>
                <p className="text-[11px] text-[#9e9ea8]">Alterations & requests</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 p-6 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-4">
                <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
                  <h3 className="font-semibold text-sm text-white">Active Consignments</h3>
                  <button
                    onClick={() => setActiveTab("ORDERS")}
                    className="text-xs font-semibold text-[#c59b6d] hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>
                <div className="divide-y divide-[#2e2e34]">
                  {orders.map((order) => (
                    <div key={order.id} className="py-3.5 flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{order.orderNumber}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2a2a30] text-[#c59b6d]">
                            {order.mode === "READY_STOCK" ? "Ready Stock" : "Made to Order"}
                          </span>
                        </div>
                        <p className="text-[#9e9ea8]">
                          {order.customerName} · {order.city}, {order.state} ({order.pincode})
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="font-semibold text-white">{formatPrice(order.totalAmountRupees)}</span>
                        <p className="text-[11px] text-[#10b981]">Paid: {formatPrice(order.amountPaidRupees)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 p-6 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-4">
                <h3 className="font-semibold text-sm text-white">Latest Staff Audit Events</h3>
                <div className="space-y-3">
                  {auditLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-[#24242a] border border-[#2e2e34] text-xs space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <strong className="text-[#c59b6d]">{log.action}</strong>
                        <span className="text-[#9e9ea8]">{log.timestamp}</span>
                      </div>
                      <p className="text-white text-[11px]">{log.details}</p>
                      <span className="text-[10px] text-[#9e9ea8] block">By {log.staffName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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

            <div className="space-y-3 p-4 rounded-2xl bg-[#1c1c20] border border-[#2e2e34]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <input
                  type="text"
                  placeholder="Search order ref, client, or PIN..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="rounded-xl border border-[#3e3e46] bg-[#121214] px-4 py-2 text-xs text-white placeholder-[#6e6e76] w-full sm:w-72 focus:outline-none focus:border-[#c59b6d]"
                />
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {(["ALL", "READY_STOCK", "MADE_TO_ORDER"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setModeFilter(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        modeFilter === m
                          ? "bg-[#c59b6d] text-[#121214]"
                          : "bg-[#24242a] text-[#9e9ea8] hover:text-white"
                      }`}
                    >
                      {m === "ALL" ? "All Modes" : m === "READY_STOCK" ? "Ready Stock" : "Made to Order"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#2e2e34]">
                <span className="text-[10px] uppercase tracking-wider text-[#9e9ea8] mr-1">Status:</span>
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
                        ? "bg-white text-[#121214]"
                        : "bg-[#24242a] text-[#9e9ea8] hover:text-white"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#2e2e34] bg-[#1c1c20] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181c] border-b border-[#2e2e34] text-[11px] uppercase tracking-wider text-[#9e9ea8]">
                  <tr>
                    <th className="py-3 px-4">Order Reference</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Client & Location</th>
                    <th className="py-3 px-4">Financial Ledger</th>
                    <th className="py-3 px-4">Milestone</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2e2e34]">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#222228]/40 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-white">
                        {order.orderNumber}
                        <span className="block text-[10px] font-normal text-[#9e9ea8]">{order.placedAt}</span>
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
                        <p className="text-[11px] text-[#9e9ea8]">
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
                            <p className="text-[10px] text-[#9e9ea8] font-mono truncate max-w-[140px]" title={order.refund?.reference || "REF-COMPLETED"}>
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
                              : "bg-[#2a2a32] text-white border-[#3e3e46]"
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
                      className="p-6 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-5"
                    >
                      <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
                        <div>
                          <span className="font-mono font-bold text-white text-sm">{order.orderNumber}</span>
                          <p className="text-xs text-[#9e9ea8]">{order.customerName}</p>
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
                        <ul className="list-disc list-inside text-[#9e9ea8]">
                          {order.items.map((i, idx) => (
                            <li key={idx}>
                              {i.name} (Qty: {i.quantity})
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-[#24242a] space-y-2 text-xs">
                        <div className="flex justify-between text-[#9e9ea8]">
                          <span>Amount Verified Paid:</span>
                          <span className="font-semibold text-[#10b981]">{formatPrice(order.amountPaidRupees)}</span>
                        </div>
                        <div className="flex justify-between text-[#9e9ea8]">
                          <span>Pre-Dispatch Balance:</span>
                          <span className="font-semibold text-white">
                            {order.balanceDueRupees <= 0 ? "₹0 (100% Settled)" : formatPrice(order.balanceDueRupees)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#9e9ea8]">
                          <span>Courier Feasibility ({order.pincode}):</span>
                          <span className={`font-semibold ${isPinFeasible ? "text-emerald-400" : "text-amber-300"}`}>
                            {isPinFeasible ? `✓ Verified (${matchedPin?.zoneCode || "Active PIN"})` : "⚠ Review PIN Feasibility"}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#f59e0b] pt-1 border-t border-[#2e2e34]">
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
                                className="flex-1 py-2.5 rounded-xl bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors shadow-sm disabled:opacity-45 disabled:cursor-not-allowed"
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
                              className="w-full py-2.5 rounded-xl bg-[#2a2a30] border border-[#3e3e46] text-xs font-semibold text-white hover:bg-[#34343c] transition-colors flex items-center justify-center gap-2"
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

            <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">Carrier Consignment & AWB Assignment</h2>
                <p className="text-xs text-[#9e9ea8]">
                  Assign verified shipping providers (Blue Dart, Safeexpress) and Air Waybill numbers. Updates customer tracking on /track in real-time.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">{order.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2a2a30] text-[#c59b6d]">
                        {order.mode}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2e2e34] text-white">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#9e9ea8]">
                      Client: <strong className="text-white">{order.customerName}</strong> ({order.phone}) · Destination: {order.city}, {order.state} — {order.pincode}
                    </p>
                    <div className="text-xs text-[#9e9ea8]">
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
                        className="px-3.5 py-2 rounded-xl bg-[#24242a] text-xs font-semibold text-[#6e6e76] border border-[#2e2e34] cursor-not-allowed"
                      >
                        Packed & Dispatched (Locked)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyBalanceLink(order)}
                        className="px-3.5 py-2 rounded-xl bg-[#2a2a30] text-xs font-semibold text-[#c59b6d] hover:bg-[#34343c] border border-[#3e3e46] transition-colors"
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
                        className="rounded-xl border border-[#3e3e46] bg-[#121214] px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="AWB Number"
                        value={awbInput}
                        onChange={(e) => setAwbInput(e.target.value)}
                        className="rounded-xl border border-[#3e3e46] bg-[#121214] px-3 py-2 text-xs text-white font-mono"
                      />
                      <button
                        onClick={() => handleSaveAwb(order.id)}
                        className="px-4 py-2 rounded-xl bg-[#10b981] text-[#121214] font-semibold text-xs"
                      >
                        Packed & Dispatched
                      </button>
                      <button
                        onClick={() => setEditingAwbId(null)}
                        className="px-3 py-2 rounded-xl border border-[#3e3e46] text-xs text-[#9e9ea8]"
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

        {/* TAB 5: SUPPORT TICKETS & ALTERATIONS */}
        {activeTab === "TICKETS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">Client Desk Support Tickets</h2>
                <p className="text-xs text-[#9e9ea8]">
                  Inquiries, pre-production alteration requests during 7-day grace, and delivery appointment coordination.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedTicket?.id === t.id
                        ? "bg-[#222228] border-[#c59b6d]"
                        : "bg-[#1c1c20] border-[#2e2e34] hover:border-[#3e3e46]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-white">{t.ticketNumber}</span>
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
                    <p className="text-[11px] text-[#9e9ea8] mt-1">
                      {t.customerName} {t.orderNumber && `· Ref: ${t.orderNumber}`}
                    </p>
                    <span className="text-[10px] text-[#6e6e76] block mt-2">{t.createdAt}</span>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-7 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] p-6 space-y-5">
                {selectedTicket ? (
                  <>
                    <div className="flex items-center justify-between border-b border-[#2e2e34] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-white">
                            {selectedTicket.ticketNumber}
                          </span>
                          {selectedTicket.orderNumber && (
                            <span className="font-mono text-xs text-[#c59b6d] bg-[#24242a] px-2 py-0.5 rounded">
                              {selectedTicket.orderNumber}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm text-white mt-1">{selectedTicket.subject}</h3>
                        <p className="text-xs text-[#9e9ea8]">
                          Client: {selectedTicket.customerName} ({selectedTicket.phone}) · {selectedTicket.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleResolveTicket(selectedTicket.id)}
                        disabled={selectedTicket.status === "RESOLVED"}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold hover:bg-emerald-900 disabled:opacity-40"
                      >
                        {selectedTicket.status === "RESOLVED" ? "✓ Resolved" : "Mark Resolved"}
                      </button>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {selectedTicket.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-xl text-xs space-y-1 ${
                            msg.sender === "CUSTOMER"
                              ? "bg-[#24242a] border border-[#2e2e34] text-[#f4f4f6]"
                              : "bg-[#2e2820] border border-[#c59b6d]/40 text-amber-100"
                          }`}
                        >
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span>{msg.authorName}</span>
                            <span className="text-[#9e9ea8] font-normal">{msg.timestamp}</span>
                          </div>
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#2e2e34] space-y-3">
                      <textarea
                        rows={3}
                        placeholder="Type response or internal dispatch note..."
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        className="w-full rounded-xl border border-[#3e3e46] bg-[#121214] p-3 text-xs text-white placeholder-[#6e6e76] focus:outline-none focus:border-[#c59b6d]"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleSendTicketReply}
                          disabled={!ticketReplyText.trim()}
                          className="px-5 py-2 rounded-xl bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] disabled:opacity-40 transition-colors"
                        >
                          Send Official Reply
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 text-xs text-[#9e9ea8]">
                    Select a support ticket from the list to view thread history and respond.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMERS & PROFILES */}
        {activeTab === "CUSTOMERS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">Client Directory & Profiles</h2>
                <p className="text-xs text-[#9e9ea8]">
                  Architectural practices, corporate GSTIN identifiers, and lifetime consignment histories.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#2e2e34] bg-[#1c1c20] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181c] border-b border-[#2e2e34] text-[11px] uppercase tracking-wider text-[#9e9ea8]">
                  <tr>
                    <th className="py-3 px-4">Client / Studio</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">GSTIN Tax ID</th>
                    <th className="py-3 px-4">Orders</th>
                    <th className="py-3 px-4">Lifetime Spend</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2e2e34]">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-[#222228]/40 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-semibold text-white">{c.name}</p>
                        <p className="text-[11px] text-[#c59b6d]">{c.practiceOrStudio || "Private Client"}</p>
                      </td>
                      <td className="py-4 px-4 text-[#9e9ea8]">
                        <p>{c.email}</p>
                        <p className="text-[11px]">{c.phone}</p>
                      </td>
                      <td className="py-4 px-4">
                        {c.gstin ? (
                          <span className="font-mono text-[11px] text-[#10b981] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                            {c.gstin}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#6e6e76]">Unregistered</span>
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
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2e2e34] pb-4">
              <div>
                <h2 className="text-base font-semibold text-white">Commercial Inquiries & 30-Day Architectural Proposals</h2>
                <p className="text-xs text-[#9e9ea8]">
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
                className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors shadow-sm"
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
                <div className="p-8 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] text-center text-xs text-[#9e9ea8]">
                  No formal proposals issued yet. Issue a bespoke proposal from incoming inquiries below.
                </div>
              ) : (
                <div className="rounded-2xl border border-[#2e2e34] bg-[#1c1c20] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#18181c] border-b border-[#2e2e34] text-[11px] uppercase tracking-wider text-[#9e9ea8]">
                      <tr>
                        <th className="py-3 px-4">Quote Number</th>
                        <th className="py-3 px-4">Client & Pincode</th>
                        <th className="py-3 px-4">Quoted Amount</th>
                        <th className="py-3 px-4">25% Advance</th>
                        <th className="py-3 px-4">Status & Clock</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2e2e34]">
                      {proposals.map((p) => {
                        const latestVer = p.versions?.[0];
                        const amount = latestVer ? Number(latestVer.quotedAmount) : 0;
                        const advance = latestVer ? Number(latestVer.advanceRequired) : 0;
                        const isAccepted = p.status === "ACCEPTED";
                        const isExpired = p.status === "EXPIRED";

                        return (
                          <tr key={p.id} className="hover:bg-[#222228]/40 transition-colors">
                            <td className="py-4 px-4 font-mono font-bold text-white">
                              {p.quoteNumber}
                              <span className="block text-[10px] font-sans text-[#9e9ea8]">
                                Rev {latestVer?.versionNumber || 1}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-white">
                              {p.customerName}
                              <span className="block text-[10px] text-[#9e9ea8]">
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
                                  className="px-3 py-1.5 rounded-lg bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors"
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
              <div className="rounded-2xl border border-[#2e2e34] bg-[#1c1c20] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18181c] border-b border-[#2e2e34] text-[11px] uppercase tracking-wider text-[#9e9ea8]">
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
                  <tbody className="divide-y divide-[#2e2e34]">
                    {inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-[#222228]/40 transition-colors">
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
                          <span className="block text-[10px] text-[#9e9ea8]">{inq.email}</span>
                        </td>
                        <td className="py-4 px-4 text-white max-w-xs">{inq.requestedEditions}</td>
                        <td className="py-4 px-4 font-bold text-white">{inq.quantityUnits}</td>
                        <td className="py-4 px-4 text-[#9e9ea8]">
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
                                : "bg-[#24242a] text-[#9e9ea8] border border-[#3e3e46]"
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
                            className="px-3 py-1.5 rounded-lg bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors"
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
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2e2e34] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">Catalogue Editions & Live Inventory</h2>
                <p className="text-xs text-[#9e9ea8]">
                  Publish status, available workshop stock, and active reservations (TAV-02 & TAV-05). Click "Review Specs" to inspect full editorial copy, dimensions, and Markdown sources.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#2e2e34] border border-[#3e3e46] text-xs font-semibold text-white hover:bg-[#3e3e46] flex items-center gap-1.5"
                >
                  <span>📝</span> Import / Sync Markdown
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#2e2e34] bg-[#1c1c20] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181c] border-b border-[#2e2e34] text-[11px] uppercase tracking-wider text-[#9e9ea8]">
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
                <tbody className="divide-y divide-[#2e2e34]">
                  {catalogue.map((item) => (
                    <tr key={item.id} className="hover:bg-[#222228]/40 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          {item.primaryImageUrl ? (
                            <img
                              src={item.primaryImageUrl}
                              alt={item.name}
                              className="h-10 w-10 rounded-lg object-cover border border-[#3e3e46] shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-[#24242a] border border-[#3e3e46] flex items-center justify-center text-[10px] text-[#c59b6d] font-bold shrink-0">
                              ED
                            </div>
                          )}
                          <div>
                            <span className="text-white block">{item.name}</span>
                            <span className="block text-[10px] font-mono text-[#9e9ea8]">
                              {item.sku ? `${item.sku} · ` : ""}{item.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#9e9ea8]">
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
                      <td className="py-4 px-4 text-xs text-[#9e9ea8]">
                        {item.variants && item.variants.length > 0 ? (
                          <span>
                            <strong className="text-white">{item.variants.length}</strong> edition(s)
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#6e6e76]">Standard</span>
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
                          <span className="text-[11px] text-[#9e9ea8]">Workshop On-Demand</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => setReviewedProduct(item)}
                          className="px-3 py-1 rounded-lg bg-[#24242a] text-white border border-[#3e3e46] text-xs font-semibold hover:bg-[#2e2e34]"
                        >
                          Review Specs
                        </button>
                        <button
                          onClick={() => handleTogglePublish(item.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            item.isPublished
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
                              : "bg-[#2a2a30] text-[#6e6e76] hover:text-white"
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
            onLogAudit={logAuditAction}
            onPincodesUpdated={(rows) => setPincodes(rows as any)}
          />
        )}

        {/* TAB 9: SYSTEM & SETTINGS */}
        {activeTab === "SETTINGS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">System Settings & Infrastructure</h2>
                <p className="text-xs text-[#9e9ea8]">
                  Maintenance controls, transactional SMTP infrastructure mapping, and state backup exports.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Maintenance Mode & Studio Hiatus Governance */}
              <div className="p-6 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-5">
                <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
                  <div>
                    <h3 className="font-semibold text-sm text-white">Storefront Checkout Freeze (Maintenance)</h3>
                    <p className="text-[11px] text-[#9e9ea8]">
                      Freezes checkout and transactions while keeping product catalog reviewable.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleMaintenance}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      maintenanceMode
                        ? "bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900"
                        : "bg-[#24242a] text-[#9e9ea8] border border-[#3e3e46] hover:text-white"
                    }`}
                  >
                    {maintenanceMode ? "Maintenance Active" : "Storefront Live"}
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
                  <div>
                    <h3 className="font-semibold text-sm text-white">Studio Hiatus Banner</h3>
                    <p className="text-[11px] text-[#9e9ea8]">
                      Displays top notification bar alerting patrons of scheduled studio pauses.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleHiatus}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      studioHiatus
                        ? "bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900"
                        : "bg-[#24242a] text-[#9e9ea8] border border-[#3e3e46] hover:text-white"
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
                    className="w-full rounded-xl border border-[#3e3e46] bg-[#16161a] p-3 text-xs text-white placeholder-[#6e6e76] focus:border-[#c59b6d] focus:outline-none"
                    placeholder="Enter announcement text to broadcast to storefront visitors..."
                  />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#9e9ea8]">
                      Broadcasts live on the storefront header.
                    </span>
                    <button
                      onClick={handleSaveAnnouncement}
                      disabled={isSavingSettings}
                      className="px-4 py-1.5 rounded-lg bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors disabled:opacity-50"
                    >
                      {isSavingSettings ? "Saving..." : settingsSaveSuccess ? "Saved ✓" : "Save Announcement"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Transactional Email (SMTP) Infrastructure */}
              <div className="p-6 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-3">
                <h3 className="font-semibold text-sm text-white">Transactional Email Architecture (SMTP)</h3>
                <div className="p-3.5 rounded-xl bg-[#24242a] border border-[#2e2e34] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#9e9ea8]">Target SMTP Host:</span>
                    <strong className="text-white font-mono">devMachine (192.168.1.100) / VPS</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9e9ea8]">Local Machine Policy:</span>
                    <span className="text-[#10b981] font-semibold">Zero Local Mail Services (Protected)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9e9ea8]">Mail Flow:</span>
                    <span className="text-[#c59b6d]">Queued Order Confirmations & Tickets</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#9e9ea8] leading-relaxed">
                  Per repository operating rules, no local SMTP daemon is installed on this Windows workstation. Outbound notification queues and test relays run exclusively on the Debian devMachine or external provider.
                </p>
              </div>

              {/* Card 3: Data Export & Backup */}
              <div className="p-6 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-3">
                <h3 className="font-semibold text-sm text-white">Operational Snapshot Backup</h3>
                <p className="text-xs text-[#9e9ea8] leading-relaxed">
                  Export the complete operational state (orders, customer profiles, support tickets, delivery PIN whitelist, and audit logs) as a timestamped JSON file.
                </p>
                <button
                  onClick={handleExportStateSnapshot}
                  className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors shadow-sm"
                >
                  Download State Snapshot JSON
                </button>
              </div>

              {/* Card 4: Brand & Entity Attribution */}
              <div className="p-6 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-3">
                <h3 className="font-semibold text-sm text-white">Brand Entity Attribution</h3>
                <div className="p-3.5 rounded-xl bg-[#24242a] border border-[#2e2e34] space-y-1 text-xs">
                  <p className="text-white font-semibold">Brand: Tavistra</p>
                  <p className="text-[#c59b6d]">Parent Entity: VDesign (Strictly, never 'VDesign Studio')</p>
                  <p className="text-[11px] text-[#9e9ea8]">Prohibited terminology: 'Commission'</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: IMMUTABLE AUDIT LOG */}
        {activeTab === "AUDIT" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">Immutable Operational Audit Trail (TAV-12)</h2>
                <p className="text-xs text-[#9e9ea8]">
                  Append-only chronological log of all sensitive staff operations, production releases, refunds, and AWB entries.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#2e2e34] bg-[#1c1c20] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181c] border-b border-[#2e2e34] text-[11px] uppercase tracking-wider text-[#9e9ea8]">
                  <tr>
                    <th className="py-3 px-4">Timestamp (IST)</th>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Operation Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2e2e34]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#222228]/40 transition-colors font-mono">
                      <td className="py-3.5 px-4 text-[11px] text-[#9e9ea8] whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">{log.staffName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#24242a] text-[#c59b6d] border border-[#3e3e46]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-white">
                        {log.entityType}: {log.entityId}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-xs text-[#9e9ea8]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Selected Order Slide-Over */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#1c1c20] border border-[#2e2e34] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2e2e34] pb-4">
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
                <p className="text-xs text-[#9e9ea8]">Placed {selectedOrder.placedAt}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-xs text-[#9e9ea8] hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-[#9e9ea8] block">Client Contact:</strong>
                  <p className="text-white font-semibold">{selectedOrder.customerName}</p>
                  <p className="text-[#9e9ea8]">{selectedOrder.email}</p>
                  <p className="text-[#9e9ea8]">{selectedOrder.phone}</p>
                </div>
                <div>
                  <strong className="text-[#9e9ea8] block">Delivery Location:</strong>
                  <p className="text-white">{selectedOrder.address}</p>
                  <p className="text-white">{selectedOrder.city}, {selectedOrder.state} — {selectedOrder.pincode}</p>
                </div>
              </div>

              <div>
                <strong className="text-[#9e9ea8] block mb-1">Acquired Pieces:</strong>
                <div className="rounded-xl border border-[#2e2e34] bg-[#16161a] divide-y divide-[#2e2e34]">
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
                      <span className="text-[#9e9ea8] block text-[10px] uppercase font-semibold">100% Refund Amount</span>
                      <p className="font-mono font-bold text-white text-base">
                        {formatPrice(selectedOrder.refund?.amountRupees ?? selectedOrder.amountPaidRupees)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#9e9ea8] block text-[10px] uppercase font-semibold">Cancellation Date</span>
                      <p className="text-white font-medium">
                        {selectedOrder.cancelledAt || selectedOrder.placedAt}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-red-800/40 space-y-2">
                    <label className="text-[11px] text-[#9e9ea8] block font-semibold">
                      Gateway Refund / Bank UTR Reference:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={refundUtrInput}
                        onChange={(e) => setRefundUtrInput(e.target.value)}
                        placeholder="e.g. REF-173143... or UTR12345678"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#141416] border border-[#3e3e46] text-white font-mono text-xs focus:outline-none focus:border-[#c59b6d]"
                      />
                      <button
                        type="button"
                        disabled={isUpdatingRefund || !refundUtrInput.trim()}
                        onClick={() => handleUpdateRefundReference(selectedOrder.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors disabled:opacity-50"
                      >
                        {isUpdatingRefund ? "Saving..." : "Save UTR"}
                      </button>
                    </div>
                    <p className="text-[10px] text-[#9e9ea8]">
                      Gateway: {selectedOrder.refund?.gateway || "PHONEPE_REFUND"} · Verified: {selectedOrder.refund?.verifiedAt || "Recorded"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#24242a] space-y-2">
                  <div className="flex justify-between text-[#9e9ea8]">
                    <span>Component 1: Items (Tax-Inclusive):</span>
                    <span className="text-white font-semibold">{formatPrice(selectedOrder.itemsSubtotalRupees)}</span>
                  </div>
                  <div className="flex justify-between text-[#9e9ea8]">
                    <span>Component 2: Insured Delivery Fee:</span>
                    <span className="text-white font-semibold">{formatPrice(selectedOrder.deliveryFeeRupees)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#2e2e34] font-bold text-white">
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

              <div className="p-3 rounded-xl bg-[#16161a] border border-[#2e2e34] space-y-1 text-[11px] text-[#9e9ea8]">
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
                          className="h-16 w-full object-cover rounded-lg border border-[#2e2e34]"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#2e2e34] pt-4">
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
                className="px-5 py-2 rounded-xl bg-[#2e2e34] text-xs font-semibold text-white hover:bg-[#3e3e46]"
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
          <div className="w-full max-w-2xl rounded-2xl bg-[#1c1c20] border border-[#2e2e34] p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2e2e34] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#c59b6d] tracking-wider block">
                  Product Editorial & Commercial Review
                </span>
                <h3 className="font-semibold text-lg text-white">{reviewedProduct.name}</h3>
                <p className="text-xs text-[#9e9ea8]">Category: {reviewedProduct.category}</p>
              </div>
              <button
                onClick={() => setReviewedProduct(null)}
                className="text-xs text-[#9e9ea8] hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Product Gallery Images Preview in Review Modal */}
              {reviewedProduct.imageUrls && reviewedProduct.imageUrls.length > 0 && (
                <div className="space-y-2">
                  <strong className="text-[#9e9ea8] block">Attached Media Gallery ({reviewedProduct.imageUrls.length}):</strong>
                  <div className="flex flex-wrap gap-2">
                    {reviewedProduct.imageUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative h-16 w-20 rounded-lg overflow-hidden border border-[#3e3e46] hover:border-[#c59b6d] transition-all shrink-0"
                      >
                        <img src={url} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#24242a] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">Purchase Mode:</span>
                  <span className="font-semibold text-[#c59b6d]">{reviewedProduct.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">Tax-Inclusive Price:</span>
                  <span className="font-semibold text-white">
                    {reviewedProduct.isVariablePrice && reviewedProduct.minPriceRupees
                      ? `From ${formatPrice(reviewedProduct.minPriceRupees)}`
                      : formatPrice(reviewedProduct.priceRupees)}
                  </span>
                </div>
                {reviewedProduct.subcategory && (
                  <div className="flex justify-between">
                    <span className="text-[#9e9ea8]">Subcategory:</span>
                    <span className="text-white font-medium">{reviewedProduct.subcategory}</span>
                  </div>
                )}
                {reviewedProduct.productType && (
                  <div className="flex justify-between">
                    <span className="text-[#9e9ea8]">Product Type:</span>
                    <span className="text-[#c59b6d] font-mono">{reviewedProduct.productType}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">Dimensions:</span>
                  <span className="text-white font-mono">{reviewedProduct.dimensions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">Net Product Weight:</span>
                  <span className="text-white font-mono">{(reviewedProduct.weightGrams / 1000).toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">Packed Weight vs Volumetric:</span>
                  <span className="text-white font-mono">
                    {reviewedProduct.packedWeightKg} kg actual / {reviewedProduct.packedVolumetricKg} kg volumetric
                  </span>
                </div>
              </div>

              {/* Variants Breakdown in Review Modal */}
              {reviewedProduct.variants && reviewedProduct.variants.length > 0 && (
                <div className="space-y-2">
                  <strong className="text-[#9e9ea8] block">Configured Editions / Variants ({reviewedProduct.variants.length}):</strong>
                  <div className="divide-y divide-[#2e2e34] border border-[#2e2e34] rounded-xl overflow-hidden bg-[#16161a]">
                    {reviewedProduct.variants.map((v) => (
                      <div key={v.id} className="p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {v.imageUrl && (
                              <img src={v.imageUrl} alt={v.title} className="h-8 w-8 rounded object-cover border border-[#3e3e46]" />
                            )}
                            <div>
                              <span className="text-white font-medium block">{v.title}</span>
                              <span className="text-[10px] text-[#9e9ea8] font-mono">{v.sku}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[#c59b6d] font-semibold block">{formatPrice(v.priceRupees)}</span>
                            <span className="text-[10px] text-emerald-400">{v.stock} in stock</span>
                          </div>
                        </div>
                        {(v.dimensions || v.weightGrams || v.description || v.materialFinish) && (
                          <div className="pl-10 text-[10px] text-[#9e9ea8] space-y-0.5">
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
                <strong className="text-[#9e9ea8] block mb-1">Editorial Description:</strong>
                <p className="p-3 rounded-xl bg-[#16161a] border border-[#2e2e34] text-white leading-relaxed">
                  {reviewedProduct.fullDescription}
                </p>
              </div>

              <div>
                <strong className="text-[#9e9ea8] block mb-1">Materials & Fine Craft:</strong>
                <div className="flex flex-wrap gap-2">
                  {reviewedProduct.materials.map((mat, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#2a2a30] text-white text-[11px]">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#24242a] border border-[#2e2e34] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#9e9ea8] tracking-wider block">
                  Markdown Source Reference (Architecture Spec)
                </span>
                <p className="font-mono text-[11px] text-[#c59b6d]">{reviewedProduct.markdownFile}</p>
                <p className="text-[11px] text-[#9e9ea8]">{reviewedProduct.returnPolicy}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#2e2e34]">
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
                className="px-5 py-2 rounded-xl bg-[#2e2e34] text-xs font-semibold text-white hover:bg-[#3e3e46]"
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
          <div className="w-full max-w-lg rounded-2xl bg-[#1c1c20] border border-[#2e2e34] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
              <div>
                <h3 className="font-semibold text-base text-white">{selectedCustomer.name}</h3>
                <p className="text-xs text-[#c59b6d]">{selectedCustomer.practiceOrStudio || "Private Client"}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-xs text-[#9e9ea8] hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-[#24242a] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">Email:</span>
                  <span className="text-white font-semibold">
                    {selectedCustomer.email}{" "}
                    {selectedCustomer.emailVerified && (
                      <span className="ml-1.5 text-[10px] text-emerald-400">(Verified)</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">Mobile Phone:</span>
                  <span className="text-white font-semibold">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">Practice / Studio:</span>
                  <span className="text-white">
                    {selectedCustomer.practiceOrStudio || "Private Client"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">GSTIN Identifier:</span>
                  <span className="font-mono text-[#10b981] font-bold">
                    {selectedCustomer.gstin || "None (Retail Client)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">Primary Location:</span>
                  <span className="text-white">
                    {selectedCustomer.city}, {selectedCustomer.state} ({selectedCustomer.pincode})
                  </span>
                </div>
              </div>

              {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                <div className="p-3 rounded-xl bg-[#18181c] border border-[#2e2e34] space-y-2 max-h-40 overflow-y-auto">
                  <span className="text-[10px] text-[#9e9ea8] uppercase font-semibold block">
                    Saved Delivery Addresses ({selectedCustomer.addresses.length})
                  </span>
                  {selectedCustomer.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="text-[11px] text-[#d0d0d8] border-t border-[#2e2e34] pt-1.5 first:border-t-0 first:pt-0"
                    >
                      <div className="flex justify-between font-semibold text-white">
                        <span>{addr.label} · {addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] text-emerald-400 uppercase">Default</span>
                        )}
                      </div>
                      <p className="text-[#9e9ea8]">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ""} — {addr.city}, {addr.state} ({addr.pincode})
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#18181c] border border-[#2e2e34] text-center">
                  <span className="text-[10px] text-[#9e9ea8] uppercase block">Lifetime Orders</span>
                  <strong className="text-lg text-white">{selectedCustomer.totalOrders}</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#18181c] border border-[#2e2e34] text-center">
                  <span className="text-[10px] text-[#9e9ea8] uppercase block">Lifetime Spend</span>
                  <strong className="text-lg text-white">{formatPrice(selectedCustomer.lifetimeSpendRupees)}</strong>
                </div>
              </div>

              {selectedCustomer.notes && (
                <div className="p-3 rounded-xl bg-[#24242a] border border-[#2e2e34]">
                  <strong className="text-[11px] text-[#9e9ea8] block mb-0.5">Staff Internal Notes:</strong>
                  <p className="text-white text-xs">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-[#2e2e34] text-xs font-semibold text-white hover:bg-[#3e3e46]"
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
          <div className="w-full max-w-lg rounded-2xl border border-[#3e3e46] bg-[#1c1c20] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2e2e34] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#c59b6d] block">
                  Studio Workshop Quality Control
                </span>
                <h3 className="font-semibold text-white text-base">
                  QC Inspection & Customer Photo Upload
                </h3>
                <p className="text-xs text-[#9e9ea8]">
                  Order: <strong className="font-mono text-white">{qcOrderModal.orderNumber}</strong> · Client: {qcOrderModal.customerName}
                </p>
              </div>
              <button
                onClick={() => setQcOrderModal(null)}
                className="text-[#9e9ea8] hover:text-white text-sm"
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
                  className="w-full rounded-xl border border-[#3e3e46] bg-[#121214] p-3 text-xs text-white placeholder-[#6e6e76] focus:outline-none focus:border-[#c59b6d]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-white font-semibold">
                    Workshop QC Photos (Upload from Computer or Paste URLs)
                  </label>
                  <label className="cursor-pointer rounded-lg bg-[#2a2a30] border border-[#3e3e46] px-3 py-1.5 text-[11px] font-semibold text-[#c59b6d] hover:bg-[#34343c] transition-colors">
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
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-[#2e2e34] aspect-[16/10] bg-[#121214]">
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
                  className="w-full rounded-xl border border-[#3e3e46] bg-[#121214] p-3 text-xs font-mono text-white placeholder-[#6e6e76] focus:outline-none focus:border-[#c59b6d]"
                />
                <p className="text-[11px] text-[#9e9ea8]">
                  Uploaded photos are stored in `/uploads/qc/{qcOrderModal.orderNumber}/` and rendered inside the customer's /track and account order portal.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#24242a] border border-[#2e2e34] text-[11px] text-[#9e9ea8]">
                Financial Status: Verified Advance ₹{qcOrderModal.amountPaidRupees.toLocaleString("en-IN")} · Balance Due: ₹{qcOrderModal.balanceDueRupees.toLocaleString("en-IN")}.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2e2e34]">
              <button
                type="button"
                onClick={() => setQcOrderModal(null)}
                className="px-4 py-2 rounded-xl border border-[#3e3e46] text-xs text-[#9e9ea8] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQc}
                className="px-5 py-2 rounded-xl bg-[#10b981] text-[#121214] font-semibold text-xs hover:bg-[#059669] transition-colors"
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
            <div className="w-full max-w-2xl rounded-2xl bg-[#1c1c20] border border-[#2e2e34] p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#c59b6d] tracking-wider block">
                    Commercial Offer Engine · TAV-07
                  </span>
                  <h3 className="font-semibold text-base text-white">Issue 30-Day Locked Architectural Proposal</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProposalModalOpen(false)}
                  className="text-xs text-[#9e9ea8] hover:text-white"
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
                      className="w-full rounded-xl border border-[#3e3e46] bg-[#121214] p-2.5 text-white focus:outline-none focus:border-[#c59b6d]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white font-semibold">Client Email (Proposal Destination) *</label>
                    <input
                      type="email"
                      required
                      value={proposalForm.customerEmail}
                      onChange={(e) => setProposalForm({ ...proposalForm, customerEmail: e.target.value })}
                      className="w-full rounded-xl border border-[#3e3e46] bg-[#121214] p-2.5 text-white focus:outline-none focus:border-[#c59b6d]"
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
                      className="w-full rounded-xl border border-[#3e3e46] bg-[#121214] p-2.5 text-white focus:outline-none focus:border-[#c59b6d]"
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
                      className="w-full rounded-xl border border-[#3e3e46] bg-[#121214] p-2.5 font-mono text-white focus:outline-none focus:border-[#c59b6d]"
                    />
                  </div>
                </div>

                {/* Bespoke Line Items Editor */}
                <div className="space-y-3 pt-2 border-t border-[#2e2e34]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">Bespoke Architectural Line Items ({proposalForm.lineItems.length})</h4>
                      <p className="text-[11px] text-[#9e9ea8]">Add individual custom editions, materials, and artisan finish specifications.</p>
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
                      className="px-3 py-1 rounded-lg bg-[#2e2e34] text-[#c59b6d] hover:bg-[#3e3e46] text-xs font-semibold"
                    >
                      + Add Line Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {proposalForm.lineItems.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#121214] border border-[#2e2e34] grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-12 sm:col-span-5 space-y-1">
                          <label className="text-[10px] text-[#9e9ea8] font-semibold uppercase">Item Name / Edition</label>
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
                            className="w-full rounded-lg border border-[#3e3e46] bg-[#1c1c20] p-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-3 space-y-1">
                          <label className="text-[10px] text-[#9e9ea8] font-semibold uppercase">Finish / Patina</label>
                          <input
                            type="text"
                            placeholder="e.g. Antiqued Brass"
                            value={item.finish}
                            onChange={(e) => {
                              const next = [...proposalForm.lineItems];
                              next[idx].finish = e.target.value;
                              setProposalForm({ ...proposalForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#3e3e46] bg-[#1c1c20] p-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-1 space-y-1">
                          <label className="text-[10px] text-[#9e9ea8] font-semibold uppercase">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const next = [...proposalForm.lineItems];
                              next[idx].quantity = Math.max(1, Number(e.target.value));
                              setProposalForm({ ...proposalForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#3e3e46] bg-[#1c1c20] p-1.5 text-white text-xs text-center font-bold"
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-2 space-y-1">
                          <label className="text-[10px] text-[#9e9ea8] font-semibold uppercase">Rate (₹)</label>
                          <input
                            type="number"
                            min="1"
                            value={item.unitPriceRupees}
                            onChange={(e) => {
                              const next = [...proposalForm.lineItems];
                              next[idx].unitPriceRupees = Math.max(0, Number(e.target.value));
                              setProposalForm({ ...proposalForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#3e3e46] bg-[#1c1c20] p-1.5 text-white text-xs font-mono"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#2e2e34]">
                  <div className="space-y-1">
                    <label className="text-white font-semibold">Custom Insured Wooden Crating &amp; Freight (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={proposalForm.deliveryChargeRupees}
                      onChange={(e) => setProposalForm({ ...proposalForm, deliveryChargeRupees: Math.max(0, Number(e.target.value)) })}
                      className="w-full rounded-xl border border-[#3e3e46] bg-[#121214] p-2.5 text-white font-mono"
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
                      className="w-full rounded-xl border border-[#3e3e46] bg-[#121214] p-2.5 text-white"
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
                    className="w-full rounded-xl border border-[#3e3e46] bg-[#121214] p-2.5 text-white font-mono text-[11px]"
                  />
                </div>

                {/* Computed Ledger Breakdown */}
                <div className="p-4 rounded-xl bg-[#121214] border border-[#2e2e34] space-y-1.5">
                  <div className="flex justify-between text-[#9e9ea8]">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-white">{formatPrice(itemsSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#9e9ea8]">
                    <span>Insured Crating &amp; Transport:</span>
                    <span className="font-semibold text-white">{delivery === 0 ? "Complimentary" : formatPrice(delivery)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1.5 border-t border-[#2e2e34]">
                    <span>Total Quoted Value (Tax-Inclusive):</span>
                    <span className="text-[#c59b6d]">{formatPrice(totalQuoted)}</span>
                  </div>
                  <div className="flex justify-between text-[#c59b6d] font-semibold pt-1">
                    <span>25% Production Advance Required:</span>
                    <span>{formatPrice(advanceRequired)}</span>
                  </div>
                  <div className="flex justify-between text-[#9e9ea8]">
                    <span>75% Final Balance (Due post-QC before dispatch):</span>
                    <span>{formatPrice(balanceDue)}</span>
                  </div>
                  <div className="pt-2 text-[10px] text-[#9e9ea8] border-t border-[#2e2e34]">
                    ⏳ <strong>TAV-07 Clock Lock:</strong> Automatically valid for 30 calendar days from issuance.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2e2e34]">
                  <button
                    type="button"
                    onClick={() => setIsProposalModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#3e3e46] text-xs text-[#9e9ea8] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingProposal || totalQuoted <= 0}
                    className="px-5 py-2 rounded-xl bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors disabled:opacity-50"
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
            <div className="w-full max-w-2xl rounded-2xl bg-[#1c1c20] border border-[#2e2e34] p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
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
                  className="text-xs text-[#9e9ea8] hover:text-white"
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
                <div className="p-3 rounded-xl bg-[#121214] border border-[#2e2e34] flex flex-wrap justify-between gap-2 text-[#9e9ea8]">
                  <span>Client: <strong className="text-white">{revisionQuote.customerName}</strong></span>
                  <span>Email: <strong className="text-white">{revisionQuote.customerEmail}</strong></span>
                  <span>Destination: <strong className="text-white font-mono">PIN {revisionQuote.deliveryPincode}</strong></span>
                </div>

                {/* Line Items Editor */}
                <div className="space-y-3 pt-2 border-t border-[#2e2e34]">
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
                      className="px-3 py-1 rounded-lg bg-[#2e2e34] text-[#c59b6d] hover:bg-[#3e3e46] text-xs font-semibold"
                    >
                      + Add Line Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {revisionForm.lineItems.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#121214] border border-[#2e2e34] grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-12 sm:col-span-5 space-y-1">
                          <label className="text-[10px] text-[#9e9ea8] font-semibold uppercase">Item Name</label>
                          <input
                            type="text"
                            required
                            value={item.name}
                            onChange={(e) => {
                              const next = [...revisionForm.lineItems];
                              next[idx].name = e.target.value;
                              setRevisionForm({ ...revisionForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#3e3e46] bg-[#1c1c20] p-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-3 space-y-1">
                          <label className="text-[10px] text-[#9e9ea8] font-semibold uppercase">Finish</label>
                          <input
                            type="text"
                            value={item.finish}
                            onChange={(e) => {
                              const next = [...revisionForm.lineItems];
                              next[idx].finish = e.target.value;
                              setRevisionForm({ ...revisionForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#3e3e46] bg-[#1c1c20] p-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-1 space-y-1">
                          <label className="text-[10px] text-[#9e9ea8] font-semibold uppercase">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const next = [...revisionForm.lineItems];
                              next[idx].quantity = Math.max(1, Number(e.target.value));
                              setRevisionForm({ ...revisionForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#3e3e46] bg-[#1c1c20] p-1.5 text-white text-xs text-center font-bold"
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-2 space-y-1">
                          <label className="text-[10px] text-[#9e9ea8] font-semibold uppercase">Rate (₹)</label>
                          <input
                            type="number"
                            min="1"
                            value={item.unitPriceRupees}
                            onChange={(e) => {
                              const next = [...revisionForm.lineItems];
                              next[idx].unitPriceRupees = Math.max(0, Number(e.target.value));
                              setRevisionForm({ ...revisionForm, lineItems: next });
                            }}
                            className="w-full rounded-lg border border-[#3e3e46] bg-[#1c1c20] p-1.5 text-white text-xs font-mono"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#2e2e34]">
                  <div className="space-y-1">
                    <label className="text-white font-semibold">Custom Insured Freight (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={revisionForm.deliveryChargeRupees}
                      onChange={(e) => setRevisionForm({ ...revisionForm, deliveryChargeRupees: Math.max(0, Number(e.target.value)) })}
                      className="w-full rounded-xl border border-[#3e3e46] bg-[#121214] p-2.5 text-white font-mono"
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
                      className="w-full rounded-xl border border-[#3e3e46] bg-[#121214] p-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-white font-semibold">Scope Modifications &amp; Revision Notes</label>
                  <textarea
                    rows={3}
                    value={revisionForm.notes}
                    onChange={(e) => setRevisionForm({ ...revisionForm, notes: e.target.value })}
                    className="w-full rounded-xl border border-[#3e3e46] bg-[#121214] p-2.5 text-white font-mono text-[11px]"
                  />
                </div>

                {/* Computed Ledger Breakdown */}
                <div className="p-4 rounded-xl bg-[#121214] border border-[#2e2e34] space-y-1.5">
                  <div className="flex justify-between text-[#9e9ea8]">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-white">{formatPrice(itemsSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#9e9ea8]">
                    <span>Insured Crating &amp; Transport:</span>
                    <span className="font-semibold text-white">{delivery === 0 ? "Complimentary" : formatPrice(delivery)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1.5 border-t border-[#2e2e34]">
                    <span>Revised Quoted Commitment:</span>
                    <span className="text-[#c59b6d]">{formatPrice(totalQuoted)}</span>
                  </div>
                  <div className="flex justify-between text-[#c59b6d] font-semibold pt-1">
                    <span>25% Advance Required:</span>
                    <span>{formatPrice(advanceRequired)}</span>
                  </div>
                  <div className="flex justify-between text-[#9e9ea8]">
                    <span>75% Final Balance:</span>
                    <span>{formatPrice(balanceDue)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2e2e34]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRevisionModalOpen(false);
                      setRevisionQuote(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-[#3e3e46] text-xs text-[#9e9ea8] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRevision || totalQuoted <= 0}
                    className="px-5 py-2 rounded-xl bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors disabled:opacity-50"
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
          <div className="w-full max-w-2xl rounded-2xl bg-[#1c1c20] border border-[#2e2e34] p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
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
                className="text-xs text-[#9e9ea8] hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            {/* Option 1: Synchronize all product folders from docs/products/* */}
            <div className="p-4 rounded-xl bg-[#24242a] border border-[#2e2e34] flex flex-wrap items-center justify-between gap-4">
              <div>
                <strong className="text-white text-xs block">Sync Authoritative Product Folders</strong>
                <p className="text-[11px] text-[#9e9ea8]">
                  Automatically parse and upsert all product folder packages from <code className="font-mono text-[#c59b6d]">docs/products/*</code> and sync their <code className="font-mono text-[#c59b6d]">images/</code>.
                </p>
              </div>
              <button
                onClick={handleSyncMarkdownDocs}
                disabled={isImporting}
                className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors disabled:opacity-50"
              >
                {isImporting ? "Syncing Folders..." : "Sync docs/products/*"}
              </button>
            </div>

            {/* Option 2: Upload single .md specification */}
            <div className="p-4 rounded-xl bg-[#24242a] border border-[#2e2e34] space-y-3">
              <div>
                <strong className="text-white text-xs block">Upload Single Markdown File (.md)</strong>
                <p className="text-[11px] text-[#9e9ea8]">
                  Import an individual product markdown specification containing YAML frontmatter headers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept=".md"
                  onChange={(e) => setSelectedMdFile(e.target.files?.[0] || null)}
                  className="text-xs text-[#9e9ea8] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#2e2e34] file:text-white hover:file:bg-[#3e3e46] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleUploadSingleMdFile}
                  disabled={isImporting || !selectedMdFile}
                  className="px-4 py-2 rounded-xl bg-[#2e2e34] border border-[#3e3e46] text-white font-semibold text-xs hover:bg-[#3e3e46] transition-colors disabled:opacity-50"
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
                className="w-full rounded-xl border border-[#3e3e46] bg-[#121214] p-3 text-xs font-mono text-white placeholder-[#6e6e76] focus:outline-none focus:border-[#c59b6d]"
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

            <div className="flex items-center justify-between pt-3 border-t border-[#2e2e34]">
              <span className="text-[11px] text-[#9e9ea8]">
                Preserves two-component pricing and non-executable documentation integrity.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportFeedback(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-[#3e3e46] text-xs text-[#9e9ea8] hover:text-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleImportSingleMarkdown}
                  disabled={isImporting || !markdownInput.trim()}
                  className="px-5 py-2 rounded-xl bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors disabled:opacity-50"
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
