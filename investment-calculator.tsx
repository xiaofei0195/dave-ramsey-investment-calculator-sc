"use client"

import type React from "react"

import { useState, useEffect, useMemo, useRef } from "react" // Import useRef
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Coffee, Utensils } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle" // Import ThemeToggle

// Helper function to format currency
const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      compactDisplay: "short",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value)
  } else if (value >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      compactDisplay: "short",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Updated Chart component to render bars and add year labels with tooltip
const Chart = ({
  data,
  startYear = new Date().getFullYear(),
}: { data: { name: string; value: number }[]; title?: string; startYear?: number }) => {
  const [tooltipData, setTooltipData] = useState<{ year: number; value: number } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const chartRef = useRef<HTMLDivElement>(null) // Ref to the chart container

  if (!data || data.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No data to display chart.</div>
  }

  const maxVal = Math.max(...data.map((d) => d.value))
  const minVal = Math.min(...data.map((d) => d.value))
  const range = maxVal - minVal

  // Define the chart area within the SVG (0 to 100 for content)
  const chartWidth = 100
  const chartHeight = 100
  const labelAreaWidth = 10 // Space for Y-axis labels on the left
  const totalSvgWidth = chartWidth + labelAreaWidth

  const barWidth = chartWidth / data.length - 1 // Adjust for spacing
  const barSpacing = 0.5 // Percentage of total width

  // Helper to get "nice" tick values for the Y-axis
  const getNiceTickValues = (min: number, max: number, numTicks = 5) => {
    const range = max - min
    if (range === 0) return [min]

    const exponent = Math.floor(Math.log10(range))
    const fraction = range / Math.pow(10, exponent)
    let niceFraction

    if (fraction < 1.5) niceFraction = 1
    else if (fraction < 3) niceFraction = 2
    else if (fraction < 7) niceFraction = 5
    else niceFraction = 10

    const tickSpacing = (niceFraction * Math.pow(10, exponent)) / (numTicks - 1)
    const lowerBound = Math.floor(min / tickSpacing) * tickSpacing
    const upperBound = Math.ceil(max / tickSpacing) * tickSpacing

    const ticks = []
    for (let i = lowerBound; i <= upperBound; i += tickSpacing) {
      ticks.push(i)
    }
    return ticks
  }

  const yAxisTicks = getNiceTickValues(minVal, maxVal, 5) // Aim for 5-7 ticks

  const handleMouseEnter = (event: React.MouseEvent<SVGRectElement>, d: { name: string; value: number }, i: number) => {
    if (chartRef.current) {
      const chartRect = chartRef.current.getBoundingClientRect()
      const barRect = event.currentTarget.getBoundingClientRect()

      // Position tooltip above the bar, centered horizontally
      const x = barRect.left + barRect.width / 2 - chartRect.left
      const y = barRect.top - chartRect.top - 40 // 40px above the bar

      setTooltipData({ year: startYear + i, value: d.value })
      setTooltipPosition({ x, y })
    }
  }

  const handleMouseLeave = () => {
    setTooltipData(null)
    setTooltipPosition(null)
  }

  return (
    <div ref={chartRef} className="w-full h-72 relative pb-8">
      {" "}
      {/* Increased height and added padding-bottom */}
      {/* Removed title rendering */}
      <svg
        viewBox={`-${labelAreaWidth} 0 ${totalSvgWidth} ${chartHeight}`}
        preserveAspectRatio="none"
        className="w-full h-64"
      >
        {" "}
        {/* Adjusted SVG height and viewBox */}
        {/* Y-axis grid lines and labels */}
        {yAxisTicks.map((val, index) => {
          const y = chartHeight - ((val - minVal) / range) * chartHeight // Normalize to SVG 0-100 scale
          return (
            <g key={`y-axis-${index}`}>
              <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#e0e0e0" strokeDasharray="2,2" />
              <text x="-1" y={y} fontSize="3" fill="currentColor" textAnchor="end" dominantBaseline="middle">
                {formatCurrency(val)}
              </text>
            </g>
          )
        })}
        {/* Vertical grid lines */}
        {[0, 25, 50, 75, 100].map((xPercent, index) => (
          <line
            key={`x-grid-${index}`}
            x1={xPercent}
            y1="0"
            x2={xPercent}
            y2={chartHeight}
            stroke="#e0e0e0"
            strokeDasharray="2,2"
          />
        ))}
        {/* Bars */}
        {data.map((d, i) => {
          const x = (i / data.length) * chartWidth
          const height = ((d.value - minVal) / range) * chartHeight
          const y = chartHeight - height
          return (
            <rect
              key={i}
              x={x + barSpacing / 2}
              y={y}
              width={barWidth - barSpacing}
              height={height}
              fill="#e0e0e0"
              onMouseEnter={(e) => handleMouseEnter(e, d, i)}
              onMouseLeave={handleMouseLeave}
            />
          )
        })}
      </svg>
      {/* X-axis labels (adjusted for 32 years) */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
        {data.length > 0 && (
          <>
            <span className="absolute left-[0%] translate-x-[-50%]">{startYear}</span>
            <span className="absolute left-[25%] translate-x-[-50%]">{startYear + 8}</span>
            <span className="absolute left-[50%] translate-x-[-50%]">{startYear + 16}</span>
            <span className="absolute left-[75%] translate-x-[-50%]">{startYear + 24}</span>
            <span className="absolute left-[100%] translate-x-[-50%]">{startYear + data.length - 1}</span>
          </>
        )}
      </div>
      {/* Tooltip */}
      {tooltipData && tooltipPosition && (
        <div
          className="absolute bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-10"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: "translateX(-50%)", // Center horizontally
          }}
        >
          {tooltipData.year}: {formatCurrency(tooltipData.value)}
        </div>
      )}
    </div>
  )
}

