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
  icons: {
    icon: '/images/mj.svg',
    shortcut: '/images/mj.svg',
    apple: '/images/mj.svg',
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