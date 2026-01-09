import "../assets/scss/globals.scss";
import "../assets/scss/theme.scss";
import { Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import Providers from "@/provider/providers";
import "simplebar-react/dist/simplebar.min.css";
import TanstackProvider from "@/provider/providers.client";
import AuthProvider from "@/provider/auth.provider";
import "flatpickr/dist/themes/light.css";
import DirectionProvider from "@/provider/direction.provider";
import { PresenceProvider } from "@/components/providers/presence-provider";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', type: 'image/png', sizes: '192x192', url: '/favicon-192x192.png' },
      { rel: 'icon', type: 'image/png', sizes: '512x512', url: '/favicon-512x512.png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '[domain TBD]',
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: '/images/mj-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Remotive Logistics Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: ['/images/mj-og-image.png'],
  },
};

export default async function RootLayout(props: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const params = await props.params;

  const {
    lang
  } = params;

  const {
    children
  } = props;

  return (
    <html lang={lang} suppressHydrationWarning>
      <AuthProvider>
        <TanstackProvider>
          <Providers>
            <PresenceProvider>
              <DirectionProvider lang={lang}>{children}</DirectionProvider>
            </PresenceProvider>
          </Providers>
        </TanstackProvider>
      </AuthProvider>
    </html>
  );
}
