"use client";
import { useAppSelector } from "@/lib/store/hooks";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold mb-2">Welcome</h1>
      <p className="text-sm mb-6">
        {user?.fullName ? `Signed in as ${user.fullName}` : "Signed in"}
      </p>
      <div className="flex items-center gap-3">
        <Button asChild>
          <Link href="/dashboard">Refresh</Link>
        </Button>
      </div>
    </div>
  );
}
