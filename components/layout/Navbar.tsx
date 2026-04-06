"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="w-full">
      <div className="max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Woven Art" width={110} height={24} />
        </Link>
        <nav className="hidden md:flex items-center gap-10 navbar-text">
          <Link href="/dashboard">Create Artwork</Link>
          <Link href="#">Shop Woven-Art kit</Link>
          <Link href="#">Shop Credits</Link>
          <Link href="#">FAQ</Link>
          <Link href="#">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="flex items-center">
              <Avatar className="size-9">
                <AvatarImage src={user.avatar || ""} alt={user.fullName || "User"} />
                <AvatarFallback>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/signup" className="green-secondary-button">Sign Up</Link>
              <Link href="/auth/login" className="opp-button-4">Log In</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
