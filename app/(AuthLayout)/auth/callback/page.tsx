"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      router.push(`/auth/login?error=${error}`);
      return;
    }

    if (token) {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("post_login_redirect="))
        ?.split("=")[1];
      const redirect = cookie ? decodeURIComponent(cookie) : "/";
      document.cookie =
        "post_login_redirect=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      refreshUser();
      router.push(redirect);
    } else {
      // If no token query param, try to continue with server-set cookie
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("post_login_redirect="))
        ?.split("=")[1];
      const redirect = cookie ? decodeURIComponent(cookie) : "/";
      refreshUser();
      router.push(redirect || "/");
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
