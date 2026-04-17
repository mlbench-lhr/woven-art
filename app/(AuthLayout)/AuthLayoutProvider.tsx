"use client";
import type React from "react";
import Image from "next/image";

export function AuthLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-white grid grid-cols-1 md:grid-cols-2">
      <div className="relative w-full h-[40vh] md:h-auto md:min-h-screen">
        <Image
          src={"/auth_image.png"}
          alt="Auth Illustration"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover md:object-cover"
        />
      </div>
      <div className="flex items-center justify-center px-6 py-10 md:px-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
