export const metadata = {
  title: "Remotive Logistics - Authentication",
  description: "Sales training platform for Remotive Logistics trailer reps",
  openGraph: {
    title: "Remotive Logistics",
    description: "Your personal virtual desk for trailer sales success",
    url: "[domain TBD]/en/auth/login",
    siteName: "Remotive Logistics",
    images: [
      {
        url: "/og-image.png",
        width: 1920,
        height: 1080,
        alt: "Remotive Logistics - Discover Remotive"
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remotive Logistics",
    description: "Your personal virtual desk for trailer sales success",
    images: ["/og-image.png"],
  }
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
