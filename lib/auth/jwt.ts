import jwt from "jsonwebtoken";
import type { IUser } from "@/lib/mongodb/models/User";

const JWT_SECRET = "123";
const JWT_EXPIRES_IN = "7d";

if (!JWT_SECRET) {
  throw new Error(
    "Please define the JWT_SECRET environment variable inside .env.local"
  );
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: "admin" | "user" | "vendor";
}

export function generateToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.decode(token!) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export function generateResetToken(): string {
  return jwt.sign({}, JWT_SECRET!, { expiresIn: "1h" });
}
