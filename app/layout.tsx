import "./assets/scss/globals.scss";
import "./assets/scss/theme.scss";
import { Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import Providers from "@/provider/providers";
import "simplebar-react/dist/simplebar.min.css";
import TanstackProvider from "@/provider/providers.client";
import AuthProvider from "@/provider/auth.provider";
import "flatpickr/dist/themes/light.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        url: '/logo.png',
      },
    ],
  },
  manifest: '/manifest.json',
  themeColor: '#ee6832',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mjsalesdash.com',
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: '/images/mj-og-image.png',
        width: 1200,
        height: 630,
        alt: 'MJ Cargo Sales Dashboard',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <AuthProvider>
        <TanstackProvider>
          <Providers>
            <body>{children}</body>
          </Providers>
        </TanstackProvider>
      </AuthProvider>
    </html>
  );
}