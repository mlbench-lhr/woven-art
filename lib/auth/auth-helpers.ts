import api from "@/lib/api/axios-config";
import { VendorDetails } from "../mongodb/models/User";

export interface SignUpData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  vendorDetails?: VendorDetails;
}

export interface SignInData {
  email: string;
  password: string;
  expectedRole?: "admin" | "vendor" | "user";
}

export const signUp = async (userData: SignUpData) => {
  try {
    const response = await api.post("/api/auth/signup", userData);

    // Set auth cookie
    if (response.data.token) {
      document.cookie = `auth_token=${response.data.token}; path=/; max-age=${
        7 * 24 * 60 * 60
      }; secure; samesite=strict`;
    }

    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message:
          error.response?.data?.error || error.message || "Sign up failed",
      },
    };
  }
};

export const signIn = async (
  email: string,
  password: string,
  expectedRole?: "admin" | "vendor" | "user"
) => {
  try {
    console.log("signIn called with email:", email, "and password:", password);
    const response = await api.post("/api/auth/signin", {
      email,
      password,
      expectedRole,
    });

    // Set auth cookie
    if (response.data.token) {
      document.cookie = `auth_token=${response.data.token}; path=/; max-age=${
        7 * 24 * 60 * 60
      }; secure; samesite=strict`;
    }

    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message:
          error.response?.data?.error || error.message || "Sign in failed",
      },
    };
  }
};

export const signInWithGoogle = async (
  redirectTo?: string,
  expectedRole?: "admin" | "vendor" | "user"
) => {
  try {
    if (redirectTo) {
      const safe = redirectTo.startsWith("/") ? redirectTo : "/dashboard";
      document.cookie = `post_login_redirect=${encodeURIComponent(safe)}; path=/; max-age=${5 * 60}; samesite=strict`;
    }
    if (expectedRole) {
      document.cookie = `login_expected_role=${expectedRole}; path=/; max-age=${5 * 60}; samesite=strict`;
    }
    window.location.href = "/api/auth/google";
    return { error: null };
  } catch (error: any) {
    return {
      error: { message: error.message || "Google sign in failed" },
    };
  }
};

export const signOut = async () => {
  try {
    await api.post("/api/auth/signout");

    // Clear auth cookie
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    return { error: null };
  } catch (error: any) {
    // Still clear cookie even if server call fails
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    return {
      error: {
        message:
          error.response?.data?.error || error.message || "Sign out failed",
      },
    };
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post("/api/auth/forgot-password", { email });
    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message:
          error.response?.data?.error ||
          error.message ||
          "Failed to send reset email",
      },
    };
  }
};

export const updatePassword = async (token: string, password: string) => {
  try {
    const response = await api.post("/api/auth/reset-password", {
      token,
      password,
    });
    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message:
          error.response?.data?.error ||
          error.message ||
          "Failed to update password",
      },
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/api/auth/me");
    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message:
          error.response?.data?.error || error.message || "Failed to get user",
      },
    };
  }
};
