import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider" // Import ThemeProvider

export const metadata = {
  title: "Dave Ramsey Investment Calculator - Plan Your Financial Future",
  description:
    "Use the Dave Ramsey Investment Calculator to visualize compound growth, compare debt payoff vs. investing, and simulate financial scenarios for a secure future.",
  keywords:
    "Dave Ramsey, investment calculator, compound interest, debt payoff, financial planning, wealth building, personal finance, index funds, retirement planning",
  openGraph: {
    title: "Dave Ramsey Investment Calculator",
    description:
      "Plan your financial future with Dave Ramsey's principles. Understand compound growth, optimize debt payoff vs. investing, and simulate various economic scenarios.",
    url: "https://yourwebsite.com", // Replace with your actual website URL
    siteName: "Dave Ramsey Investment Calculator",
    images: [
      {
        url: "/placeholder.svg?height=630&width=1200", // Replace with a relevant image for social sharing
        width: 1200,
        height: 630,
        alt: "Dave Ramsey Investment Calculator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dave Ramsey Investment Calculator",
    description:
      "Plan your financial future with Dave Ramsey's principles. Understand compound growth, optimize debt payoff vs. investing, and simulate various economic scenarios.",
    creator: "@yourtwitterhandle", // Replace with your Twitter handle
    images: ["/placeholder.svg?height=630&width=1200"], // Replace with a relevant image for social sharing
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
