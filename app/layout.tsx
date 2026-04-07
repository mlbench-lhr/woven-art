import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "sonner";
import { ReduxProvider } from "@/components/providers/redux-provider";
import LoadingScreen from "@/components/Skeletons/LoadingScreen";
import { VariantsProvider } from "./Context/VariantsContext";


export const metadata: Metadata = {
  title: "Woven Art",
  description:
    " A platform to discover and book tours, activities, and local experiences in Woven Art, Turkey.",
  icons: "/logo.png"
};

export const preferredRegion = ["fra1"];
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <VariantsProvider>
          <Suspense
            fallback={
              <div>
                <LoadingScreen />
              </div>
            }
          >
            <ReduxProvider>
              <AuthProvider>
                {children}
                <Toaster richColors position="top-right" />
              </AuthProvider>
            </ReduxProvider>
          </Suspense>
        </VariantsProvider>
        <Analytics />
      </body>
    </html>
  );
}
