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
      <div className="max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Woven Art" width={110} height={24} />
        </Link>
        <nav className="hidden md:flex items-center gap-10 navbar-text">
          <Link href="/">Create Artwork</Link>
          <Link href="#">Shop Woven-Art kit</Link>
          <Link href="#">Shop Credits</Link>
          <Link href="#">FAQ</Link>
          <Link href="#">Contact</Link>
          {user && <Link href="/dashboard/artworks">My Artworks</Link>}
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
