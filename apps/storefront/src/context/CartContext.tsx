"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MockProduct } from "@/lib/products";

export interface CartItem {
  product: MockProduct;
  quantity: number;
}

export function getCartLineKey(product: MockProduct): string {
  return product.variantId || product.sku || product.id;
}

interface CartContextType {
  readyStockItems: CartItem[];
  mtoItems: CartItem[];
  addToCart: (product: MockProduct) => void;
  removeFromCart: (lineKey: string, mode: "READY_STOCK" | "MADE_TO_ORDER") => void;
  updateQuantity: (
    lineKey: string,
    mode: "READY_STOCK" | "MADE_TO_ORDER",
    quantity: number
  ) => void;
  clearCart: (mode?: "READY_STOCK" | "MADE_TO_ORDER") => void;
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function upsertCartItem(prev: CartItem[], product: MockProduct): CartItem[] {
  const key = getCartLineKey(product);
  const maxStock =
    product.mode === "READY_STOCK" && typeof product.availableStock === "number"
      ? product.availableStock
      : Infinity;

  if (maxStock <= 0) return prev;

  const existing = prev.find((item) => getCartLineKey(item.product) === key);
  if (existing) {
    return prev.map((item) =>
      getCartLineKey(item.product) === key
        ? { ...item, product, quantity: Math.min(item.quantity + 1, maxStock) }
        : item
    );
  }
  return [...prev, { product, quantity: 1 }];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [readyStockItems, setReadyStockItems] = useState<CartItem[]>([]);
  const [mtoItems, setMtoItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const savedReady = localStorage.getItem("tavistra_cart_ready");
      const savedMto = localStorage.getItem("tavistra_cart_mto");
      if (savedReady) setReadyStockItems(JSON.parse(savedReady));
      if (savedMto) setMtoItems(JSON.parse(savedMto));
    } catch {
      // Ignore local storage errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("tavistra_cart_ready", JSON.stringify(readyStockItems));
      localStorage.setItem("tavistra_cart_mto", JSON.stringify(mtoItems));
    } catch {
      // Ignore local storage errors
    }
  }, [readyStockItems, mtoItems]);

  const addToCart = (product: MockProduct) => {
    if (product.mode === "QUOTE_ONLY") return;

    if (product.mode === "READY_STOCK") {
      setReadyStockItems((prev) => upsertCartItem(prev, product));
    } else if (product.mode === "MADE_TO_ORDER") {
      setMtoItems((prev) => upsertCartItem(prev, product));
    }
  };

  const removeFromCart = (
    lineKey: string,
    mode: "READY_STOCK" | "MADE_TO_ORDER"
  ) => {
    const matches = (item: CartItem) =>
      getCartLineKey(item.product) === lineKey || item.product.id === lineKey;
    if (mode === "READY_STOCK") {
      setReadyStockItems((prev) => prev.filter((item) => !matches(item)));
    } else {
      setMtoItems((prev) => prev.filter((item) => !matches(item)));
    }
  };

  const updateQuantity = (
    lineKey: string,
    mode: "READY_STOCK" | "MADE_TO_ORDER",
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(lineKey, mode);
      return;
    }
    const updateList = (prev: CartItem[]) =>
      prev.map((item) => {
        if (getCartLineKey(item.product) !== lineKey && item.product.id !== lineKey) {
          return item;
        }
        const maxStock =
          mode === "READY_STOCK" && typeof item.product.availableStock === "number"
            ? item.product.availableStock
            : Infinity;
        return { ...item, quantity: Math.max(1, Math.min(quantity, maxStock)) };
      });

    if (mode === "READY_STOCK") {
      setReadyStockItems(updateList);
    } else {
      setMtoItems(updateList);
    }
  };

  const clearCart = (mode?: "READY_STOCK" | "MADE_TO_ORDER") => {
    if (!mode || mode === "READY_STOCK") setReadyStockItems([]);
    if (!mode || mode === "MADE_TO_ORDER") setMtoItems([]);
  };

  const totalItemCount =
    readyStockItems.reduce((acc, item) => acc + item.quantity, 0) +
    mtoItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        readyStockItems,
        mtoItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
