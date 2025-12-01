import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionTimeout from "@/components/session-timeout";

// ✅ Load Inter font from Google via next/font
const inter = Inter({
  variable: "--font-inter", // custom CSS variable name
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gawad Tsanselor",
  description: "",
  icons: {
    icon: "/Logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased h-full`}>
        <SessionTimeout />
        {children}
      </body>
    </html>
  );
}