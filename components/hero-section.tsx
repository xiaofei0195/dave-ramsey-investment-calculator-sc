"use client" // Mark as a Client Component

import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative w-full py-24 md:py-32 lg:py-40 bg-gradient-to-br from-gray-900 to-gray-700 text-white dark:from-gray-950 dark:to-gray-800">
      <div className="container px-4 md:px-6 text-center">
        <div className="space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-tight">
            Unlock Your Financial Freedom
          </h1>
          <p className="text-lg md:text-xl text-gray-300 dark:text-gray-400">
            Discover the power of compound interest and make informed decisions about your debt and investments with our
            Dave Ramsey-inspired calculator.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                document.getElementById("investment-calculator")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Get Started
            </Button>
            <Button
              onClick={() => {
                document.getElementById("investment-calculator")?.scrollIntoView({ behavior: "smooth" })
              }}
              variant="outline"
              className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-transparent px-8 text-base font-medium text-white shadow-lg transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
