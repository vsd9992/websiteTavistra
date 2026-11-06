import { useState, useMemo } from "react";
import { INITIAL_ORDERS, INITIAL_BULK_INQUIRIES, AdminOrder, BulkInquiry } from "./data";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "ORDERS" | "PRODUCTION" | "FULFILMENT" | "INQUIRIES"
  >("OVERVIEW");

  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [inquiries, setInquiries] = useState<BulkInquiry[]>(INITIAL_BULK_INQUIRIES);

  // Search & Filters
  const [orderSearch, setOrderSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<"ALL" | "READY_STOCK" | "MADE_TO_ORDER">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // AWB Edit State
  const [editingAwbId, setEditingAwbId] = useState<string | null>(null);
  const [carrierInput, setCarrierInput] = useState("");
  const [awbInput, setAwbInput] = useState("");

  // Statistics
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + o.amountPaidRupees, 0);
    const mtoGraceCount = orders.filter((o) => o.status === "GRACE_PERIOD_ACTIVE").length;
    const inProductionCount = orders.filter((o) => o.status === "WORKSHOP_CRAFTING").length;
    const pendingAwbCount = orders.filter((o) => o.status === "PAYMENT_CONFIRMED" || !o.awbNumber).length;
    const newInquiriesCount = inquiries.filter((i) => i.status === "NEW").length;

    return {
      totalRevenue,
      mtoGraceCount,
      inProductionCount,
      pendingAwbCount,
      newInquiriesCount,
      totalOrders: orders.length,
    };
  }, [orders, inquiries]);

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

  // Release MTO order to workshop
  const handleReleaseToProduction = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
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
          return {
            ...o,
            carrierName: carrierInput || o.carrierName,
            awbNumber: awbInput.trim().toUpperCase(),
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

  // Update Inquiry Status
  const handleUpdateInquiryStatus = (id: string, newStatus: BulkInquiry["status"]) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
    );
  };

  const formatPrice = (rupees: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(rupees);

  return (
    <div className="min-h-screen flex flex-col bg-[#121214] text-[#f4f4f6]">
      {/* Top Header */}
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

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">Ar. Vikramaditya (Admin)</p>
              <p className="text-[10px] text-[#10b981]">● Production Operator Authorized</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-[#2e2e34] border border-[#3e3e46] flex items-center justify-center text-xs font-semibold">
              AV
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 overflow-x-auto border-t border-[#24242a]">
          {[
            { id: "OVERVIEW", label: "Dashboard Overview" },
            { id: "ORDERS", label: `Orders & Ledger (${orders.length})` },
            { id: "PRODUCTION", label: `7-Day Grace & Release (${stats.mtoGraceCount})` },
            { id: "FULFILMENT", label: `Courier Dispatch & AWB` },
            { id: "INQUIRIES", label: `Bulk Inquiries (${inquiries.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* VIEW 1: OVERVIEW */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9e9ea8]">
                  Verified Collected Revenue
                </span>
                <p className="text-2xl font-bold text-white">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-[11px] text-[#10b981]">Advance & Full Payments Verified</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9e9ea8]">
                  MTO 7-Day Grace Holds
                </span>
                <p className="text-2xl font-bold text-[#f59e0b]">{stats.mtoGraceCount}</p>
                <p className="text-[11px] text-[#9e9ea8]">Physical machining starts on Day 8</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9e9ea8]">
                  Workshop Active Crafting
                </span>
                <p className="text-2xl font-bold text-[#c59b6d]">{stats.inProductionCount}</p>
                <p className="text-[11px] text-[#9e9ea8]">Released to machine shop</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9e9ea8]">
                  Commercial Inquiries
                </span>
                <p className="text-2xl font-bold text-white">{stats.newInquiriesCount} New</p>
                <p className="text-[11px] text-[#9e9ea8]">Corporate / Hospitality Schedules</p>
              </div>
            </div>

            {/* Quick Operational Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Recent Orders */}
              <div className="lg:col-span-8 p-6 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-4">
                <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
                  <h3 className="font-semibold text-sm text-white">Recent Consignments</h3>
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

              {/* Right Column: Statutory & Governance Safeguards */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-4">
                <h3 className="font-semibold text-sm text-white">Commercial Governance Matrix</h3>
                <div className="space-y-3 text-xs text-[#9e9ea8] leading-relaxed">
                  <div className="p-3 rounded-xl bg-[#24242a] border border-[#2e2e34] space-y-1">
                    <strong className="text-white block">TAV-03 Two-Component Price</strong>
                    <p className="text-[11px]">Tax-inclusive product price + single combined delivery fee. No third customer charge.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#24242a] border border-[#2e2e34] space-y-1">
                    <strong className="text-white block">TAV-06 Production Cutoff</strong>
                    <p className="text-[11px]">25% advance verified required before Day 8 release. 100% balance required prior to dispatch.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#24242a] border border-[#2e2e34] space-y-1">
                    <strong className="text-white block">2026-11-06 Bulk Order Boundary</strong>
                    <p className="text-[11px]">Orders &gt;10 units per SKU or &gt;10 lines redirect to Commercial Bulk Enquiries.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ORDERS & PAYMENTS WORKLIST */}
        {activeTab === "ORDERS" && (
          <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#1c1c20] border border-[#2e2e34]">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search reference, client, or PIN..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="rounded-xl border border-[#3e3e46] bg-[#121214] px-4 py-2 text-xs text-white placeholder-[#6e6e76] focus:outline-none focus:border-[#c59b6d] w-full sm:w-64"
                />
              </div>

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

            {/* Orders Table */}
            <div className="rounded-2xl border border-[#2e2e34] bg-[#1c1c20] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181c] border-b border-[#2e2e34] text-[11px] uppercase tracking-wider text-[#9e9ea8]">
                  <tr>
                    <th className="py-3 px-4">Order Reference</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Client & Destination</th>
                    <th className="py-3 px-4">Financial Ledger</th>
                    <th className="py-3 px-4">Milestone Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
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
                        {order.status === "GRACE_PERIOD_ACTIVE" && (
                          <span className="block text-[10px] text-[#f59e0b] mt-0.5 font-medium">
                            {order.graceDaysRemaining} days remaining in grace
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-[#2a2a30] text-xs font-semibold text-white hover:bg-[#34343c] transition-colors"
                        >
                          Inspect Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: PRODUCTION RELEASE & 7-DAY GRACE */}
        {activeTab === "PRODUCTION" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-2">
              <h3 className="font-semibold text-sm text-amber-300 flex items-center gap-2">
                <span>⚠️</span> 7-Day Confirmation Grace & Workshop Machining Hold (TAV-06)
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
                  const canRelease = (order.graceDaysRemaining ?? 0) <= 0 || !isGraceActive;

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
                              title={canRelease ? "Grace completed: release to machining" : "Override: supervisor release to machining"}
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

        {/* VIEW 4: FULFILMENT & COURIER DISPATCH */}
        {activeTab === "FULFILMENT" && (
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
                        placeholder="Carrier (e.g. Blue Dart)"
                        value={carrierInput}
                        onChange={(e) => setCarrierInput(e.target.value)}
                        className="rounded-xl border border-[#3e3e46] bg-[#121214] px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="AWB Number (e.g. BD-89472911)"
                        value={awbInput}
                        onChange={(e) => setAwbInput(e.target.value)}
                        className="rounded-xl border border-[#3e3e46] bg-[#121214] px-3 py-2 text-xs text-white font-mono"
                      />
                      <button
                        onClick={() => handleSaveAwb(order.id)}
                        className="px-4 py-2 rounded-xl bg-[#10b981] text-[#121214] font-semibold text-xs hover:bg-[#059669]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAwbId(null)}
                        className="px-3 py-2 rounded-xl border border-[#3e3e46] text-xs text-[#9e9ea8] hover:text-white"
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
                      className="px-4 py-2 rounded-xl bg-[#2a2a30] text-xs font-semibold text-white hover:bg-[#34343c] transition-colors self-start md:self-auto"
                    >
                      {order.awbNumber ? "Edit AWB / Carrier" : "+ Assign Carrier & AWB"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: COMMERCIAL BULK INQUIRIES */}
        {activeTab === "INQUIRIES" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">Commercial Schedule & Bulk Inquiries</h2>
                <p className="text-xs text-[#9e9ea8]">
                  Enquiries exceeding the 10-unit/10-line ordinary limit or submitted for corporate/hospitality proposals.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-6 rounded-2xl bg-[#1c1c20] border border-[#2e2e34] space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#2e2e34] pb-3">
                    <div>
                      <span className="font-semibold text-sm text-white">{inq.practiceOrStudio}</span>
                      <p className="text-xs text-[#9e9ea8]">Contact: {inq.clientName} ({inq.phone})</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        inq.status === "NEW"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : inq.status === "IN_REVIEW"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-[#2a2a30] text-white"
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="text-white">
                      Requested: <strong className="text-[#c59b6d]">{inq.requestedEditions}</strong>
                    </p>
                    <p className="text-[#9e9ea8]">Quantity: <strong className="text-white">{inq.quantityUnits} Units</strong></p>
                    <p className="text-[#9e9ea8]">Destination: {inq.destinationCity} ({inq.destinationPincode})</p>
                    <p className="text-[11px] text-[#9e9ea8] bg-[#24242a] p-3 rounded-xl border border-[#2e2e34] mt-2">
                      "{inq.specifications}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#2e2e34] text-xs">
                    <button
                      onClick={() => handleUpdateInquiryStatus(inq.id, "IN_REVIEW")}
                      className="px-3 py-1.5 rounded-lg bg-[#2a2a30] text-white hover:bg-[#34343c]"
                    >
                      Mark In Review
                    </button>
                    <button
                      onClick={() => handleUpdateInquiryStatus(inq.id, "QUOTE_ISSUED")}
                      className="px-3 py-1.5 rounded-lg bg-[#c59b6d] text-[#121214] font-semibold hover:bg-[#d6aa7c]"
                    >
                      Issue 30-Day Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Selected Order Slide-Over Modal */}
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
    </div>
  );
}
