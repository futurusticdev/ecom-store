import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const fontSans = GeistSans;

export const metadata: Metadata = {
  title: "LUXE - Premium Fashion Store",
  description: "Discover luxury fashion for men and women at LUXE",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontSans.className} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
