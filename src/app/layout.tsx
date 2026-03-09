import type { Metadata } from "next"
import { Syne, DM_Mono, Geist } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
})

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
})

export const metadata: Metadata = {
  title: "Stoxify — The market, simplified.",
  description: "Platform AI investment untuk investor retail Indonesia. Saham IDX, Global, dan Crypto dalam satu platform.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={cn(syne.variable, dmMono.variable, "font-sans", geist.variable)}>
      <body className="bg-[#010206] text-[#FFFEF8] antialiased">
        {children}
      </body>
    </html>
  )
}