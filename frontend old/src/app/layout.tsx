import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DrishtiAI | AI-Powered Retinal Care",
  description: "Explainable AI-powered retinal analysis platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
