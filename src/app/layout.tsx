import { Barlow } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";

const barlow = Barlow({ 
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
      <body className={`${barlow.className} bg-[var(--color-bg-main)] text-[var(--color-text-main)]`}>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}
