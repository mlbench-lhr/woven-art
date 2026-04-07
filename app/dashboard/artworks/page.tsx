"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import CanvasStringArt from "@/components/CanvasStringArt";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

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
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [fetching, setFetching] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  if (loading)
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading...</div>;

  if (!user)
    return (
      <div className="min-h-screen flex flex-col">
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
    const result = await Swal.fire({
      title: "Delete artwork?",
      text: "This will permanently remove this artwork.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });
    if (!result.isConfirmed) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/artwork/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setItems((prev) => prev.filter((x) => x._id !== id));
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Artwork removed from your account.",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        const j = await res.json().catch(() => ({} as any));
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: j?.error || "Could not delete artwork.",
        });
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f7f6f4" }}>
      <Navbar />
      <main className="flex-1">
        <div
          className="mx-auto px-6 py-10"
          style={{
            maxWidth: 1100,
            display: "grid",
            gridTemplateColumns: "270px 1fr",
            gap: 28,
          }}
        >
          {/* ── Sidebar ── */}
          <aside
            style={{
              background: "#fff",
              border: "1px solid #e8e4de",
              borderRadius: 20,
              padding: "22px 20px",
              height: "fit-content",
            }}
          >
            {/* Profile row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#e0d8cc",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {/* placeholder avatar circle */}
                <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                  <rect width="44" height="44" fill="#d4c8b8" />
                  <circle cx="22" cy="17" r="8" fill="#a89880" />
                  <ellipse cx="22" cy="38" rx="13" ry="9" fill="#a89880" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                  {(() => {
                    const fn =
                      (typeof user.fullName === "string" ? user.fullName : "") || "";
                    const cleaned = fn.replace(/undefined/gi, "").replace(/\s+/g, " ").trim();
                    const alt = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
                    return cleaned || alt || (user.email?.split("@")[0] || "User");
                  })()}
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{user.email}</div>
              </div>
            </div>

            {/* Credits */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f7f6f4",
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: "#555" }}>Credits</span>
              <span style={{ fontSize: 22, fontWeight: 600, color: "#1a1a1a" }}>
                {(user as any)?.credits ?? 0}
              </span>
            </div>

            {/* Redeem button */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "11px 16px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                background: "#fff",
                border: "1.5px solid #e0dbd3",
                color: "#1a1a1a",
                marginBottom: 10,
                fontFamily: "inherit",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Redeem or Buy Credits
            </button>

            {/* Sign out button */}
            <button
              onClick={async () => { await signOut(); router.push("/"); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "11px 16px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                background: "#fff2f2",
                border: "1.5px solid #f5c6c6",
                color: "#c0392b",
                fontFamily: "inherit",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </aside>

          {/* ── Main content ── */}
          <div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h1 style={{ fontSize: 28, fontWeight: 600, color: "#1a1a1a", letterSpacing: "-0.3px" }}>
                My Artworks
              </h1>
              <Link
                href="/create"
                style={{ fontSize: 13, color: "#1a1a1a", textDecoration: "underline", textUnderlineOffset: 3 }}
              >
                Create New
              </Link>
            </div>

            {/* Empty state */}
            {items.length === 0 && !fetching && (
              <div style={{ color: "#888", fontSize: 14 }}>No saved artworks yet.</div>
            )}

            {/* Artwork grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 20,
              }}
            >
              {items.map((it) => {
                const credits = (user as any)?.credits ?? 0;
                const canContinue = !!it.unlocked || credits > 0;

                return (
                  <div
                    key={it._id}
                    style={{
                      background: "#fff",
                      border: "1px solid #e8e4de",
                      borderRadius: 18,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    {/* Step badge — top right */}
                    <div
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      Step {it.progressStep || 0}/{it.totalLines}
                    </div>

                    {/* Canvas preview */}
                    <div
                      style={{
                        width: 190,
                        height: 190,
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: "#ede9e3",
                        marginTop: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {it.finalSequence ? (
                        <CanvasStringArt
                          sequence={it.finalSequence}
                          totalPins={it.totalPins}
                          size={190}
                          strokeColor="#888"
                          strokeWidth={0.25}
                        />
                      ) : (
                        <span style={{ fontSize: 11, color: "#aaa" }}>No preview</span>
                      )}
                    </div>

                    {/* Date + action row */}
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 14,
                        paddingLeft: 2,
                        paddingRight: 2,
                      }}
                    >
                      {/* <span style={{ fontSize: 12, color: "#888" }}>
                        {new Date(it.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span> */}

                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => router.push(`/create/guided?art=${encodeURIComponent(it._id)}`)}
                          disabled={!canContinue}
                          style={{
                            background: canContinue ? "#c9b99a" : "#e0dbd3",
                            color: "#fff",
                            border: "none",
                            borderRadius: 20,
                            padding: "7px 14px",
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: canContinue ? "pointer" : "not-allowed",
                            fontFamily: "inherit",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {canContinue ? "Continue Stringing" : "Unlock with credit"}
                        </button>

                        <button
                          onClick={() => handleDelete(it._id)}
                          disabled={deletingId === it._id}
                          style={{
                            background: "transparent",
                            color: "#c0392b",
                            border: "1.5px solid #f5c6c6",
                            borderRadius: 20,
                            padding: "7px 12px",
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            opacity: deletingId === it._id ? 0.5 : 1,
                          }}
                        >
                          {deletingId === it._id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
