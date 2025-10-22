export const metadata = {
  title: "MJ Cargo Sales Dashboard - Authentication",
  description: "Sales training platform for MJ Cargo trailer reps",
  openGraph: {
    title: "MJ Cargo Sales Dashboard",
    description: "Your personal virtual desk for trailer sales success",
    url: "https://www.mjsalesdash.com/en/auth/login",
    siteName: "MJ Cargo Sales Dashboard",
    images: [
      {
        url: "https://www.mjsalesdash.com/og-image.png",
        width: 1920,
        height: 1080,
        alt: "MJ Cargo Sales Dashboard - Discover SalesDash"
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MJ Cargo Sales Dashboard",
    description: "Your personal virtual desk for trailer sales success",
    images: ["https://www.mjsalesdash.com/og-image.png"],
  }
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
