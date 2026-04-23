"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import ProgressiveStringPreview from "@/components/ProgressiveStringPreview";
import { createOriginalSequenceFromMirrored, convertStorageToDisplaySequence } from "@/lib/stringArtGenerator";
import InstructionCodeModal from "@/components/SmallComponents/InstructionCodeModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, CreditCard, LogOut } from "lucide-react";
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

type Item = {
  _id: string;
  totalPins: number;
  totalLines: number;
  finalSequence: number[] | null;
  thumbnail: string | null;
  unlocked?: boolean;
  progressStep?: number;
  createdAt: string;
};

export default function MyArtworksPage() {
  const { user, loading, signOut, refreshUser } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [fetching, setFetching] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [confirmUnlockId, setConfirmUnlockId] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 9;

  useEffect(() => {
    if (!user) return;
    let canceled = false;
    const load = async () => {
      try {
        setFetching(true);
        const res = await fetch("/api/artwork/mine", { credentials: "include" });
        if (!res.ok) return;
        const j = await res.json();
        if (!canceled) setItems(j.items || []);
      } finally {
        if (!canceled) setFetching(false);
      }
    };
    load();
    return () => { canceled = true; };
  }, [user]);

  const totalPages = Math.ceil(items.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedItems = items.slice(startIndex, startIndex + limit);

  useEffect(() => {
    // Reset to first page if current page becomes empty after deletion
    if (page > 1 && paginatedItems.length === 0 && items.length > 0) {
      setPage(page - 1);
    }
  }, [items.length, paginatedItems.length, page]);

  if (loading)
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading...</div>;

  if (!user)
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-lg font-semibold">Please login to view your saved arts</div>
            <Button
              className="opp-button-4"
              onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent("/dashboard/artworks")}`)}
            >
              Login
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/artwork/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setItems((prev) => prev.filter((x) => x._id !== id));
      }
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleUnlock = async (id: string) => {
    setUnlockingId(id);
    try {
      const res = await fetch("/api/credits/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ artId: id }),
      });
      if (!res.ok) return;
      setItems((prev) =>
        prev.map((it) =>
          it._id === id
            ? { ...it, unlocked: true, progressStep: it.progressStep && it.progressStep > 0 ? it.progressStep : 1 }
            : it
        )
      );
      await refreshUser();
    } finally {
      setUnlockingId(null);
      setConfirmUnlockId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Logout Confirmation Dialog */}
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
              <AlertDialogAction 
                onClick={async () => { await signOut(); router.push("/"); setShowLogoutConfirm(false); }} 
                className="bg-red-600 hover:bg-red-700"
              >
                Log Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this artwork?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This artwork will be permanently removed from your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)} 
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!confirmUnlockId} onOpenChange={(open) => !open && setConfirmUnlockId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Unlock</AlertDialogTitle>
              <AlertDialogDescription>
                You will now use 1 credit to unlock the instructions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmUnlockId && handleUnlock(confirmUnlockId)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div
          className="mx-auto px-6 py-10 flex flex-col md:flex-row gap-10"
          style={{ maxWidth: 1100 }}
        >
          {/* ── Sidebar ── */}
          <aside
            className="w-full md:w-[270px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[24px] p-6 h-fit"
          >
            {/* Profile row */}
            <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
              <div className="size-11 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
                {(user as any).avatar ? (
                  <img src={(user as any).avatar} alt={user.fullName || "User"} width={44} height={44} className="object-cover" />
                ) : (
                  <div className="size-full bg-[#e0d8cc] flex items-center justify-center text-[#a89880] font-bold">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#1a1a1a] truncate">
                  {user.fullName || "User"}
                </div>
                <div className="text-[11px] text-[#888] truncate">{user.email}</div>
              </div>
            </div>

            {/* Credits Row */}
            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
              <span className="text-sm font-medium text-[#555]">Credits</span>
              <span className="text-xl font-bold text-[#1a1a1a]">
                {(user as any)?.credits ?? 0}
              </span>
            </div>

            {/* Redeem button */}
            <InstructionCodeModal
              trigger={
                <button
                  type="button"
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl text-sm font-medium cursor-pointer bg-white border border-gray-200 text-[#555] mb-3 hover:bg-gray-50 transition-colors"
                >
                  <CreditCard size={18} />
                  Redeem or Buy Credits
                </button>
              }
            />

            {/* Sign out button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl text-sm font-semibold cursor-pointer bg-[#FFE4E4] text-[#F24E1E] hover:bg-[#FFD1D1] transition-colors border-none"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
                My Artworks
              </h1>
              {items.length > 0 && (
                <Link
                  href="/create"
                  className="text-sm font-semibold text-[#1a1a1a] hover:underline underline-offset-4"
                >
                  + Create New
                </Link>
              )}
            </div>

            {/* Loading state shimmer */}
            {fetching && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-white border border-[#E5E7EB] rounded-[24px] p-5 flex flex-col items-center relative"
                  >
                    <Skeleton className="absolute top-5 right-5 w-16 h-5 rounded-full" />
                    <Skeleton className="w-[180px] h-[180px] rounded-full mt-6" />
                    <div className="w-full flex justify-between mt-6">
                      <Skeleton className="w-28 h-9 rounded-full" />
                      <Skeleton className="w-20 h-9 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {items.length === 0 && !fetching && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <h2 className="text-3xl font-semibold text-[#1a1a1a] font-heading mb-3">
                  You have not created any Woven-Arts yet
                </h2>
                <p className="text-gray-500 mb-10 max-w-[400px] text-base">
                  Get started by creating your first String Art now.
                </p>
                <Button 
                  className="rounded-full px-6 py-3 h-auto text-md font-medium flex items-center shadow-lg hover:shadow-xl transition-all"
                  onClick={() => router.push("/create")}
                > <span className="ml-2">Start Creating</span><ArrowRight className="size-4" />
                </Button>
              </div>
            )}

            {/* Artwork grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedItems.map((it) => {
                const credits = (user as any)?.credits ?? 0;
                const isUnlocked = !!it.unlocked;
                const hasCredits = credits > 0;
                const actionLabel = isUnlocked
                  ? (it.progressStep ?? 0) > 1
                    ? "Continue Stringing"
                    : "Start Stringing"
                  : "Unlock with credit";
                const actionDisabled = isUnlocked ? false : !hasCredits || unlockingId === it._id;

                return (
                  <div
                    key={it._id}
                    className="bg-white border border-[#E5E7EB] rounded-[24px] p-5 flex flex-col items-center relative hover:shadow-md transition-shadow"
                  >
                    {/* Step badge — top right */}
                    <div className="absolute top-5 right-5 text-[10px] font-bold text-[#1a1a1a] bg-[#F3F4F6] px-2.5 py-1 rounded-full border border-gray-100">
                      Step {it.progressStep || 0}/{it.totalLines}
                    </div>

                    {/* Canvas preview */}
                    <div 
                      className={`w-[220px] h-[220px] rounded-full overflow-hidden bg-white mt-6 flex items-center justify-center border-4 border-white shadow-md ${isUnlocked ? "cursor-pointer" : ""}`}
                      onClick={() => {
                        if (isUnlocked) {
                          router.push(`/create/guided?art=${encodeURIComponent(it._id)}`);
                        }
                      }}
                    >
                      {it.finalSequence ? (
                        <ProgressiveStringPreview
                          sequence={convertStorageToDisplaySequence(createOriginalSequenceFromMirrored(it.finalSequence, it.totalPins), it.totalPins, 480)}
                          totalPins={480}
                          size={220}
                          strokeColor="rgba(10,10,10,0.15)"
                          strokeWidth={0.85}
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium">No preview</span>
                      )}
                    </div>

                    {/* Date + action row */}
                    <div className="w-full flex flex-col gap-4 mt-6">
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() =>
                            isUnlocked
                              ? router.push(`/create/guided?art=${encodeURIComponent(it._id)}`)
                              : setConfirmUnlockId(it._id)
                          }
                          disabled={actionDisabled}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            actionDisabled 
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                              : "bg-[#C5B4A3] text-white hover:bg-[#B5A493] shadow-sm"
                          }`}
                        >
                          {unlockingId === it._id ? "Unlocking..." : actionLabel}
                        </button>

                        <button
                          onClick={() => setConfirmDeleteId(it._id)}
                          disabled={deletingId === it._id}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[#FEE2E2] text-[#F24E1E] hover:bg-[#FEF2F2] transition-colors"
                        >
                          {deletingId === it._id ? "..." : "Delete"}
                        </button>
                      </div>

                      {/* Creation Date below buttons */}
                      <div className="text-center">
                        <span className="text-[10px] text-gray-400 font-bold tracking-wide uppercase">
                          Created {new Date(it.createdAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`size-8 rounded-lg text-xs font-bold transition-all ${
                        page === p
                          ? "bg-[#C5B4A3] text-white"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
