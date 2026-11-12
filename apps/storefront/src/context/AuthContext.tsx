"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface SavedAddress {
  id: string;
  label: string;
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
  practiceOrStudio?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  mfaMethod: "EMAIL" | "TOTP" | null;
  addresses: SavedAddress[];
  createdAt: string;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  requiresVerification?: boolean;
  requiresMfa?: boolean;
  mfaMethod?: "EMAIL" | "TOTP";
  mfaToken?: string;
  message?: string;
}

export interface TotpSetupResult {
  success: boolean;
  error?: string;
  secret?: string;
  otpAuthUri?: string;
  qrDataUrl?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  authLoading: boolean;
  isAuthenticated: boolean;
  refreshAccount: () => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<AuthActionResult>;
  requestLoginOtp: (email: string) => Promise<AuthActionResult>;
  verifyLoginOtp: (email: string, code: string) => Promise<AuthActionResult>;
  registerAccount: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    gstin?: string;
    practiceOrStudio?: string;
  }) => Promise<AuthActionResult>;
  verifyRegistrationEmail: (email: string, code: string) => Promise<AuthActionResult>;
  requestPasswordReset: (email: string) => Promise<AuthActionResult>;
  resetPasswordWithOtp: (email: string, code: string, newPassword: string) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    gstin?: string;
    practiceOrStudio?: string;
  }) => Promise<AuthActionResult>;
  addAddress: (address: Omit<SavedAddress, "id">) => Promise<AuthActionResult>;
  updateAddress: (id: string, address: Partial<Omit<SavedAddress, "id">>) => Promise<AuthActionResult>;
  deleteAddress: (id: string) => Promise<AuthActionResult>;
  setDefaultAddress: (id: string) => Promise<AuthActionResult>;
  verifyMfaChallenge: (mfaToken: string, code: string) => Promise<AuthActionResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthActionResult>;
  setupTotpMfa: () => Promise<TotpSetupResult>;
  verifyTotpMfa: (code: string) => Promise<AuthActionResult>;
  requestEmailMfaSetup: () => Promise<AuthActionResult>;
  verifyEmailMfaSetup: (code: string) => Promise<AuthActionResult>;
  disableMfa: (currentPassword: string) => Promise<AuthActionResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const refreshAccount = useCallback(async () => {
    try {
      const res = await fetch("/api/account", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.authenticated && data.user ? data.user : null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clean up legacy insecure localStorage mock state if present
    try {
      localStorage.removeItem("tavistra_user");
    } catch {}
    void refreshAccount();
  }, [refreshAccount]);

  const loginWithPassword = async (email: string, password: string): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mode: "password", email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || "Unable to sign in.",
          requiresVerification: Boolean(data.requiresVerification),
        };
      }
      if (data.requiresMfa) {
        return {
          success: false,
          requiresMfa: true,
          mfaMethod: data.mfaMethod,
          mfaToken: data.mfaToken,
          message: data.message,
        };
      }
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const requestLoginOtp = async (email: string): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mode: "otp_request", email }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Could not send code." };
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const verifyLoginOtp = async (email: string, code: string): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mode: "otp_verify", email, code }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Invalid verification code." };
      if (data.requiresMfa) {
        return {
          success: false,
          requiresMfa: true,
          mfaMethod: data.mfaMethod,
          mfaToken: data.mfaToken,
          message: data.message,
        };
      }
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const registerAccount = async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    gstin?: string;
    practiceOrStudio?: string;
  }): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Registration failed." };
      return {
        success: true,
        requiresVerification: true,
        message: data.message,
      };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const verifyRegistrationEmail = async (email: string, code: string): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Verification failed." };
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const requestPasswordReset = async (email: string): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Unable to send reset code." };
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const resetPasswordWithOtp = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Unable to reset password." };
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (payload: {
    name?: string;
    phone?: string;
    gstin?: string;
    practiceOrStudio?: string;
  }): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Failed to update profile." };
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const addAddress = async (address: Omit<SavedAddress, "id">): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(address),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Could not save address." };
      await refreshAccount();
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const updateAddress = async (
    id: string,
    address: Partial<Omit<SavedAddress, "id">>
  ): Promise<AuthActionResult> => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(address),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Could not update address." };
      await refreshAccount();
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const deleteAddress = async (id: string): Promise<AuthActionResult> => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Could not delete address." };
      await refreshAccount();
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const setDefaultAddress = async (id: string): Promise<AuthActionResult> => {
    return updateAddress(id, { isDefault: true });
  };

  const verifyMfaChallenge = async (mfaToken: string, code: string): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mode: "mfa_verify", mfaToken, code }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Invalid verification code." };
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Unable to update password." };
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const setupTotpMfa = async (): Promise<TotpSetupResult> => {
    try {
      const res = await fetch("/api/account/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "setup_totp" }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Unable to start MFA setup." };
      return {
        success: true,
        secret: data.secret,
        otpAuthUri: data.otpAuthUri,
        qrDataUrl: data.qrDataUrl,
      };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const verifyTotpMfa = async (code: string): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/account/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "verify_totp", code }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Invalid authenticator code." };
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const requestEmailMfaSetup = async (): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/account/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "enable_email_request" }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Could not send code." };
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const verifyEmailMfaSetup = async (code: string): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/account/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "enable_email_verify", code }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Invalid verification code." };
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const disableMfa = async (currentPassword: string): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/account/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "disable", currentPassword }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Unable to disable MFA." };
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        isAuthenticated: Boolean(user),
        refreshAccount,
        loginWithPassword,
        requestLoginOtp,
        verifyLoginOtp,
        registerAccount,
        verifyRegistrationEmail,
        requestPasswordReset,
        resetPasswordWithOtp,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        verifyMfaChallenge,
        changePassword,
        setupTotpMfa,
        verifyTotpMfa,
        requestEmailMfaSetup,
        verifyEmailMfaSetup,
        disableMfa,
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
