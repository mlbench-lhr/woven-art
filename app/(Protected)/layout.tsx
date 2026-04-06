 "use client";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { signOut } from "@/lib/auth/auth-helpers";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} font-sans min-h-screen w-full bg-white`}>
      <header className="w-full border-b bg-white">
        <div className="max-w-5xl mx-auto h-[64px] px-4 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold">Dashboard</Link>
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              window.location.href = "/auth/login";
            }}
          >
            Sign Out
          </Button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  );
}
