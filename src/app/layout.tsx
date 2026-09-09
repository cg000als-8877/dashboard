import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MonthProvider } from "@/components/providers/MonthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DensityProvider } from "@/components/providers/DensityProvider";
import { ClientAutoRefresh } from "@/components/providers/ClientAutoRefresh";
import { PwaManager } from "@/components/providers/PwaManager";
import { AppWelcomeSplash } from "@/components/ui/AppWelcomeSplash";
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BAPL Dashboard"
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="ember-tide" data-mode="dark" data-bg-effect="ember-tide-aurora" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var m = localStorage.getItem('app-mode');
                  var t = localStorage.getItem('app-visual-theme');
                  var b = localStorage.getItem('app-bg-effect');
                  if (m) {
                    document.documentElement.setAttribute('data-mode', m);
                    if (m === 'light') {
                      document.documentElement.classList.add('light-mode');
                    } else {
                      document.documentElement.classList.remove('light-mode');
                    }
                  }
                  if (t) {
                    document.documentElement.setAttribute('data-theme', t);
                  }
                  if (b) {
                    document.documentElement.setAttribute('data-bg-effect', b);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} ${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-[var(--color-bg-main)] text-[var(--color-text-main)]`}>
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider>
            <MonthProvider>
              <DensityProvider>
                <ClientAutoRefresh />
                <PwaManager>
                  <AppWelcomeSplash />
                  <DashboardLayout>
                    {children}
                  </DashboardLayout>
                </PwaManager>
              </DensityProvider>
            </MonthProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
