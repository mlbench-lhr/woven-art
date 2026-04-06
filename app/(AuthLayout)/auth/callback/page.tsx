"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      // Handle OAuth errors
      router.push(`/auth/login?error=${error}`);
      return;
    }

    if (token) {
      document.cookie = `auth_token=${token}; path=/; max-age=${
        7 * 24 * 60 * 60
      }; secure; samesite=strict`;
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("post_login_redirect="))
        ?.split("=")[1];
      const redirect = cookie ? decodeURIComponent(cookie) : "/dashboard";
      document.cookie =
        "post_login_redirect=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push(redirect);
    } else {
      // No token, redirect to login
      router.push("/auth/login");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Completing Sign In...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    </div>
  );
}
