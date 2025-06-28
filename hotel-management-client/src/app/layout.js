"use client";

import { AuthProvider, UserProvider } from "../contexts/AuthContext";
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
          <AuthProvider>{children}</AuthProvider>
        ) : (
          <SidebarProvider>
            <Sidebar>
              <AppSidebar />
            </Sidebar>
            <main>
              <SidebarTrigger />
              <AuthProvider>
                <UserProvider>{children}</UserProvider>
              </AuthProvider>
            </main>
          </SidebarProvider>
        )}
      </body>
    </html>
  );
}
