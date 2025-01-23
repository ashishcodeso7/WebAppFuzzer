import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fuzzing Tool - Web Application Security Scanner",
  description: "Identify vulnerabilities in your web applications through automated testing",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background`}>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
