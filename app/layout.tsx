import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";

export const metadata: Metadata = {
  title: "Orquestra | The AI Operating System for Modern Businesses",
  description: "Sales, inventory, customers and operations in one intelligent platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans font-medium antialiased">{children}</body>
    </html>
  );
}
