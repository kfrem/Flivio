import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Utensils, BarChart3, TrendingUp, ShieldAlert,
  ChefHat, Layers, Zap, ArrowRight, Check,
  Sparkles, SlidersHorizontal, FileSpreadsheet,
} from "lucide-react";

const features = [
  { icon: BarChart3, title: "Live Dashboard", desc: "Real-time revenue, cost and margin tracking with weekly profit breakdowns" },
  { icon: ChefHat, title: "Menu Costing", desc: "Ingredient-level cost per dish with profit margins and target serves calculator" },
  { icon: ShieldAlert, title: "Supplier Risk", desc: "Flag single-source dependencies and track price inflation across ingredients" },
  { icon: Layers, title: "Cost Classification", desc: "Break down Direct, Indirect and Overhead costs with visual trend analysis" },
  { icon: SlidersHorizontal, title: "What-If Simulator", desc: "Model scenarios before committing - adjust costs and see instant P&L impact" },
  { icon: Sparkles, title: "Smart Recommendations", desc: "AI-powered suggestions to cut waste, optimise staffing and boost margins" },
  { icon: TrendingUp, title: "Promotions Impact", desc: "Simulate discount effects and calculate required volumes to hit profit targets" },
  { icon: FileSpreadsheet, title: "CSV Data Import", desc: "Bulk upload ingredients, suppliers and menu items from your existing systems" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background" data-testid="page-landing">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 h-14">
          <Link href="/" data-testid="link-landing-home">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Utensils className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Flivio</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/app">
              <Button variant="outline" data-testid="button-login">Log In</Button>
            </Link>
            <Link href="/app?mode=demo">
              <Button data-testid="button-try-demo">Try Demo</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="text-xs px-3 py-1">
              Built for restaurant owners
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Know exactly where every pound goes in your restaurant
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Flivio gives you complete visibility over your costs, margins and supplier risks.
              Stop guessing, start optimising - with real data from your kitchen to your bottom line.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/app?mode=demo">
                <Button size="lg" data-testid="button-hero-demo">
                  See Live Demo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/app?mode=trial">
                <Button size="lg" variant="outline" data-testid="button-hero-trial">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t" data-testid="section-features">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Everything you need to control your costs</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">From ingredient pricing to supplier risk alerts, Flivio covers every aspect of restaurant financial management.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <Card key={f.title} className="hover-elevate">
                <CardContent className="p-5 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t bg-muted/30" data-testid="section-how-it-works">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">How Flivio works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Enter your data", desc: "Add your restaurant details, monthly financials, menu items and supplier information - or import from CSV." },
              { step: "2", title: "See the full picture", desc: "Instantly visualise cost breakdowns, margin trends, supplier risks and weekly profit performance." },
              { step: "3", title: "Optimise and grow", desc: "Use the simulator to test scenarios, follow smart recommendations, and track improvements over time." },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t" data-testid="section-pricing">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Simple, transparent pricing</h2>
            <p className="text-muted-foreground mt-2">Start free, upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Free Trial", price: "Free", period: "14 days", features: ["Full dashboard access", "Up to 20 menu items", "Basic cost analysis", "CSV import"], cta: "Start Trial", variant: "outline" as const },
              { name: "Professional", price: "£49", period: "/month", features: ["Unlimited menu items", "Supplier risk monitoring", "What-If Simulator", "Smart Recommendations", "Priority support"], cta: "Get Started", variant: "default" as const },
              { name: "Enterprise", price: "Custom", period: "", features: ["Multi-location support", "API access", "Custom integrations", "Dedicated account manager", "Training & onboarding"], cta: "Contact Us", variant: "outline" as const },
            ].map((plan) => (
              <Card key={plan.name} className={plan.variant === "default" ? "border-primary" : ""}>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/app?mode=trial">
                    <Button variant={plan.variant} className="w-full">{plan.cta}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Utensils className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Flivio</span>
          </div>
          <p className="text-xs text-muted-foreground">Flivio Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
