import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MaybeNavbar from '@/components/MaybeNavbar';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Music Stream",
  description: "A modern music streaming application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <MaybeNavbar />
          <div className="flex">
            {/* Sidebar - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:block">
              <Sidebar />
            </div>
            {/* Main Content */}
            <main className="flex-1 lg:ml-0">
              <div className="p-4 lg:p-6 max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
