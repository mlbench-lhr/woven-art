const jsonHeaders = { "Content-Type": "application/json" };

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
  expectedRole?: "admin" | "vendor" | "user";
}

export const signUp = async (userData: SignUpData) => {
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: jsonHeaders,
      credentials: "include",
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Sign up failed");
    return { data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || "Sign up failed",
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
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: jsonHeaders,
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
        expectedRole,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Sign in failed");
    return { data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || "Sign in failed",
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
      const safe = redirectTo.startsWith("/") ? redirectTo : "/";
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
    await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "include",
    });
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    return { error: null };
  } catch (error: any) {
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    return {
      error: {
        message: error.message || "Sign out failed",
      },
    };
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: jsonHeaders,
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to send reset email");
    return { data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || "Failed to send reset email",
      },
    };
  }
};

export const updatePassword = async (token: string, password: string) => {
  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: jsonHeaders,
      credentials: "include",
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to update password");
    return { data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || "Failed to update password",
      },
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to get user");
    return { data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || "Failed to get user",
      },
    };
  }
};
