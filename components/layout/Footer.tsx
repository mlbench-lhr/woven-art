"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full">
      <div className="max-w-[1200px] mx-auto px-6 py-10 flex items-center justify-center">
        <div className="flex items-center gap-8 plan-text-style-3">
          <Link target="_blank" href="https://wovenart.store/policies/privacy-policy">Privacy Policy</Link>
          <Link target="_blank" href="https://wovenart.store/policies/terms-of-service">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
