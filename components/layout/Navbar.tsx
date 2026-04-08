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

export default function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="w-full">
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
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-8">
              <Link href="/auth/signup" className="text-[16px] font-medium text-[#171d1a]">Sign Up</Link>
              <Link href="/auth/login" className="opp-button-4 px-6 rounded-xl">Log In</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
