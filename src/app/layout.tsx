import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MonthProvider } from "@/components/providers/MonthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClientAutoRefresh } from "@/components/providers/ClientAutoRefresh";
import { Suspense } from "react";

const inter = Inter({ 
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"] 
});

const spaceGrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono"
});

export const metadata = {
  title: "Byzid Apparels (Pvt) Ltd",
  description: "Dashboard for Factory Operations",
  manifest: "/manifest.json",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="nordic-slate" data-mode="dark">
      <body className={`${inter.className} ${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-[var(--color-bg-main)] text-[var(--color-text-main)]`}>
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider>
            <MonthProvider>
              <ClientAutoRefresh />
              <DashboardLayout>
                {children}
              </DashboardLayout>
            </MonthProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
