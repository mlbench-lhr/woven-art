"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full">
      <div className="max-w-[1200px] mx-auto px-6 py-10 flex items-center justify-center">
        <div className="flex items-center gap-8 plan-text-style-3">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
