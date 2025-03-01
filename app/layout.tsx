import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/navbar";
import { merriweather } from "@/components/ui/fonts";


export const metadata: Metadata = {
  title: "Skill Scan",
  description: "An app to match job and skilled candidates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${merriweather.variable} antialiased`}>
        <Navbar/>
        {children}
      </body>
    </html>
  );
}
