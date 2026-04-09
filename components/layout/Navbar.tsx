"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    setShowLogoutConfirm(false);
  };

  return (
    <header className="w-full">
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to log in again to access your saved artworks and credits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Woven Art" width={110} height={24} />
        </Link>
        <nav className="hidden md:flex items-center gap-10 navbar-text">
          <Link href="/">Create Artwork</Link>
          <Link target="_blank" href="https://wovenart.store/products/woven-art?variant=53231967076616">Shop Woven-Art kit</Link>
          <Link target="_blank" href="https://wovenart.store/products/new-codes">Shop Credits</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="#">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar className="size-9">
                  <AvatarImage src={user.avatar || ""} alt={user.fullName || "User"} />
                  <AvatarFallback>
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/")}>
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/artworks")}>
                  My Artworks
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => setShowLogoutConfirm(true)}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/auth/signup"
                className="text-[16px] font-medium text-[#171d1a] h-[38px] px-6 flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-[#C5B4A3] hover:text-white"
              >
                Sign Up
              </Link>
              <Link href="/auth/login" className="opp-button-4 px-6 rounded-xl">
                Log In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
