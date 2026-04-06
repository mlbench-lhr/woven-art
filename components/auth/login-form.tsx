"use client";

import coloredGoogleIcon from "@/public/flat-color-icons_google.svg";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { signIn, signInWithGoogle } from "@/lib/auth/auth-helpers";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { useAppDispatch } from "@/lib/store/hooks";
import { setReduxUser } from "@/lib/store/slices/authSlice";
import { useAuth } from "@/hooks/use-auth";

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginForm({
  isAdmin,
  isVendor,
  redirectTo,
}: {
  isAdmin?: Boolean;
  isVendor?: Boolean;
  redirectTo?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleResendOtp = async (email: string) => {
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
    }
  };

  const handleEmailLogin = async (data: LoginFormValues) => {
    setLoading(true);
    setError("");
    console.log("login data", data);

    try {
      const expectedRole = "user";
      const { data: userData, error } = await signIn(
        data.email,
        data.password,
        expectedRole
      );

      // dispatch(setReduxUser(userData.user));
      if (error) {
        if (error?.message?.includes("verify your email")) {
          Swal.fire({
            title: "Verification Error",
            text: "You need to verify your email — resend code?",
            icon: "error",
            confirmButtonColor: "#C5B4A3",
            confirmButtonText: "Resend OTP",
          }).then(async (result) => {
            if (result.isConfirmed) {
              router.push(`/auth/verify-email?email=${data.email}`);
              await handleResendOtp(data.email);
            }
          });
        }
        setError(error.message);
      } else {
        await refreshUser();
        router.push(redirectTo || "/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const expectedRole = "user";
      const { error } = await signInWithGoogle(redirectTo || "/", expectedRole);
      if (error) {
        setError(error.message);
      }
      // Google OAuth will redirect automatically
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error && !error?.includes("verify your email")) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error || "Please try again.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  }, [error]);
  useEffect(() => {
    const err = searchParams.get("error");
    if (!err) return;
    let message = "Authentication error. Please try again.";
    if (err === "social_admin_forbidden") {
      message =
        "This account cannot use social login. Please sign in with email and password.";
    } else if (err === "oauth_error") {
      message = "Google sign-in failed. Please try again.";
    } else if (err === "oauth_cancelled") {
      message = "Google sign-in was cancelled.";
    } else if (err === "role_mismatch") {
      message =
        isVendor
          ? "Please sign in with a vendor account on this page."
          : isAdmin
          ? "Please sign in with an admin account on this page."
          : "Please sign in with a user account on this page.";
    }
    setError(message);
  }, [searchParams]);

  return (
    <Card className="w-full md:w-[450px] auth-box-shadows">
      <CardHeader className="space-y-1">
        <Link href={"/"}>
          <Image src={"/logo.png"} width={100} height={20} alt="" />
        </Link>
        <CardTitle className="heading-text-style-4">
          {isAdmin ? "Login" : "Welcome Back"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <form onSubmit={handleSubmit(handleEmailLogin)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label className="label-style" htmlFor="email">
              Email Address
            </Label>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: "Enter a valid email",
                },
              }}
              render={({ field }) => (
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter Your Email Address"
                  className="input-style"
                  {...field}
                />
              )}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label className="label-style" htmlFor="password">
              Password
            </Label>
            <div className="relative">
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password should be 6 character long",
                  },
                }}
                render={({ field }) => (
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="input-style"
                    {...field}
                  />
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot password */}
          <div className="flex items-center justify-between plan-text-style-3">
            <Link
              href={"/auth/forgot-password"}
              className="text-[#C5B4A3] hover:underline w-full text-end"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full mt-[8px]"
            disabled={loading}
            variant={"main_green_button"}
            loading={loading}
          >
            Login
          </Button>
        </form>
        {!isAdmin && (
          <>
            {/* Google Login */}
            {!isVendor && (
              <Button
                type="button"
                variant="outline"
                className="border-none bg-[#FFEAF4] w-full h-[46px] text-primary cursor-pointer"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Image
                  width={20}
                  height={20}
                  alt=""
                  src={coloredGoogleIcon.src || "/placeholder.svg"}
                />
                Sign in with Google
              </Button>
            )}

            <div className="plan-text-style-3 text-center">
              Don&apos;t have an account?{" "}
              <Link
                href={"/auth/signup"}
                className="text-[#C5B4A3] font-[500] hover:underline"
              >
                Sign Up
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
