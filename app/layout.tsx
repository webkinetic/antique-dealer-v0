import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import MobileOptimizations from "./mobile-optimizations"
import Script from "next/script"
import BotpressEmbedded from "@/components/botpress-embedded"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Kevin Marshall's Antique Warehouse",
  description: "Discover unique antiques and vintage treasures at Hull's premier antique destination",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0" />
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-QQXP8DDR3M" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QQXP8DDR3M');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <MobileOptimizations />
            <BotpressEmbedded />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'