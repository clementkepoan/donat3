import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";

export type Streamer = {
  _id: string;
  name: string;
  image: string;
  subscribers: number;
  public_address: string;
  viewers: number;
  description: string;
};

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Donat3",
  description: "A platform to donate crypto to streamers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col bg-[#0E0E12] text-white">
          <SiteHeader />
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}
          >
            <OverlayProvider>{children}</OverlayProvider>
          </GoogleOAuthProvider>
          <footer className="border-t border-[#2A2A2E] bg-[#121217] py-6 mt-12">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-sm text-gray-400 px-20">
              <p className="text-center md:text-left">
                &copy; {new Date().getFullYear()} Donat3. All rights reserved.
              </p>
              <div className="flex gap-4">
                <Link href="/terms" className="hover:text-[#10B981]">
                  Terms
                </Link>
                <Link href="/privacy" className="hover:text-[#10B981]">
                  Privacy
                </Link>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

import "./globals.css";
import { OverlayProvider } from "@/hooks/overlayContext";
