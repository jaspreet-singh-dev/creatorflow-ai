import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import { ChannelProvider } from "@/context/channel-context";
import { ToastProvider } from "@/components/ui/toast";
import { DataProvider } from "@/context/data-context";

export const metadata: Metadata = {
  title: "CreatorFlow AI — AI-Powered YouTube Creator Workspace",
  description:
    "Manage your entire YouTube publishing workflow from one dashboard. AI metadata studio, thumbnail concepts, channel manager, analytics, and video uploads.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-navy-950 text-slate-100 antialiased selection:bg-brand-purple/30 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <ChannelProvider>
                <DataProvider>{children}</DataProvider>
              </ChannelProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