export default function InvestmentCalculator() {
  const [activeTab, setActiveTab] = useState("compound-growth")

  // Compound Growth State
  const [initialPrincipal, setInitialPrincipal] = useState(10000)
  const [monthlyContribution, setMonthlyContribution] = useState(200)
  const [annualReturnRate, setAnnualReturnRate] = useState([9]) // Dave Ramsey's 8-10% default
  const [compoundGrowthData, setCompoundGrowthData] = useState<{ name: string; value: number }[]>([])
  const [totalContributed, setTotalContributed] = useState(0)
  const [totalInterestEarned, setTotalInterestEarned] = useState(0)
  const [finalValue, setFinalValue] = useState(0)

  // Debt vs. Invest State
  const [loanType, setLoanType] = useState("mortgage")
  const [loanBalance, setLoanBalance] = useState(200000)
  const [loanInterestRate, setLoanInterestRate] = useState(6)
  const [monthlyLoanPayment, setMonthlyLoanPayment] = useState(1200)
  const [extraAmountAvailable, setExtraAmountAvailable] = useState(300)
  const [debtVsInvestResult, setDebtVsInvestResult] = useState<{
    interestSaved: number
    investmentGrowth: number
    debtPayoffYearsSaved: number
  } | null>(null)

  // Scenario Analysis State
  const [scenarioPrincipal, setScenarioPrincipal] = useState(10000)
  const [scenarioMonthlyContribution, setScenarioMonthlyContribution] = useState(200)
  const [scenarioAnnualReturnRate, setScenarioAnnualReturnRate] = useState([9])
  const [inflationRate, setInflationRate] = useState(3)
  const [recessionReturnRate, setRecessionReturnRate] = useState(-15)
  const [recessionStartYear, setRecessionStartYear] = useState(10)
  const [recessionDuration, setRecessionDuration] = useState(2) // years
  const [scenarioData, setScenarioData] = useState<{ name: string; value: number }[]>([])
  const [incomeGrowthRate, setIncomeGrowthRate] = useState(0) // Declare incomeGrowthRate

  // New state variables for "What if" scenarios
  const [extra100Growth, setExtra100Growth] = useState(0)
  const [coffeeGrowth, setCoffeeGrowth] = useState(0)
  const [restaurantGrowth, setRestaurantGrowth] = useState(0)

  // --- Calculation Functions ---

  // Compound Interest Calculation
  const calculateCompoundGrowth = useMemo(() => {
    return (principal: number, monthlyContribution: number, annualRate: number, years = 32) => {
      const data = []
      let currentPrincipal = principal
      let totalContributions = 0 // Reset to only count periodic contributions
      let totalInterest = 0
      const monthlyRate = annualRate / 100 / 12

      data.push({ name: `Year 0`, value: currentPrincipal })

      for (let year = 1; year <= years; year++) {
        for (let month = 1; month <= 12; month++) {
          currentPrincipal += monthlyContribution
          totalContributions += monthlyContribution
          const interest = currentPrincipal * monthlyRate
          currentPrincipal += interest
          totalInterest += interest
        }
        data.push({ name: `Year ${year}`, value: currentPrincipal })
      }
      return { data, finalValue: currentPrincipal, totalContributions, totalInterest }
    }
  }, [])

  useEffect(() => {
    const { data, finalValue, totalContributions, totalInterest } = calculateCompoundGrowth(
      initialPrincipal,
      monthlyContribution,
      annualReturnRate[0],
      32, // Explicitly set years to 32
    )
    setCompoundGrowthData(data)
    setFinalValue(finalValue)
    setTotalContributed(totalContributions)
    setTotalInterestEarned(totalInterest)
  }, [initialPrincipal, monthlyContribution, annualReturnRate, calculateCompoundGrowth])

  // Debt vs. Invest Calculation
  const calculateDebtVsInvest = useMemo(() => {
    return (
      loanBalance: number,
      loanInterestRate: number,
      monthlyLoanPayment: number,
      extraAmount: number,
      investmentRate: number = annualReturnRate[0],
    ) => {
      const monthlyLoanRate = loanInterestRate / 100 / 12
      const monthlyInvestmentRate = investmentRate / 100 / 12

      // Scenario 1: Pay loan normally
      let currentLoanBalanceNormal = loanBalance
      let totalInterestNormal = 0
      let monthsToPayOffNormal = 0
      while (currentLoanBalanceNormal > 0 && monthsToPayOffNormal < 360) {
        // Cap at 30 years (360 months)
        const interestPayment = currentLoanBalanceNormal * monthlyLoanRate
        const principalPayment = monthlyLoanPayment - interestPayment
        if (principalPayment <= 0) {
          // Loan is not being paid down
          monthsToPayOffNormal = 360 // Assume it won't be paid off within 30 years
          break
        }
        currentLoanBalanceNormal -= principalPayment
        totalInterestNormal += interestPayment
        monthsToPayOffNormal++
      }
      if (currentLoanBalanceNormal > 0)
        totalInterestNormal += currentLoanBalanceNormal * monthlyLoanRate * (360 - monthsToPayOffNormal) // Add remaining interest if not paid off

      // Scenario 2: Pay loan with extra amount
      let currentLoanBalanceExtra = loanBalance
      let totalInterestExtra = 0
      let monthsToPayOffExtra = 0
      const newMonthlyPayment = monthlyLoanPayment + extraAmount
      while (currentLoanBalanceExtra > 0 && monthsToPayOffExtra < 360) {
        const interestPayment = currentLoanBalanceExtra * monthlyLoanRate
        const principalPayment = newMonthlyPayment - interestPayment
        if (principalPayment <= 0) {
          // Loan is not being paid down
          monthsToPayOffExtra = 360
          break
        }
        currentLoanBalanceExtra -= principalPayment
        totalInterestExtra += interestPayment
        monthsToPayOffExtra++
      }
      if (currentLoanBalanceExtra > 0)
        totalInterestExtra += currentLoanBalanceExtra * monthlyLoanRate * (360 - monthsToPayOffExtra)

      const interestSaved = totalInterestNormal - totalInterestExtra
      const debtPayoffYearsSaved = (monthsToPayOffNormal - monthsToPayOffExtra) / 12

      // Scenario 3: Invest the extra amount for the duration of the normal loan payoff
      let investmentValue = 0
      for (let i = 0; i < monthsToPayOffNormal; i++) {
        investmentValue += extraAmount
        investmentValue *= 1 + monthlyInvestmentRate
      }

      return {
        interestSaved,
        investmentGrowth: investmentValue,
        debtPayoffYearsSaved,
      }
    }
  }, [annualReturnRate])

  useEffect(() => {
    const result = calculateDebtVsInvest(loanBalance, loanInterestRate, monthlyLoanPayment, extraAmountAvailable)
    setDebtVsInvestResult(result)
  }, [loanBalance, loanInterestRate, monthlyLoanPayment, extraAmountAvailable, calculateDebtVsInvest])

  // Scenario Analysis Calculation
  const calculateScenarioAnalysis = useMemo(() => {
    return (
      principal: number,
      monthlyContribution: number,
      baseAnnualRate: number,
      inflationRate: number,
      recessionReturnRate: number,
      recessionStartYear: number,
      recessionDuration: number, // in years
      incomeGrowthRate: number,
      years = 32, // Changed default years to 32
    ) => {
      const baseData = []
      // For simplicity with the basic Chart component, we'll only return one series.
      // A full charting library would allow multiple series for comparison.

      let currentPrincipal = principal
      let currentMonthlyContribution = monthlyContribution

      const baseMonthlyRate = baseAnnualRate / 100 / 12
      const recessionMonthlyRate = recessionReturnRate / 100 / 12
      const incomeGrowthMonthlyRate = incomeGrowthRate / 100 / 12

      baseData.push({ name: `Year 0`, value: currentPrincipal })

      for (let year = 1; year <= years; year++) {
        for (let month = 1; month <= 12; month++) {
          // Apply income growth to contribution monthly
          currentMonthlyContribution *= 1 + incomeGrowthMonthlyRate

          currentPrincipal += currentMonthlyContribution

          // Apply recession rate if within the recession period
          if (year >= recessionStartYear && year < recessionStartYear + recessionDuration) {
            currentPrincipal *= 1 + recessionMonthlyRate
          } else {
            currentPrincipal *= 1 + baseMonthlyRate
          }
        }
        // For inflation adjustment, typically you'd adjust the final value's purchasing power.
        // Here, we're just showing the nominal growth with recession/income growth.
        // To show inflation-adjusted, you'd divide by (1 + inflationRate)^year at each data point.
        baseData.push({ name: `Year ${year}`, value: currentPrincipal })
      }

      return { baseData }
    }
  }, [])

  useEffect(() => {
    const { baseData } = calculateScenarioAnalysis(
      scenarioPrincipal,
      scenarioMonthlyContribution,
      scenarioAnnualReturnRate[0],
      inflationRate, // Not directly used in the current simple chart, but passed for future expansion
      recessionReturnRate,
      recessionStartYear,
      recessionDuration,
      incomeGrowthRate,
      32, // Explicitly set years to 32
    )
    setScenarioData(baseData)
  }, [
    scenarioPrincipal,
    scenarioMonthlyContribution,
    scenarioAnnualReturnRate,
    inflationRate,
    recessionReturnRate,
    recessionStartYear,
    recessionDuration,
    incomeGrowthRate,
    calculateScenarioAnalysis,
  ])

  // New useEffect for "What if" calculations
  useEffect(() => {
    const baseFinalValue = finalValue // Use the calculated finalValue from the main compound growth

    // Scenario 1: Extra $100/month
    const { finalValue: finalValueExtra100 } = calculateCompoundGrowth(
      initialPrincipal,
      monthlyContribution + 100,
      annualReturnRate[0],
      32, // Explicitly set years to 32
    )
    setExtra100Growth(finalValueExtra100 - baseFinalValue)

    // Scenario 2: Give up daily coffee ($128/month based on image)
    const { finalValue: finalValueCoffee } = calculateCompoundGrowth(
      initialPrincipal,
      monthlyContribution + 128,
      annualReturnRate[0],
      32, // Explicitly set years to 32
    )
    setCoffeeGrowth(finalValueCoffee - baseFinalValue)

    // Scenario 3: Give up weekly restaurant visits ($200/month based on image)
    const { finalValue: finalValueRestaurant } = calculateCompoundGrowth(
      initialPrincipal,
      monthlyContribution + 200,
      annualReturnRate[0],
      32, // Explicitly set years to 32
    )
    setRestaurantGrowth(finalValueRestaurant - baseFinalValue)
  }, [initialPrincipal, monthlyContribution, annualReturnRate, finalValue, calculateCompoundGrowth])

  return (
    <div id="investment-calculator" className="mx-auto max-w-4xl py-12 px-4 md:py-16 lg:py-20">
      {" "}
      {/* Added id="investment-calculator" */}
      <div className="flex flex-col items-center justify-center text-center mb-12">
        {" "}
        {/* Centered content */}
        <h1 className="text-4xl font-bold mb-4">Dave Ramsey Investment Calculator</h1>
        <p className="text-muted-foreground max-w-2xl">
          Plan your financial future with Dave Ramsey's principles. Understand compound growth, optimize debt payoff vs.
          investing, and simulate various economic scenarios.
        </p>
        <div className="mt-6">
          <ThemeToggle /> {/* ThemeToggle remains here */}
        </div>
      </div>
      <Tabs defaultValue="compound-growth" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compound-growth">Compound Growth</TabsTrigger>
          <TabsTrigger value="debt-vs-invest">Debt vs. Invest</TabsTrigger>
          <TabsTrigger value="scenario-analysis">Scenario Analysis</TabsTrigger>
        </TabsList>

        {/* Compound Growth Tab Content */}
        <TabsContent value="compound-growth" className="border-t p-4">
          <Card>
            <CardHeader>
              <CardTitle>Compound Growth Engine</CardTitle>
              <CardDescription>Visualize your wealth growth over 32 years with consistent investing.</CardDescription>
            </CardHeader>
            {/* New Summary Section */}
            <div className="grid grid-cols-3 gap-4 p-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-muted-foreground">INITIAL BALANCE</h3>
                <p className="text-3xl font-bold">{formatCurrency(initialPrincipal)}</p>
                <p className="text-sm text-muted-foreground">
                  {((initialPrincipal / finalValue) * 100 || 0).toFixed(0)}% of Total
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-muted-foreground">CONTRIBUTIONS</h3>
                <p className="text-3xl font-bold">{formatCurrency(totalContributed)}</p>
                <p className="text-sm text-muted-foreground">
                  {((totalContributed / finalValue) * 100 || 0).toFixed(0)}% of Total
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-muted-foreground">GROWTH</h3>
                <p className="text-3xl font-bold">{formatCurrency(totalInterestEarned)}</p>
                <p className="text-sm text-muted-foreground">
                  {((totalInterestEarned / finalValue) * 100 || 0).toFixed(0)}% of Total
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="initial-principal">Initial Principal ($)</Label>
                  <Input
                    id="initial-principal"
                    type="number"
                    value={initialPrincipal}
                    onChange={(e) => setInitialPrincipal(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monthly-contribution">Monthly Contribution ($)</Label>
                  <Input
                    id="monthly-contribution"
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="annual-return-rate">Annual Return Rate ({annualReturnRate[0]}%)</Label>
                  <Slider
                    id="annual-return-rate"
                    min={5}
                    max={15}
                    step={0.5}
                    value={annualReturnRate}
                    onValueChange={setAnnualReturnRate}
                    className="w-[60%]"
                  />
                  <span className="text-sm text-muted-foreground">Dave Ramsey recommends 8-10%</span>
                </div>
              </div>
              <div className="grid gap-4">
                <Card className="bg-muted/20">
                  <CardHeader>
                    <CardTitle>Projected Growth (32 Years)</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Contributed:</span>
                      <span className="font-semibold">{formatCurrency(totalContributed + initialPrincipal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Interest Earned:</span>
                      <span className="font-semibold">{formatCurrency(totalInterestEarned)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Final Value:</span>
                      <span>{formatCurrency(finalValue)}</span>
                    </div>
                  </CardContent>
                </Card>
                <div className="h-64 w-full">
                  <Chart data={compoundGrowthData} /> {/* Removed title prop */}
                </div>
              </div>
            </CardContent>
            {/* New "What if I..." Section */}
            <div className="p-4 mt-8">
              <h2 className="text-3xl font-bold text-center mb-6">What if I...</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="flex flex-col items-center justify-center gap-4">
                    <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                      <DollarSign className="h-12 w-12" />
                    </div>
                    <h3 className="text-xl font-semibold">SAVED AN EXTRA $100 PER MONTH.</h3>
                    <p className="text-sm text-muted-foreground">Adds $100 a month in contributions, but creates</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(extra100Growth)}</p>
                    <p className="text-sm text-muted-foreground">in additional growth</p>
                  </CardContent>
                </Card>
                <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="flex flex-col items-center justify-center gap-4">
                    <div className="p-4 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                      <Coffee className="h-12 w-12" />
                    </div>
                    <h3 className="text-xl font-semibold">GAVE UP DAILY COFFEE PURCHASES.</h3>
                    <p className="text-sm text-muted-foreground">Adds $128 a month in contributions, but creates</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(coffeeGrowth)}</p>
                    <p className="text-sm text-muted-foreground">in additional growth</p>
                  </CardContent>
                </Card>
                <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="flex flex-col items-center justify-center gap-4">
                    <div className="p-4 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300">
                      <Utensils className="h-12 w-12" />
                    </div>
                    <h3 className="text-xl font-semibold">GAVE UP WEEKLY RESTAURANT VISITS.</h3>
                    <p className="text-sm text-muted-foreground">Adds $200 a month in contributions, but creates</p>
                    <p className="text-2xl font-bold text-yellow-600">{formatCurrency(restaurantGrowth)}</p>
                    <p className="text-sm text-muted-foreground">in additional growth</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Debt vs. Invest Tab Content */}
        <TabsContent value="debt-vs-invest" className="border-t p-4">
          <Card>
            <CardHeader>
              <CardTitle>Debt-Investment Balance Model</CardTitle>
              <CardDescription>
                Compare the long-term financial impact of paying off debt early versus investing.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="loan-type">Loan Type</Label>
                  <Select value={loanType} onValueChange={setLoanType}>
                    <SelectTrigger id="loan-type">
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mortgage">Mortgage</SelectItem>
                      <SelectItem value="car-loan">Car Loan</SelectItem>
                      <SelectItem value="student-loan">Student Loan</SelectItem>
                      <SelectItem value="other">Other Debt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="loan-balance">Current Loan Balance ($)</Label>
                  <Input
                    id="loan-balance"
                    type="number"
                    value={loanBalance}
                    onChange={(e) => setLoanBalance(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="loan-interest-rate">Loan Interest Rate (%)</Label>
                  <Input
                    id="loan-interest-rate"
                    type="number"
                    value={loanInterestRate}
                    onChange={(e) => setLoanInterestRate(Number(e.target.value))}
                    min="0"
                    max="30"
                    step="0.1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monthly-loan-payment">Current Monthly Payment ($)</Label>
                  <Input
                    id="monthly-loan-payment"
                    type="number"
                    value={monthlyLoanPayment}
                    onChange={(e) => setMonthlyLoanPayment(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="extra-amount-available">Extra Monthly Amount Available ($)</Label>
                  <Input
                    id="extra-amount-available"
                    type="number"
                    value={extraAmountAvailable}
                    onChange={(e) => setExtraAmountAvailable(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>
              <div className="grid gap-4">
                <Card className="bg-muted/20">
                  <CardHeader>
                    <CardTitle>Comparison Results</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    {debtVsInvestResult ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interest Saved by Early Payoff:</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(debtVsInvestResult.interestSaved)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Years Saved on Loan:</span>
                          <span className="font-semibold">
                            {debtVsInvestResult.debtPayoffYearsSaved.toFixed(1)} years
                          </span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Investment Growth of Extra Amount:</span>
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(debtVsInvestResult.investmentGrowth)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                          Consider Dave Ramsey's "Debt Snowball" for high-interest debts. The "return" on paying off
                          debt is the interest rate you avoid paying. Compare this to the potential investment return (
                          {annualReturnRate[0]}%).
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Enter details to see the comparison.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenario Analysis Tab Content */}
        <TabsContent value="scenario-analysis" className="border-t p-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Scenario Simulation</CardTitle>
              <CardDescription>
                Adjust economic factors to see how they impact your long-term financial forecast.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="scenario-principal">Initial Principal ($)</Label>
                  <Input
                    id="scenario-principal"
                    type="number"
                    value={scenarioPrincipal}
                    onChange={(e) => setScenarioPrincipal(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="scenario-monthly-contribution">Monthly Contribution ($)</Label>
                  <Input
                    id="scenario-monthly-contribution"
                    type="number"
                    value={scenarioMonthlyContribution}
                    onChange={(e) => setScenarioMonthlyContribution(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="scenario-annual-return-rate">
                    Base Annual Return Rate ({scenarioAnnualReturnRate[0]}%)
                  </Label>
                  <Slider
                    id="scenario-annual-return-rate"
                    min={5}
                    max={15}
                    step={0.5}
                    value={scenarioAnnualReturnRate}
                    onValueChange={setScenarioAnnualReturnRate}
                    className="w-[60%]"
                  />
                </div>
                <Separator className="my-4" />
                <h3 className="text-lg font-semibold">Economic Factors</h3>
                <div className="grid gap-2">
                  <Label htmlFor="inflation-rate">Inflation Rate ({inflationRate}%)</Label>
                  <Input
                    id="inflation-rate"
                    type="number"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recession-return-rate">Recession Return Rate ({recessionReturnRate}%)</Label>
                  <Input
                    id="recession-return-rate"
                    type="number"
                    value={recessionReturnRate}
                    onChange={(e) => setRecessionReturnRate(Number(e.target.value))}
                    min="-50"
                    max="20"
                    step="1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recession-start-year">Recession Start Year</Label>
                  <Input
                    id="recession-start-year"
                    type="number"
                    value={recessionStartYear}
                    onChange={(e) => setRecessionStartYear(Number(e.target.value))}
                    min="1"
                    max="29"
                    step="1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recession-duration">Recession Duration (Years)</Label>
                  <Input
                    id="recession-duration"
                    type="number"
                    value={recessionDuration}
                    onChange={(e) => setRecessionDuration(Number(e.target.value))}
                    min="1"
                    max="10"
                    step="1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="income-growth-rate">Income Growth Expectation ({incomeGrowthRate}%)</Label>
                  <Input
                    id="income-growth-rate"
                    type="number"
                    value={incomeGrowthRate}
                    onChange={(e) => setIncomeGrowthRate(Number(e.target.value))}
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>
              </div>
              <div className="grid gap-4">
                <Card className="bg-muted/20">
                  <CardHeader>
                    <CardTitle>Scenario Forecast</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    <p className="text-sm text-muted-foreground">
                      This chart shows the base growth, and how a simulated recession and income growth could impact
                      your investments. (Note: For full multi-line chart comparison including inflation, a more advanced
                      charting library would be used.)
                    </p>
                    <div className="h-64 w-full">
                      <Chart data={scenarioData} /> {/* Removed title prop */}
                    </div>
                    <div className="mt-4 text-sm">
                      <p>
                        <span className="font-semibold">Projected Final Value:</span>{" "}
                        {formatCurrency(scenarioData[scenarioData.length - 1]?.value || 0)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <CardFooter className="mt-8 text-center text-sm text-muted-foreground">
        Disclaimer: This calculator is for informational purposes only and does not constitute financial advice. Consult
        a qualified financial professional for personalized guidance.
      </CardFooter>
    </div>
  )
}
