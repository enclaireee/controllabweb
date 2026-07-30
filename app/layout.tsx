import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const generalSans = localFont({
  variable: "--font-general-sans",
  src: [
    { path: "./fonts/general-sans/GeneralSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/general-sans/GeneralSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/general-sans/GeneralSans-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/general-sans/GeneralSans-Bold.woff2", weight: "700", style: "normal" },
  ],
});

const neueMontreal = localFont({
  variable: "--font-neue-montreal",
  src: [
    { path: "./fonts/neue-montreal/NeueMontreal-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/neue-montreal/NeueMontreal-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/neue-montreal/NeueMontreal-Bold.woff2", weight: "700", style: "normal" },
  ],
});

const reckless = localFont({
  variable: "--font-reckless",
  src: [
    { path: "./fonts/reckless/RecklessStandardM-TRIAL-Book.woff2", weight: "400", style: "normal" },
    { path: "./fonts/reckless/RecklessStandardM-TRIAL-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/reckless/RecklessStandardM-TRIAL-Bold.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Controllab",
  description: "Controllab",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${generalSans.variable} ${neueMontreal.variable} ${reckless.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
