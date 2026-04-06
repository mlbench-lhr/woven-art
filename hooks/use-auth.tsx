"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/lib/types/auth";
import {
  getCurrentUser,
  signOut as authSignOut,
} from "@/lib/auth/auth-helpers";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setReduxUser } from "@/lib/store/slices/authSlice";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data, error } = await getCurrentUser();
      if (data?.user) {
        dispatch(setReduxUser(data.user));
      }
      if (error || !data) {
        setUser(null);
        return;
      }
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      await fetchUser();
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await authSignOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      // Still clear user state even if server call fails
      setUser(null);
    }
  };

  const authValue: AuthContextType = {
    user,
    loading,
    signOut: handleSignOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
