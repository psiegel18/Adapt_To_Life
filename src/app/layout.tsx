import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AdaptToLife - Empowering Active Living for All Abilities",
  description:
    "AdaptToLife is a 501(c)(3) non-profit dedicated to helping individuals with physical disabilities participate in adaptive sports and activities, including wheelchair basketball.",
  keywords: [
    "adaptive sports",
    "wheelchair basketball",
    "disability sports",
    "inclusive activities",
    "non-profit",
  ],
  openGraph: {
    title: "AdaptToLife - Empowering Active Living for All Abilities",
    description:
      "Helping individuals with physical disabilities participate in adaptive sports and activities.",
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
