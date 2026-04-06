import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      let token = null;

      // First check Authorization header
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
      // If no Authorization header, check cookies ̰ ̰
      if (!token) {
        token = req.cookies.get("auth_token")?.value;
      }

      if (!token) {
        return NextResponse.json(
          { error: "Authorization token required" },
          { status: 401 }
        );
      }

      // Verify JWT token
      const payload = verifyToken(token);

      // Attach user info to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        userId: payload.userId,
        email: payload.email,
      };

      return handler(authenticatedReq);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  };
}

// Helper function to get user from request
export function getAuthUser(req: AuthenticatedRequest) {
  return req.user;
}
