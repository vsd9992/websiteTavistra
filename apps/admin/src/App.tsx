import { useState, useMemo } from "react";
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

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "ORDERS" | "PRODUCTION" | "DISPATCH" | "TICKETS" | "CUSTOMERS" | "CATALOGUE" | "PINCODES" | "SETTINGS" | "AUDIT"
  >("OVERVIEW");

  // State
  const [currentStaff, setCurrentStaff] = useState<StaffUser>(STAFF_USERS[0]);
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [inquiries] = useState<BulkInquiry[]>(INITIAL_BULK_INQUIRIES);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [customers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [catalogue, setCatalogue] = useState<CatalogueItem[]>(INITIAL_CATALOGUE);
  const [pincodes, setPincodes] = useState<PincodeEntry[]>(INITIAL_PINCODES);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(INITIAL_AUDIT_LOGS);

  // System Settings State
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Search & Filters
  const [orderSearch, setOrderSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<"ALL" | "READY_STOCK" | "MADE_TO_ORDER">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Ticket detail view
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");

  // Customer inspector
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  // Product Review Modal
  const [reviewedProduct, setReviewedProduct] = useState<CatalogueItem | null>(null);

  // PIN Code search
  const [pinSearch, setPinSearch] = useState("");

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

  // Statistics
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + o.amountPaidRupees, 0);
    const mtoGraceCount = orders.filter((o) => o.status === "GRACE_PERIOD_ACTIVE").length;
    const inProductionCount = orders.filter((o) => o.status === "WORKSHOP_CRAFTING").length;
    const openTicketsCount = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
    const newInquiriesCount = inquiries.filter((i) => i.status === "NEW").length;
    const serviceablePinsCount = pincodes.filter((p) => p.isServiceable).length;

    return {
      totalRevenue,
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
      const query = orderSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.pincode.includes(query);
      return matchesMode && matchesSearch;
    });
  }, [orders, modeFilter, orderSearch]);

  // Filtered PIN codes
  const filteredPincodes = useMemo(() => {
    const query = pinSearch.toLowerCase().trim();
    if (!query) return pincodes;
    return pincodes.filter(
      (p) =>
        p.pincode.includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.state.toLowerCase().includes(query) ||
        p.zoneCode.toLowerCase().includes(query)
    );
  }, [pincodes, pinSearch]);

  // Release MTO order to workshop
  const handleReleaseToProduction = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          logAuditAction(
            "PRODUCTION_RELEASE",
            "Order",
            o.orderNumber,
            `Released to workshop crafting. Initial 7-day confirmation grace concluded.`
          );
          return {
            ...o,
            status: "WORKSHOP_CRAFTING",
            graceDaysRemaining: 0,
          };
        }
        return o;
      })
    );
  };

  // Cancel MTO order during grace
  const handleCancelOrder = (orderId: string) => {
    if (confirm("Are you sure you want to process a 100% full pre-production refund cancellation?")) {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            logAuditAction(
              "ORDER_CANCELLED_REFUND",
              "Order",
              o.orderNumber,
              `Processed 100% pre-production advance refund (₹${o.amountPaidRupees.toLocaleString("en-IN")}) during 7-day grace.`
            );
            return {
              ...o,
              status: "CANCELLED",
            };
          }
          return o;
        })
      );
    }
  };

  // Save AWB and Carrier
  const handleSaveAwb = (orderId: string) => {
    if (!awbInput.trim()) return;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const finalCarrier = carrierInput || o.carrierName;
          const finalAwb = awbInput.trim().toUpperCase();
          logAuditAction(
            "AWB_ASSIGNED",
            "Order",
            o.orderNumber,
            `Assigned carrier ${finalCarrier} with AWB tracking ${finalAwb}.`
          );
          return {
            ...o,
            carrierName: finalCarrier,
            awbNumber: finalAwb,
            status: "DISPATCHED",
          };
        }
        return o;
      })
    );
    setEditingAwbId(null);
    setCarrierInput("");
    setAwbInput("");
  };

  // Send reply to support ticket
  const handleSendTicketReply = () => {
    if (!selectedTicket || !ticketReplyText.trim()) return;

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

  // Toggle Catalogue Publication
  const handleTogglePublish = (itemId: string) => {
    setCatalogue((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, isPublished: !item.isPublished };
          logAuditAction(
            "CATALOGUE_TOGGLE",
            "CatalogueItem",
            item.slug,
            `Publication status toggled to ${updated.isPublished ? "PUBLISHED" : "UNPUBLISHED"}.`
          );
          return updated;
        }
        return item;
      })
    );
  };

  // Toggle Pincode Serviceability
  const handleTogglePincode = (pincodeId: string) => {
    setPincodes((prev) =>
      prev.map((p) => {
        if (p.id === pincodeId) {
          const updated = { ...p, isServiceable: !p.isServiceable };
          logAuditAction(
            "PINCODE_SERVICEABILITY_TOGGLE",
            "Pincode",
            p.pincode,
            `PIN ${p.pincode} serviceability set to ${updated.isServiceable ? "ACTIVE" : "DISABLED"}.`
          );
          return updated;
        }
        return p;
      })
    );
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
      {/* Top Notice: Staging / Dev Mode Notice */}
      <div className="bg-[#1c1c20] border-b border-[#2e2e34] px-6 py-1.5 text-[11px] text-[#9e9ea8] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            <strong className="text-white">Internal Studio Console</strong> · Local development environment (Windows workstation).
          </span>
        </div>
        <div className="text-[10px] text-[#c59b6d]">
          Role switcher active for operational testing. Production uses tokenized session cookies.
        </div>
      </div>

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
                  Verified Revenue
                </span>
                <p className="text-2xl font-bold text-white">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-[11px] text-[#10b981]">Advance & Full Payments</p>
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

              <div className="p-5 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9e9ea8]">
                  Active Delivery PINs
                </span>
                <p className="text-2xl font-bold text-white">{stats.serviceablePinsCount}</p>
                <p className="text-[11px] text-[#9e9ea8]">Across Zones A, B, C, D</p>
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#1c1c20] border border-[#2e2e34]">
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
                        <p className="text-[11px] text-[#10b981]">Paid: {formatPrice(order.amountPaidRupees)}</p>
                        {order.balanceDueRupees > 0 && (
                          <p className="text-[11px] text-[#f59e0b]">Due: {formatPrice(order.balanceDueRupees)}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#2a2a32] text-white border border-[#3e3e46]">
                          {order.status}
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
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-2">
              <h3 className="font-semibold text-sm text-amber-300 flex items-center gap-2">
                <span>⚠️</span> 7-Day Confirmation Grace & Production Cutoff (TAV-06)
              </h3>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Made to Order pieces enforce an independent 7-calendar-day grace period. Physical workshop machining strictly commences on <strong>Day 8</strong>. Customers are entitled to pre-production alterations or 100% full refund cancellations during this grace window.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders
                .filter((o) => o.mode === "MADE_TO_ORDER")
                .map((order) => {
                  const isGraceActive = order.status === "GRACE_PERIOD_ACTIVE";

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
                            isGraceActive
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
                          <span>Verified Advance (25%):</span>
                          <span className="font-semibold text-white">{formatPrice(order.amountPaidRupees)}</span>
                        </div>
                        <div className="flex justify-between text-[#9e9ea8]">
                          <span>Pre-Dispatch Balance (75%):</span>
                          <span className="font-semibold text-white">{formatPrice(order.balanceDueRupees)}</span>
                        </div>
                        <div className="flex justify-between text-[#f59e0b] pt-1 border-t border-[#2e2e34]">
                          <span>Grace Window Status:</span>
                          <span className="font-bold">
                            {isGraceActive
                              ? `${order.graceDaysRemaining} Days Remaining (Day 8 release)`
                              : "Grace Completed / Released"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        {isGraceActive ? (
                          <>
                            <button
                              onClick={() => handleReleaseToProduction(order.id)}
                              className="flex-1 py-2.5 rounded-xl bg-[#c59b6d] text-[#121214] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors shadow-sm"
                            >
                              Release to Workshop Machining
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="py-2.5 px-4 rounded-xl border border-red-800/60 text-red-400 font-semibold text-xs hover:bg-red-950/40 transition-colors"
                            >
                              100% Pre-Prod Refund
                            </button>
                          </>
                        ) : (
                          <div className="w-full text-center py-2 text-xs text-[#10b981] font-semibold bg-emerald-950/20 border border-emerald-800/40 rounded-xl">
                            ✓ Machining in Progress in VDesign Workshop
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

                  {editingAwbId === order.id ? (
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
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAwbId(null)}
                        className="px-3 py-2 rounded-xl border border-[#3e3e46] text-xs text-[#9e9ea8]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingAwbId(order.id);
                        setCarrierInput(order.carrierName);
                        setAwbInput(order.awbNumber || "");
                      }}
                      className="px-4 py-2 rounded-xl bg-[#2a2a30] text-xs font-semibold text-white hover:bg-[#34343c] transition-colors"
                    >
                      {order.awbNumber ? "Edit AWB / Carrier" : "+ Assign Carrier & AWB"}
                    </button>
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

        {/* TAB 7: CATALOGUE & PRODUCT REVIEW */}
        {activeTab === "CATALOGUE" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">Catalogue Editions & Live Inventory</h2>
                <p className="text-xs text-[#9e9ea8]">
                  Publish status, available workshop stock, and active reservations (TAV-02 & TAV-05). Click "Review Specs" to inspect full editorial copy, dimensions, and Markdown sources.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#2e2e34] bg-[#1c1c20] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181c] border-b border-[#2e2e34] text-[11px] uppercase tracking-wider text-[#9e9ea8]">
                  <tr>
                    <th className="py-3 px-4">Product Work</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Purchase Mode</th>
                    <th className="py-3 px-4">Unit Price</th>
                    <th className="py-3 px-4">Stock Ledger</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2e2e34]">
                  {catalogue.map((item) => (
                    <tr key={item.id} className="hover:bg-[#222228]/40 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white">
                        {item.name}
                        <span className="block text-[10px] font-mono text-[#9e9ea8]">{item.slug}</span>
                      </td>
                      <td className="py-4 px-4 text-[#9e9ea8]">{item.category}</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2a2a30] text-[#c59b6d]">
                          {item.mode}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">{formatPrice(item.priceRupees)}</td>
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
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2e2e34] pb-4">
              <div>
                <h2 className="text-base font-semibold text-white">Delivery PIN Code Governance & 12-Slab Ladder</h2>
                <p className="text-xs text-[#9e9ea8]">
                  Universal enabled-PIN serviceability. Approved 12 customer-payable slabs: ₹0, ₹250, ₹500, ₹750, ₹1000, ₹1500, ₹2000, ₹2500, ₹3000, ₹4000, ₹5000, ₹7500.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search PIN code, city, or zone..."
                value={pinSearch}
                onChange={(e) => setPinSearch(e.target.value)}
                className="rounded-xl border border-[#3e3e46] bg-[#1c1c20] px-4 py-2 text-xs text-white placeholder-[#6e6e76] w-full sm:w-64 focus:outline-none focus:border-[#c59b6d]"
              />
            </div>

            {/* Approved Delhi Origins Callout */}
            <div className="p-4 rounded-xl bg-[#1c1c20] border border-[#2e2e34] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[#c59b6d] font-semibold uppercase text-[10px] tracking-wider block">
                  Approved Delhi Fulfilment Origins (2026-11-06 Policy)
                </span>
                <p className="text-[#9e9ea8]">
                  Consignments originate from Delhi PINs: <strong className="text-white font-mono">110062, 110019, 110074</strong>. One common customer fee applies regardless of origin.
                </p>
              </div>
              <div className="text-[11px] text-[#10b981] font-semibold bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800">
                Universal Enabled-PIN Presumption Active
              </div>
            </div>

            {/* PIN Table */}
            <div className="rounded-2xl border border-[#2e2e34] bg-[#1c1c20] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181c] border-b border-[#2e2e34] text-[11px] uppercase tracking-wider text-[#9e9ea8]">
                  <tr>
                    <th className="py-3 px-4">PIN Code</th>
                    <th className="py-3 px-4">Destination City & State</th>
                    <th className="py-3 px-4">Assigned Commercial Zone</th>
                    <th className="py-3 px-4">Carrier Pre-Check</th>
                    <th className="py-3 px-4">Serviceability</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2e2e34]">
                  {filteredPincodes.map((pin) => (
                    <tr key={pin.id} className="hover:bg-[#222228]/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">{pin.pincode}</td>
                      <td className="py-3.5 px-4 text-white">
                        {pin.city}, {pin.state}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#24242a] text-[#c59b6d]">
                          {pin.zoneLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {pin.carrierAccepted ? (
                          <span className="text-[#10b981] font-medium text-[11px]">✓ Surface Freight Feasible</span>
                        ) : (
                          <span className="text-[#f43f5e] font-medium text-[11px]">✕ Remote Air Only</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleTogglePincode(pin.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            pin.isServiceable
                              ? "bg-[#2a2a30] text-[#f43f5e] hover:bg-[#34343c]"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
                          }`}
                        >
                          {pin.isServiceable ? "Disable PIN" : "Enable PIN"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
              {/* Card 1: Maintenance Mode */}
              <div className="p-6 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-white">Storefront Maintenance Mode</h3>
                  <button
                    onClick={() => {
                      const next = !maintenanceMode;
                      setMaintenanceMode(next);
                      logAuditAction(
                        "MAINTENANCE_TOGGLE",
                        "System",
                        "Storefront",
                        `Maintenance mode set to ${next ? "ENABLED" : "DISABLED"}.`
                      );
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      maintenanceMode
                        ? "bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900"
                        : "bg-[#24242a] text-[#9e9ea8] border border-[#3e3e46] hover:text-white"
                    }`}
                  >
                    {maintenanceMode ? "Maintenance Active" : "Storefront Live (Normal)"}
                  </button>
                </div>
                <p className="text-xs text-[#9e9ea8] leading-relaxed">
                  When enabled, all public catalog browsing displays a refined brand maintenance announcement while protecting active checkout and payment routes.
                </p>
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
                <span className="font-mono font-bold text-lg text-white">{selectedOrder.orderNumber}</span>
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
                {selectedOrder.balanceDueRupees > 0 && (
                  <div className="flex justify-between text-[#f59e0b] font-semibold">
                    <span>Pre-Dispatch Balance Due (75%):</span>
                    <span>{formatPrice(selectedOrder.balanceDueRupees)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
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
              <div className="p-4 rounded-xl bg-[#24242a] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">Purchase Mode:</span>
                  <span className="font-semibold text-[#c59b6d]">{reviewedProduct.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">Tax-Inclusive Price:</span>
                  <span className="font-semibold text-white">{formatPrice(reviewedProduct.priceRupees)}</span>
                </div>
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
              <a
                href={`http://localhost:3000/product/${reviewedProduct.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#c59b6d] hover:underline"
              >
                Open in Public Storefront ↗
              </a>
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
                  <span className="text-white font-semibold">{selectedCustomer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">Mobile Phone:</span>
                  <span className="text-white font-semibold">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">GSTIN Identifier:</span>
                  <span className="font-mono text-[#10b981] font-bold">
                    {selectedCustomer.gstin || "None (Retail Client)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9e9ea8]">Location:</span>
                  <span className="text-white">
                    {selectedCustomer.city}, {selectedCustomer.state} ({selectedCustomer.pincode})
                  </span>
                </div>
              </div>

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
    </div>
  );
}
