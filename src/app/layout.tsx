import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AtlasPayments — Sandbox Dashboard",
  description:
    "Enterprise payment gateway sandbox with EchoAtlas Observatory integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100`}
      >
        <SessionProvider>
          <Sidebar />
          <main className="ml-64 min-h-screen p-8">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
