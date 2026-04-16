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
    
    // Handle authentication errors (401, 404, etc.) - clear cookies on all auth failures
    if (!res.ok) {
      // Clear invalid/expired cookies for all authentication errors
      if (typeof window !== 'undefined') {
        // First try server-side cookie clearing (more reliable)
        try {
          await fetch("/api/auth/clear-cookies", {
            method: "POST",
            credentials: "include",
          });
        } catch (serverClearError) {
          console.log("Server-side cookie clear failed, trying client-side");
        }
        
        // Then try client-side clearing as backup
        const cookiesToClear = [
          "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;",
          "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;",
          "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.;",
          "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + (window.location.hostname || "localhost"),
        ];
        
        cookiesToClear.forEach(cookieString => {
          document.cookie = cookieString;
        });
        
        // Also try to clear all cookies that might contain auth_token
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.includes("auth_token")) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
          }
        });
      }
      
      // Try to get error message from response
      let errorMessage = "Session expired. Please log in again.";
      try {
        const data = await res.json();
        errorMessage = data?.error || errorMessage;
      } catch (jsonError) {
        // If JSON parsing fails, use default error message
        if (res.status === 404) {
          errorMessage = "User not found. Please log in again.";
        } else if (res.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        }
      }
      
      return {
        data: null,
        error: {
          message: errorMessage,
        },
      };
    }
    
    // For network errors (no response), don't clear cookies
    if (!res) {
      return {
        data: null,
        error: {
          message: "Network error. Please check your connection.",
        },
      };
    }
    
    const data = await res.json();
    return { data, error: null };
  } catch (error: any) {
    // Clear cookies on any authentication-related errors
    const shouldClearCookies = error.message && (
      error.message.includes("Token") || 
      error.message.includes("Authentication") ||
      error.message.includes("Unauthorized") ||
      error.message.includes("Forbidden") ||
      error.message.includes("User not found")
    );
    
    if (shouldClearCookies && typeof window !== 'undefined') {
      console.log("Clearing cookies in catch block...");
      
      // More robust cookie clearing - try multiple approaches
      const cookiesToClear = [
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;",
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;",
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.;",
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + (window.location.hostname || "localhost"),
      ];
      
      cookiesToClear.forEach(cookieString => {
        document.cookie = cookieString;
      });
      
      // Also try to clear all cookies that might contain auth_token
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.includes("auth_token")) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
        }
      });
      
      console.log("Cookies cleared in catch block");
      console.log("Current cookies after clearing:", document.cookie);
    }
    
    return {
      data: null,
      error: {
        message: error.message || "Failed to get user",
      },
    };
  }
};
