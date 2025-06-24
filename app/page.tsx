import InvestmentCalculator from "../investment-calculator"
import HeroSection from "../components/hero-section" // Import the new HeroSection

export default function Page() {
  return (
    <>
      <HeroSection /> {/* Add the HeroSection at the top */}
      <InvestmentCalculator />
    </>
  )
}
