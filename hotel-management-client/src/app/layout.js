"use client";
import { AppProvider } from "@/contexts/AuthContext";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/ui/AppSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isLoginPage ? (
          <AppProvider>{children}</AppProvider>
        ) : (
          <SidebarProvider>
            <Sidebar>
              <AppSidebar />
            </Sidebar>
            <main>
              <SidebarTrigger />
              <AppProvider>{children}</AppProvider>
            </main>
          </SidebarProvider>
        )}
      </body>
    </html>
  );
}
