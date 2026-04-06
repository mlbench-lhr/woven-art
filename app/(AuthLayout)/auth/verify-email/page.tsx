"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OTPInput } from "@/components/ui/otp-input";
import { CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2"; // ✅ use SweetAlert2
import { AuthLayoutProvider } from "../../AuthLayoutProvider";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      setError("Email parameter missing");
    }
  }, [searchParams]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp?.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        Swal.fire({
          icon: "success",
          title: "Email Verified!",
          text: "Redirecting to login...",
          timer: 1500,
          showConfirmButton: false,
        });
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
        Swal.fire({
          icon: "error",
          title: "Invalid OTP",
          text: data.error || "Please try again.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      setError("An unexpected error occurred");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "An unexpected error occurred",
        timer: 1500,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || !email) return;

    setResendLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendTimer(60);
        Swal.fire({
          icon: "success",
          title: "OTP Resent!",
          text: "A new OTP has been sent to your email.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        setError(data.error || "Failed to resend OTP");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Failed to resend OTP",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      setError("Failed to resend OTP");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to resend OTP",
        timer: 1500,
        showConfirmButton: false,
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex justify-center items-start lg:items-center w-full h-[100vh] bg-[#FBFDF9]">
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <Card className="w-full max-w-md auth-box-shadows">
              <CardHeader className="space-y-1">
                <div className="flex justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <CardTitle className="text-center">Email Verified!</CardTitle>
                <CardDescription className="text-center">
                  Redirecting to login...
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (error && !email) {
    return (
      <div className="flex justify-center items-start lg:items-center w-full h-[100vh] bg-[#FBFDF9]">
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <Card className="w-full max-w-md">
              <CardHeader className="space-y-1">
                <div className="flex justify-center">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <CardTitle className="text-center">Invalid Link</CardTitle>
                <CardDescription className="text-center">
                  {error}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/auth/signup">Try Again</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <AuthLayoutProvider>
      <Card className="w-full max-w-md auth-box-shadows">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            Check your email and enter the OTP to verify.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <OTPInput
              value={otp}
              onChange={setOtp}
              length={6}
              className="justify-center"
            />
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full mt-[8px]"
              disabled={otp?.length !== 6 || loading}
              variant="main_green_button"
            >
              {loading ? "Verifying..." : "Continue"}
            </Button>
          </form>
          <div className="text-center">
            <p>
              Didn’t receive the email?{" "}
              <button
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || resendLoading || !email}
                className="text-[#B32053] font-[500] hover:underline"
              >
                {resendLoading
                  ? "Sending..."
                  : resendTimer > 0
                  ? `Resend in ${resendTimer}s`
                  : "Resend OTP"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayoutProvider>
  );
}
