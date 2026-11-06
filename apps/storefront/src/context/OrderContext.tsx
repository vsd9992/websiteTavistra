"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type OrderStatus =
  | "PAYMENT_CONFIRMED"
  | "GRACE_PERIOD_ACTIVE"
  | "WORKSHOP_CRAFTING"
  | "QC_INSPECTION"
  | "DISPATCHED"
  | "DELIVERED";

export interface OrderRecord {
  id: string;
  mode: "READY_STOCK" | "MADE_TO_ORDER";
  customerName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  destinationPin: string;
  items: { name: string; quantity: number; pricePaise: number }[];
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
  graceDaysRemaining?: number;
  createdAt: string;
}

interface OrderContextType {
  orders: OrderRecord[];
  saveOrder: (order: OrderRecord) => void;
  lookupOrder: (orderId: string, phoneOrEmail: string) => OrderRecord | null;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Authoritative default orders to verify both Ready Stock and MTO lifecycles
const SEED_ORDERS: OrderRecord[] = [
  {
    id: "TAV-RS-2026-1001",
    mode: "READY_STOCK",
    customerName: "Ar. Vikramaditya Sharma",
    email: "vikramaditya@studiovishnu.in",
    phone: "+91 98765 43210",
    addressLine1: "Penthouse 4B, Signature Towers, Golf Course Road",
    city: "Gurugram",
    state: "Haryana",
    destinationPin: "122002",
    items: [
      { name: "Monolith Minimalist Wall Clock", quantity: 1, pricePaise: 399900 },
      { name: "Orbita Solid Brass Incense Burner", quantity: 2, pricePaise: 149900 },
    ],
    itemsSubtotalRupees: 6997,
    deliveryFeeRupees: 500,
    totalAmountRupees: 7497,
    amountPaidRupees: 7497,
    balanceDueRupees: 0,
    carrierName: "Blue Dart Fragile Surface",
    awbNumber: "BD-DEL-89472911",
    transitEstimate: "1–2 business days",
    status: "DISPATCHED",
    statusLabel: "In Transit with Carrier",
    statusDescription: "Consignment packed in bespoke shock-absorbing crating. Handed over to Blue Dart Express Air hub in Delhi.",
    createdAt: "November 4, 2026",
  },
  {
    id: "TAV-MTO-2026-2002",
    mode: "MADE_TO_ORDER",
    customerName: "Ar. Vikramaditya Sharma",
    email: "vikramaditya@studiovishnu.in",
    phone: "+91 98765 43210",
    addressLine1: "14 Barakhamba Road, Connaught Place",
    city: "New Delhi",
    state: "Delhi",
    destinationPin: "110001",
    items: [
      { name: "Arc Solid Brass Wall Mirror", quantity: 1, pricePaise: 2850000 },
    ],
    itemsSubtotalRupees: 28500,
    deliveryFeeRupees: 1500,
    totalAmountRupees: 30000,
    amountPaidRupees: 7500, // 25% verified advance
    balanceDueRupees: 22500, // 75% remaining
    carrierName: "Safeexpress Caged Heavy Freight",
    transitEstimate: "1–2 business days",
    status: "GRACE_PERIOD_ACTIVE",
    statusLabel: "7-Day Confirmation Grace Window Active",
    statusDescription: "25% advance verified. Physical workshop machining begins on Day 8. You may alter specifications or request 100% refund cancellation before Day 8.",
    graceDaysRemaining: 4,
    createdAt: "November 5, 2026",
  },
];

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tavistra_orders");
      if (saved) {
        const parsed: OrderRecord[] = JSON.parse(saved);
        // Merge seed orders if not present
        const merged = [...parsed];
        for (const seed of SEED_ORDERS) {
          if (!merged.some((o) => o.id === seed.id)) {
            merged.push(seed);
          }
        }
        setOrders(merged);
        localStorage.setItem("tavistra_orders", JSON.stringify(merged));
      } else {
        setOrders(SEED_ORDERS);
        localStorage.setItem("tavistra_orders", JSON.stringify(SEED_ORDERS));
      }
    } catch {
      setOrders(SEED_ORDERS);
    }
  }, []);

  const saveOrder = (order: OrderRecord) => {
    setOrders((prev) => {
      const exists = prev.find((o) => o.id === order.id);
      const updated = exists
        ? prev.map((o) => (o.id === order.id ? order : o))
        : [order, ...prev];
      try {
        localStorage.setItem("tavistra_orders", JSON.stringify(updated));
      } catch {
        // Ignore local storage error
      }
      return updated;
    });

    // Asynchronously persist to database via backend API
    try {
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      }).catch(() => {
        // Silent catch for offline development
      });
    } catch {
      // Ignore network errors in offline dev
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

