"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_CONFIRMED"
  | "CONFIRMED"
  | "GRACE_PERIOD_ACTIVE"
  | "IN_PRODUCTION"
  | "WORKSHOP_CRAFTING"
  | "QC_INSPECTION"
  | "PRODUCTION_COMPLETED"
  | "AWAITING_DISPATCH"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderRefundRecord {
  amountRupees: number;
  status: string;
  gateway?: string;
  reference?: string;
  verifiedAt?: string | null;
  notes?: string | null;
}

export interface OrderRecord {
  id: string;
  orderNumber?: string;
  mode: "READY_STOCK" | "MADE_TO_ORDER";
  customerName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  destinationPin: string;
  gstin?: string;
  items: {
    productId?: string;
    variantId?: string;
    sku?: string;
    slug?: string;
    name: string;
    quantity: number;
    pricePaise: number;
  }[];
  itemsSubtotalRupees: number;
  deliveryFeeRupees: number;
  totalAmountRupees: number;
  amountPaidRupees: number;
  balanceDueRupees: number;
  carrierName: string;
  awbNumber?: string;
  transitEstimate: string;
  status: OrderStatus;
  statusLabel: string;
  statusDescription: string;
  paymentStatusLabel?: string;
  isFullyPaid?: boolean;
  isGraceActive?: boolean;
  releaseEligibleDate?: string | null;
  graceDaysRemaining?: number;
  qcNotes?: string;
  qcImages?: string[];
  refund?: OrderRefundRecord | null;
  cancelledAt?: string | null;
  createdAt: string;
}

export interface SaveOrderResult {
  success: boolean;
  error?: string;
  code?: string;
  orderNumber?: string;
  order?: {
    orderNumber: string;
    mode: "READY_STOCK" | "MADE_TO_ORDER";
    itemsSubtotalRupees: number;
    deliveryFeeRupees: number;
    totalAmountRupees: number;
    amountPaidRupees: number;
    balanceDueRupees: number;
    carrierName: string;
    transitEstimate: string;
    items: { name: string; quantity: number; pricePaise: number }[];
  };
}

interface OrderContextType {
  orders: OrderRecord[];
  saveOrder: (order: OrderRecord) => Promise<SaveOrderResult>;
  lookupOrder: (orderId: string, phoneOrEmail: string) => OrderRecord | null;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tavistra_orders");
      if (saved) {
        setOrders(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const saveOrder = async (order: OrderRecord): Promise<SaveOrderResult> => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(order),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        return {
          success: false,
          error: data?.error || "Unable to complete your order right now.",
          code: data?.code,
        };
      }

      const persistedRecord: OrderRecord = {
        ...order,
        id: data.orderNumber || order.id,
        orderNumber: data.orderNumber || order.id,
        itemsSubtotalRupees: data.order?.itemsSubtotalRupees ?? order.itemsSubtotalRupees,
        deliveryFeeRupees: data.order?.deliveryFeeRupees ?? order.deliveryFeeRupees,
        totalAmountRupees: data.order?.totalAmountRupees ?? order.totalAmountRupees,
        amountPaidRupees: data.order?.amountPaidRupees ?? order.amountPaidRupees,
        balanceDueRupees: data.order?.balanceDueRupees ?? order.balanceDueRupees,
        carrierName: data.order?.carrierName ?? order.carrierName,
        transitEstimate: data.order?.transitEstimate ?? order.transitEstimate,
      };

      setOrders((prev) => {
        const exists = prev.find((o) => o.id === persistedRecord.id);
        const updated = exists
          ? prev.map((o) => (o.id === persistedRecord.id ? persistedRecord : o))
          : [persistedRecord, ...prev];
        try {
          localStorage.setItem("tavistra_orders", JSON.stringify(updated));
        } catch {
          // Ignore storage errors
        }
        return updated;
      });

      return {
        success: true,
        orderNumber: persistedRecord.orderNumber,
        order: data.order,
      };
    } catch (err) {
      return {
        success: false,
        error: (err as Error).message || "Network error submitting order.",
      };
    }
  };

  const lookupOrder = (orderId: string, phoneOrEmail: string): OrderRecord | null => {
    const cleanId = orderId.trim().toUpperCase();
    const cleanContact = phoneOrEmail.trim().toLowerCase().replace(/[\s\-()]/g, "");

    return (
      orders.find((order) => {
        const idMatches = order.id.toUpperCase() === cleanId;
        if (!idMatches) return false;

        const emailMatches = order.email.toLowerCase() === cleanContact;
        const cleanOrderPhone = order.phone.replace(/[\s\-()]/g, "");
        const phoneMatches =
          cleanOrderPhone.includes(cleanContact) || cleanContact.includes(cleanOrderPhone);

        return emailMatches || phoneMatches;
      }) || null
    );
  };

  return (
    <OrderContext.Provider value={{ orders, saveOrder, lookupOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
