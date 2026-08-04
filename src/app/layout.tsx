import { Inter } from "next/font/google";
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

export const metadata = {
  title: "Byzid Apparels (Pvt) Ltd",
  description: "Dashboard for Factory Operations",
  icons: {
    icon: '/logo.jpg'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[var(--color-bg-main)] text-[var(--color-text-main)]`}>
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
