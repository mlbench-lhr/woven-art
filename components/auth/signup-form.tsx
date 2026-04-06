"use client";

import coloredGoogleIcon from "@/public/flat-color-icons_google.svg";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp, signInWithGoogle } from "@/lib/auth/auth-helpers";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import Swal from "sweetalert2";

type SignupFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function SignupForm({ isVendor, redirectTo }: { isVendor?: Boolean; redirectTo?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("Passwords do not match");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const handleEmailSignup = async (data: SignupFormValues) => {
    setLoading(true);
    setError("");

    try {
      const signupData = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      };

      const { data: res, error } = await signUp(signupData);
      if (error) {
        setError(error.message);
      } else {
        if (res?.requiresVerification) {
          setSuccess(true);
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await signInWithGoogle(redirectTo);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
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
    if (password !== confirmPassword && password && confirmPassword) {
      setErrorMsg("Passwords do not match");
    } else {
      setErrorMsg("");
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    if (success) {
      const email = watch("email");
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(email || "")}`
      );
    }
  }, [success, router, watch]);

  return (
    <Card className="w-full max-w-md auth-box-shadows min-h-fit max-h-full">
      <CardHeader className="space-y-1">
        <Link href={"/"}>
          <Image src={"/logo.png"} width={100} height={20} alt="" />
        </Link>
        <CardTitle className="heading-text-style-4">
          Create an Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <form onSubmit={handleSubmit(handleEmailSignup)} className="space-y-4">
          <div className="space-y-2">
            <Label className="label-style" htmlFor="email">
              Email Address
            </Label>
            <Controller
              name="email"
              control={control}
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
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="label-style" htmlFor="fullName">
              Full Name
            </Label>
            <Controller
              name="fullName"
              control={control}
              rules={{
                required: "Full name is required",
                minLength: {
                  value: 2,
                  message: "Full name must be at least 2 characters",
                },
              }}
              render={({ field }) => (
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className="input-style"
                  {...field}
                />
              )}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm">{errors.fullName.message}</p>
            )}
          </div>

          

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
                className="absolute right-0 top-1/2 translate-y-[-50%] h-full px-3 py-2 hover:bg-transparent"
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

          <div className="space-y-2">
            <Label className="label-style" htmlFor="confirmPassword">
              Confirm Password
            </Label>
            <div className="relative">
              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: "Confirm password is required",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                }}
                render={({ field }) => (
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="input-style"
                    {...field}
                  />
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 translate-y-[-50%] h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
          </div>

          

          <Button
            type="submit"
            className="w-full mt-[8px]"
            disabled={loading}
            variant={"main_green_button"}
          >
            Sign Up
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          className="border-none bg-[#FFEAF4] w-full h-[46px] text-primary cursor-pointer"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          <Image
            width={20}
            height={20}
            alt=""
            src={coloredGoogleIcon.src || "/placeholder.svg"}
          />
          Signup with Google
        </Button>

        <div className="plan-text-style-3 text-center">
          Already have an account?{" "}
          <Link href={"/auth/login"} className="text-[#B32053] font-[500] hover:underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
