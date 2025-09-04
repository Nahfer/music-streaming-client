import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Changed Geist to Inter
import "./globals.css";
import Navbar from '@/components/Navbar'; // Added Navbar import
import Sidebar from '@/components/Sidebar'; // Added Sidebar import

const inter = Inter({ subsets: ["latin"] }); // Initialized Inter font

export const metadata: Metadata = {
  title: "Music Stream", // Updated title
  description: "A music streaming application", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}> {/* Used Inter font class */}
        <div className="flex flex-col h-screen">
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-4">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
