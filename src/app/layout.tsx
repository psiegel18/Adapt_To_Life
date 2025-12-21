import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AdaptToLife - The Path to Play",
  description:
    "For 15 million Americans with physical disabilities, the journey from diagnosis to sport is a broken system. We fix it. AdaptToLife is a 501(c)(3) non-profit building the pathway to adaptive sports.",
  keywords: [
    "adaptive sports",
    "wheelchair basketball",
    "disability sports",
    "adaptive sports grants",
    "sports equipment grants",
    "non-profit",
    "CTRS",
    "therapeutic recreation",
  ],
  icons: {
    icon: "/AdaptToLife_light.ico",
    shortcut: "/AdaptToLife_light.ico",
    apple: "/AdaptToLife_light.png",
  },
  openGraph: {
    title: "AdaptToLife - The Path to Play",
    description:
      "Building the pathway from diagnosis to sport for 15 million Americans with physical disabilities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
