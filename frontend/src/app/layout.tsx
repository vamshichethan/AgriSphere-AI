import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgriFlow | Digital Agriculture Commerce & Intelligence",
  description: "A scalable full-stack AgriTech platform for crop disease detection, agricultural intelligence, and marketplace trading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-neutral-950 text-neutral-50 selection:bg-agri-green-500/30`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
