"use client";

import { SignupForm } from "@/components/auth/signup-form";
import { AuthLayoutProvider } from "../../AuthLayoutProvider";
import { useSearchParams } from "next/navigation";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  
  return (
    <AuthLayoutProvider>
      <SignupForm redirectTo={redirect || undefined} />
    </AuthLayoutProvider>
  );
}
