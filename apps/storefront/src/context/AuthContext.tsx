"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { validateEmail, validateIndianMobile } from "@tavistra/shared";

export interface SavedAddress {
  id: string;
  label: string; // e.g. "Design Studio", "Residence", "Site Office"
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  gstin?: string;
  addresses: SavedAddress[];
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, phoneOrPassword?: string) => { success: boolean; error?: string };
  register: (data: {
    name: string;
    email: string;
    phone: string;
    gstin?: string;
  }) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addAddress: (address: Omit<SavedAddress, "id">) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial demo user for convenient preview
const DEFAULT_DEMO_USER: UserProfile = {
  id: "usr_vdesign_001",
  name: "Ar. Vikramaditya Sharma",
  email: "vikramaditya@studiovishnu.in",
  phone: "+91 98765 43210",
  gstin: "07AAAAA0000A1Z5",
  createdAt: "October 2026",
  addresses: [
    {
      id: "addr_01",
      label: "Architectural Studio",
      fullName: "Ar. Vikramaditya Sharma",
      phone: "+91 98765 43210",
      addressLine1: "Penthouse 4B, Signature Towers",
      addressLine2: "Golf Course Road, Sector 42",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122002",
      isDefault: true,
    },
    {
      id: "addr_02",
      label: "Delhi Residence",
      fullName: "Ar. Vikramaditya Sharma",
      phone: "+91 98765 43210",
      addressLine1: "14 Barakhamba Road",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
      isDefault: false,
    },
  ],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Load from local storage or initialize demo account on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tavistra_user");
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        // Provide demo user by default so user can immediately view portal
        setUser(DEFAULT_DEMO_USER);
        localStorage.setItem("tavistra_user", JSON.stringify(DEFAULT_DEMO_USER));
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  // Save changes to local storage
  const persistUser = (updatedUser: UserProfile | null) => {
    setUser(updatedUser);
    try {
      if (updatedUser) {
        localStorage.setItem("tavistra_user", JSON.stringify(updatedUser));
        // Asynchronously sync profile to backend database
        fetch("/api/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            gstin: updatedUser.gstin,
          }),
        }).catch(() => {
          // Silent catch for offline development
        });
      } else {
        localStorage.removeItem("tavistra_user");
      }
    } catch {
      // Ignore local storage error
    }
  };

  const login = (email: string): { success: boolean; error?: string } => {
    const emailRes = validateEmail(email);
    if (!emailRes.isValid) {
      return { success: false, error: emailRes.error };
    }

    // If matches demo or existing, restore; otherwise create profile
    const existing = user?.email.toLowerCase() === email.trim().toLowerCase() ? user : {
      id: `usr_${Date.now()}`,
      name: email.split("@")[0],
      email: email.trim().toLowerCase(),
      phone: "+91 98765 43210",
      addresses: [],
      createdAt: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    };

    persistUser(existing);
    return { success: true };
  };

  const register = (data: {
    name: string;
    email: string;
    phone: string;
    gstin?: string;
  }): { success: boolean; error?: string } => {
    const emailRes = validateEmail(data.email);
    if (!emailRes.isValid) {
      return { success: false, error: emailRes.error };
    }

    const phoneRes = validateIndianMobile(data.phone);
    if (!phoneRes.isValid) {
      return { success: false, error: phoneRes.error };
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: emailRes.normalizedEmail || data.email.trim().toLowerCase(),
      phone: phoneRes.normalizedPhone || data.phone.trim(),
      gstin: data.gstin?.trim().toUpperCase(),
      addresses: [],
      createdAt: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    };

    persistUser(newUser);
    return { success: true };
  };

  const logout = () => {
    persistUser(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    persistUser(updated);
  };

  const addAddress = (address: Omit<SavedAddress, "id">) => {
    if (!user) return;
    const newAddress: SavedAddress = {
      ...address,
      id: `addr_${Date.now()}`,
    };

    let updatedAddresses = [...user.addresses];
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    } else if (updatedAddresses.length === 0) {
      newAddress.isDefault = true;
    }

    updatedAddresses.push(newAddress);
    persistUser({ ...user, addresses: updatedAddresses });
  };

  const deleteAddress = (id: string) => {
    if (!user) return;
    const remaining = user.addresses.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    persistUser({ ...user, addresses: remaining });
  };

  const setDefaultAddress = (id: string) => {
    if (!user) return;
    const updated = user.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    persistUser({ ...user, addresses: updated });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

