"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OTPInput } from "@/components/ui/otp-input";
import { forgotPassword } from "@/lib/auth/auth-helpers";
import { ChevronLeft, Check, EyeOff, Eye } from "lucide-react";
import Swal from "sweetalert2";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";

type EmailFormValues = {
  email: string;
};

type PasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

export function ForgotPasswordForm({
  isAdmin,
  isVendor,
}: {
  isAdmin?: Boolean;
  isVendor?: Boolean;
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "password" | "success">(
    "email"
  );
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();
  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    watch: watchEmail,
  } = useForm<EmailFormValues>({
    defaultValues: {
      email: "",
    },
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch: watchPassword,
    reset,
  } = useForm<PasswordFormValues>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watchPassword("newPassword");

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  }, [error]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (data: EmailFormValues) => {
    setLoading(true);
    setError("");

    try {
      const { error } = await forgotPassword(data.email);
      if (error) {
        setError(error.message);
      } else {
        setEmail(data.email);
        setStep("otp");
        setResendTimer(60);
        Swal.fire({
          icon: "success",
          title: "OTP Sent",
          text: "OTP sent to your email!",
          timer: 1500,
          showConfirmButton: false,
        });
        setOtp("");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    setError("");

    try {
      const { error } = await forgotPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setResendTimer(60);
        Swal.fire({
          icon: "success",
          title: "OTP Resent",
          text: "OTP resent to your email!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp?.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("password");
        Swal.fire({
          icon: "success",
          title: "OTP Verified",
          text: "OTP verified successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
        reset();
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: PasswordFormValues) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password: data.newPassword }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error || "Failed to reset password");
      } else {
        setStep("success");
        Swal.fire({
          icon: "success",
          title: "Password Updated",
          text: "Your password has been reset successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <Card className="w-full md:w-[480px] h-full md:h-[390px]">
        <CardHeader className="flex flex-col justify-center items-center">
          <Link href={"/"}>
            <Image src={"/logo.png"} width={100} height={20} alt="" />
          </Link>
          <div className="h-[80px] w-[80px] flex justify-center items-center rounded-full bg-primary mt-[60px]">
            <Check className="text-primary h-[40px] w-[40px]" color="white" />
          </div>
          <CardTitle className="heading-text-style-4 text-center mt-[28px]">
            Password Updated
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-[38px]">
          <Button asChild className="w-full" variant="main_green_button">
            <Link href={"/auth/login"}>Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "password") {
    return (
      <Card className="w-full max-w-md auth-box-shadows">
        <CardHeader className="space-y-1">
          <Link href={"/"}>
            <Image src={"/logo.png"} width={100} height={20} alt="" />
          </Link>
          <button
            onClick={() => setStep("otp")}
            className="text-sm text-muted-foreground hover:text-foreground flex items-start justify-start mb-[28px]"
          >
            <ChevronLeft className="mr-2 h-[24px] w-[24px]" color="#C5B4A3" />
            <span className="text-base font-semibold">Go Back</span>
          </button>
          <CardTitle className="heading-text-style-4">Reset Password</CardTitle>
          <CardDescription className="plan-text-style-3">
            Enter your new password & confirm password to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={handlePasswordSubmit(handleResetPassword)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label className="label-style" htmlFor="newPassword">
                New Password
              </Label>
              <div className="relative">
                <Controller
                  name="newPassword"
                  control={passwordControl}
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters long",
                    },
                    validate: (value) => {
                      const hasUppercase = /[A-Z]/.test(value);
                      const hasLowercase = /[a-z]/.test(value);
                      const hasNumber = /[0-9]/.test(value);
                      const hasSpecial = /[^A-Za-z0-9]/.test(value);
                      if (!hasUppercase)
                        return "Password must include at least one uppercase letter";
                      if (!hasLowercase)
                        return "Password must include at least one lowercase letter";
                      if (!hasNumber)
                        return "Password must include at least one number";
                      if (!hasSpecial)
                        return "Password must include at least one special character";
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      className="input-style"
                      {...field}
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-red-500 text-sm">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="label-style" htmlFor="confirmPassword">
                Confirm Password
              </Label>
              <div className="relative">
                <Controller
                  name="confirmPassword"
                  control={passwordControl}
                  rules={{
                    required: "Confirm password is required",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  }}
                  render={({ field }) => (
                    <Input
                      id="confirmPassword"
                      type={showPassword2 ? "text" : "password"}
                      placeholder="Confirm new password"
                      className="input-style"
                      {...field}
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword2(!showPassword2)}
                >
                  {showPassword2 ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full mt-[8px]"
              disabled={loading}
              variant="main_green_button"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (step === "otp") {
    return (
      <Card className="w-full max-w-md auth-box-shadows">
        <CardHeader className="space-y-1">
          <Link href={"/"}>
            <Image src={"/logo.png"} width={100} height={20} alt="" />
          </Link>
          <button
            onClick={() => setStep("email")}
            className="text-sm text-muted-foreground hover:text-foreground flex items-start justify-start mb-[28px]"
          >
            <ChevronLeft className="mr-2 h-[24px] w-[24px]" color="#C5B4A3" />
            <span className="text-base font-semibold">Go Back</span>
          </button>
          <CardTitle className="heading-text-style-4 text-center">
            Enter OTP
          </CardTitle>
          <CardDescription className="text-center plan-text-style-3">
            Check your email and enter the OTP to verify.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleVerifyOtp} className="space-y-2">
            <OTPInput
              value={otp}
              onChange={setOtp}
              length={6}
              className="justify-center"
            />
            <Button
              type="submit"
              className="w-full mt-[8px]"
              disabled={otp?.length !== 6 || loading}
              variant="main_green_button"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
          <div className="text-center">
            <p className="plan-text-style-3">
              Didn&apos;t receive the email?{" "}
              <button
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || resendLoading}
                className="text-[#C5B4A3] font-[500] hover:underline"
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
    );
  }

  return (
    <Card className="w-full max-w-md auth-box-shadows">
      <CardHeader className="space-y-1">
        <Link href={"/"}>
          <Image src={"/logo.png"} width={100} height={20} alt="" />
        </Link>
        <div
          onClick={() => router.back()}
          className="text-sm cursor-pointer text-muted-foreground hover:text-foreground flex items-center justify-start mb-[28px]"
        >
          <ChevronLeft className="mr-2 h-[24px] w-[24px]" color="#C5B4A3" />
          <span className="text-base font-semibold">Go Back</span>
        </div>
        <CardTitle className="heading-text-style-4">Forgot Password?</CardTitle>
        <CardDescription className="plan-text-style-3">
          Enter the email address linked to your account, and we&apos;ll send you a
          link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleEmailSubmit(handleSendOtp)} className="space-y-4">
          <div className="space-y-2">
            <Label className="label-style" htmlFor="email">
              Email Address
            </Label>
            <Controller
              name="email"
              control={emailControl}
              rules={{
                required: "Email Address is required",
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: "Enter a valid email",
                },
              }}
              render={({ field }) => (
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="input-style"
                  {...field}
                />
              )}
            />
            {emailErrors.email && (
              <p className="text-red-500 text-sm">
                {emailErrors.email.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full mt-[8px]"
            disabled={loading}
            variant="main_green_button"
          >
            {loading ? "Sending..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
