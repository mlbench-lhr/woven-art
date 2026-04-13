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

import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    setShowLogoutConfirm(false);
  };

  const navLinks = [
    { label: "Create Artwork", href: "/" },
    { label: "Shop Woven-Art kit", href: "https://wovenart.store/products/woven-art?variant=53231967076616", target: "_blank" },
    { label: "Shop Credits", href: "https://wovenart.store/products/new-codes", target: "_blank" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="w-full bg-white">
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

      <div className="max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between relative z-50">
        {/* Mobile Menu Toggle (Left Side) */}
        <button 
          className="md:hidden p-2 text-gray-600 hover:text-black"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link href="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <Image src="/logo.png" alt="Woven Art" width={110} height={24} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10 navbar-text">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              href={link.href} 
              target={link.target}
              className="hover:text-[#C5B4A3] transition-colors"
            >
              {link.label}
            </Link>
          ))}
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
                <DropdownMenuItem onClick={() => setShowLogoutConfirm(true)}>
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

      {/* Mobile Navigation Overlay (Slide from Left) */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className={`absolute top-0 left-0 bottom-0 w-[280px] bg-white transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col p-6 gap-6">
            <div className="flex items-center justify-between mb-4">
              <Image src="/logo.png" alt="Woven Art" width={100} height={22} />
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} className="text-gray-600" />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  target={link.target}
                  className="text-lg font-medium text-gray-800 py-2 border-b border-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="flex flex-col gap-3 mt-4">
                  <Link
                    href="/auth/signup"
                    className="w-full h-11 flex items-center justify-center rounded-lg font-medium text-[#171d1a] border border-gray-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/auth/login"
                    className="w-full h-11 flex items-center justify-center rounded-xl bg-[#C5B4A3] text-white font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
