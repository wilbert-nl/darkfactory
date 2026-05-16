import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Stash — paste anything, organize automatically",
  description: "Paste a link or text and Stash files it into the right folder.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Stash", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0f1115",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
