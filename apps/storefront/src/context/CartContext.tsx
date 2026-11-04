"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MockProduct } from "@/lib/products";

export interface CartItem {
  product: MockProduct;
  quantity: number;
}

interface CartContextType {
  readyStockItems: CartItem[];
  mtoItems: CartItem[];
  addToCart: (product: MockProduct) => void;
  removeFromCart: (productId: string, mode: "READY_STOCK" | "MADE_TO_ORDER") => void;
  updateQuantity: (
    productId: string,
    mode: "READY_STOCK" | "MADE_TO_ORDER",
    quantity: number
  ) => void;
  clearCart: (mode?: "READY_STOCK" | "MADE_TO_ORDER") => void;
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [readyStockItems, setReadyStockItems] = useState<CartItem[]>([]);
  const [mtoItems, setMtoItems] = useState<CartItem[]>([]);

  // Load from local storage on mount
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

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem("tavistra_cart_ready", JSON.stringify(readyStockItems));
      localStorage.setItem("tavistra_cart_mto", JSON.stringify(mtoItems));
    } catch {
      // Ignore local storage errors
    }
  }, [readyStockItems, mtoItems]);

  const addToCart = (product: MockProduct) => {
    if (product.mode === "QUOTE_ONLY") return; // Handled via inquiry form

    if (product.mode === "READY_STOCK") {
      setReadyStockItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
    } else if (product.mode === "MADE_TO_ORDER") {
      setMtoItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
    }
  };

  const removeFromCart = (
    productId: string,
    mode: "READY_STOCK" | "MADE_TO_ORDER"
  ) => {
    if (mode === "READY_STOCK") {
      setReadyStockItems((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
    } else {
      setMtoItems((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
    }
  };

  const updateQuantity = (
    productId: string,
    mode: "READY_STOCK" | "MADE_TO_ORDER",
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, mode);
      return;
    }
    if (mode === "READY_STOCK") {
      setReadyStockItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    } else {
      setMtoItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
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
