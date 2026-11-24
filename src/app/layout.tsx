import { Inter, Space_Grotesk, JetBrains_Mono, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MonthProvider } from "@/components/providers/MonthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DensityProvider } from "@/components/providers/DensityProvider";
import { ZoomProvider } from "@/components/providers/ZoomProvider";
import { IdleProvider } from "@/components/providers/IdleProvider";
import { ClientAutoRefresh } from "@/components/providers/ClientAutoRefresh";
import { PwaManager } from "@/components/providers/PwaManager";
import { PushNotificationManager } from "@/components/providers/PushNotificationManager";
import { AppWelcomeSplash } from "@/components/ui/AppWelcomeSplash";
import { BackgroundCanvas } from "@/components/ui/BackgroundCanvas";


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

const notoSerifBengali = Noto_Serif_Bengali({
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-noto-serif-bengali",
  display: "swap"
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
    <html lang="en" data-theme="jungle-nebula" data-mode="dark" data-bg-effect="starlight" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var migrated = localStorage.getItem('app-jungle-starlight-dark-v1');
                  var m = localStorage.getItem('app-mode');
                  var t = localStorage.getItem('app-visual-theme');
                  var b = localStorage.getItem('app-bg-effect');
                  if (!migrated) {
                    localStorage.setItem('app-jungle-starlight-dark-v1', 'true');
                    localStorage.setItem('app-visual-theme', 'jungle-nebula');
                    localStorage.setItem('app-mode', 'dark');
                    localStorage.setItem('theme', 'dark');
                    localStorage.setItem('app-bg-effect', 'starlight');
                    m = 'dark';
                    t = 'jungle-nebula';
                    b = 'starlight';
                  }
                  if (m) {
                    document.documentElement.setAttribute('data-mode', m);
                    if (m === 'light') {
                      document.documentElement.classList.add('light-mode');
                    } else {
                      document.documentElement.classList.remove('light-mode');
                    }
                  } else {
                    document.documentElement.setAttribute('data-mode', 'dark');
                    document.documentElement.classList.remove('light-mode');
                  }
                  if (t) {
                    document.documentElement.setAttribute('data-theme', t);
                  } else {
                    document.documentElement.setAttribute('data-theme', 'jungle-nebula');
                  }
                  if (b && b !== 'ember-tide-aurora') {
                    document.documentElement.setAttribute('data-bg-effect', b);
                  } else {
                    document.documentElement.setAttribute('data-bg-effect', 'starlight');
                  }
                  var z = localStorage.getItem('app_screen_zoom');
                  if (z) {
                    document.documentElement.style.zoom = z + '%';
                    document.documentElement.style.setProperty('--app-screen-zoom', z + '%');
                  }
                  localStorage.removeItem('bapl_lang');
                  document.documentElement.setAttribute('lang', 'en');
                  document.documentElement.removeAttribute('data-lang');
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${notoSerifBengali.variable} bg-[var(--color-bg-main)] text-[var(--color-text-main)]`}>
        <ThemeProvider>
          <BackgroundCanvas />
          <MonthProvider>
            <DensityProvider>
              <ZoomProvider>
                <ClientAutoRefresh />
                <PushNotificationManager />
                <PwaManager>
                  <AppWelcomeSplash />
                  <IdleProvider>
                    <DashboardLayout>
                      {children}
                    </DashboardLayout>
                  </IdleProvider>
                </PwaManager>
              </ZoomProvider>
            </DensityProvider>
          </MonthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
