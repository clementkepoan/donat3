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
  title: "CryptoDonate - Prototype",
  description: "Crypto donation platform for streamers",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <GoogleOAuthProvider clientId="24120971675-ehvmrfi7e2odst5pdc3tjf6ej22bb5rv.apps.googleusercontent.com">
            {children}
          </GoogleOAuthProvider>
          <footer className="border-t py-4">
            <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-center text-sm text-muted-foreground md:text-left">
                &copy; {new Date().getFullYear()} Donat3. All rights reserved.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:underline"
                >
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
