import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Utensils, BarChart3, TrendingUp, ShieldAlert,
  ChefHat, Layers, Zap, ArrowRight, Check,
  Sparkles, SlidersHorizontal, FileSpreadsheet,
  PoundSterling, Target, Calculator, Star,
} from "lucide-react";

const features = [
  { icon: BarChart3, title: "Live P&L Dashboard", desc: "Real-time revenue, cost and margin tracking with weekly profit breakdowns and trend alerts" },
  { icon: ChefHat, title: "Menu & Recipe Costing", desc: "Ingredient-level cost per dish, GP% per serve, VAT analysis and target price modelling" },
  { icon: Star, title: "Menu Engineering Matrix", desc: "Instantly see which dishes are Stars, Plough Horses, Puzzles or Dogs — and act on it" },
  { icon: ShieldAlert, title: "Supplier Intelligence", desc: "Flag single-source risks, track price inflation and identify alternative suppliers by category" },
  { icon: Calculator, title: "Breakeven Analysis", desc: "Know exactly how many covers you need each day to cover your costs — before the service starts" },
  { icon: PoundSterling, title: "UK Cost Benchmarks", desc: "Compare your food cost %, labour %, energy and margins against UK restaurant averages by cuisine type" },
  { icon: SlidersHorizontal, title: "What-If Simulator", desc: "Model price changes, staff reductions, or new menu items and see the exact P&L impact instantly" },
  { icon: Layers, title: "Delivery Platform Analysis", desc: "See your true net profit after Uber Eats, Deliveroo and Just Eat commissions — dish by dish" },
  { icon: Sparkles, title: "Smart Recommendations", desc: "Data-driven actions drawn from your real numbers — not generic advice. Specific, prioritised, measurable." },
  { icon: Target, title: "Promotions Simulator", desc: "Run discount scenarios and calculate the exact covers needed to hit your profit target" },
  { icon: Zap, title: "National Living Wage Tracker", desc: "Instantly see the P&L impact of NLW changes on your labour cost percentage and annual bottom line" },
  { icon: FileSpreadsheet, title: "CSV Data Import", desc: "Upload your existing ingredients, supplier lists and menu items in seconds — no manual re-entry" },
];

const testimonials = [
  { quote: "Finally I can see which dishes are actually making me money. The menu matrix alone paid for the subscription in a week.", name: "Raj P.", role: "Curry House Owner, Birmingham" },
  { quote: "Our food cost was at 38% and we didn't even know. Three months later it's 29%. This is what we needed.", name: "Maria C.", role: "Tapas Restaurant, Manchester" },
  { quote: "I showed the supplier risk report to my meat supplier and renegotiated 6% off my beef price. Brilliant tool.", name: "Tom W.", role: "Gastropub, Leeds" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background" data-testid="page-landing">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 h-14">
          <Link href="/" data-testid="link-landing-home">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <PoundSterling className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Food Profit Flow</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" data-testid="button-login">Log In</Button>
            </Link>
            <Link href="/register">
              <Button data-testid="button-try-demo">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="text-xs px-3 py-1">
              Built for UK restaurant owners — by food economists
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              The financial intelligence your restaurant needs — and no accountant can give you
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Food Profit Flow turns your messy restaurant data into clear, actionable intelligence.
              Know your true food cost per dish, spot supplier risks before they hit your margins,
              and understand exactly where every pound is going — all from your phone.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/register">
                <Button size="lg" data-testid="button-hero-start">
                  Start Free — 14 Days
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" data-testid="button-hero-login">
                  Log In
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">No credit card required · Cancel anytime · Setup in under 10 minutes</p>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-12 bg-muted/40 border-t border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { stat: "68%", label: "of restaurants don't know their true food cost per dish" },
              { stat: "£12k", label: "average annual loss from untracked food waste in UK restaurants" },
              { stat: "34%", label: "of UK restaurant closures are linked to poor cost visibility" },
            ].map((item) => (
              <div key={item.stat} className="space-y-1">
                <div className="text-3xl font-bold text-primary">{item.stat}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t" data-testid="section-features">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Every tool your restaurant finance needs — in one place</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              From supplier price tracking to menu engineering, Food Profit Flow covers the intelligence
              that no accountant, food consultant or spreadsheet can give you at this speed.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-shadow">
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

      {/* How it works */}
      <section className="py-16 md:py-20 border-t bg-muted/30" data-testid="section-how-it-works">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">From messy data to clear profit intelligence — in minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Enter your data", desc: "Add monthly financials, menu items, ingredients and supplier details — or bulk import from CSV." },
              { step: "2", title: "See the full picture", desc: "Instantly see your GP% per dish, supplier risks, cost benchmarks and weekly breakeven targets." },
              { step: "3", title: "Get smart recommendations", desc: "Receive prioritised, specific actions based on your real numbers — not generic hospitality advice." },
              { step: "4", title: "Track improvements", desc: "Monitor your progress month by month. Watch your food cost fall and your margins climb." },
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

      {/* Testimonials */}
      <section className="py-16 md:py-20 border-t">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">What restaurant owners are saying</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-20 border-t bg-muted/30" data-testid="section-pricing">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Simple, transparent pricing</h2>
            <p className="text-muted-foreground mt-2">Start free for 14 days. No card required. Cancel any time.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "14 days",
                features: [
                  "Full dashboard access",
                  "Up to 30 menu items",
                  "Supplier risk tracking",
                  "Menu Engineering Matrix",
                  "Breakeven Analysis",
                  "CSV import",
                ],
                cta: "Start Free Trial",
                variant: "outline" as const,
                highlight: false,
              },
              {
                name: "Professional",
                price: "£49",
                period: "/month",
                features: [
                  "Unlimited menu items & suppliers",
                  "Full UK benchmark comparisons",
                  "National Living Wage tracker",
                  "Delivery platform true-cost analysis",
                  "What-If Simulator",
                  "Smart Recommendations engine",
                  "Priority email support",
                ],
                cta: "Get Started",
                variant: "default" as const,
                highlight: true,
              },
              {
                name: "Multi-Site",
                price: "Custom",
                period: "",
                features: [
                  "Multiple restaurant locations",
                  "Group P&L consolidation",
                  "Central supplier management",
                  "API access for integrations",
                  "Dedicated account manager",
                  "Onboarding & training",
                ],
                cta: "Contact Us",
                variant: "outline" as const,
                highlight: false,
              },
            ].map((plan) => (
              <Card key={plan.name} className={plan.highlight ? "border-primary shadow-lg" : ""}>
                <CardContent className="p-6 space-y-4">
                  {plan.highlight && (
                    <Badge className="text-xs">Most Popular</Badge>
                  )}
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
                  <Link href="/register">
                    <Button variant={plan.variant} className="w-full">{plan.cta}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 border-t bg-primary/5">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">Ready to see where your profits are really going?</h2>
          <p className="text-muted-foreground">
            Join hundreds of UK restaurant owners who now understand their numbers — and are doing something about them.
          </p>
          <Link href="/register">
            <Button size="lg">
              Start Your Free Trial
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">foodprofitflow.com · Built for UK restaurants</p>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <PoundSterling className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Food Profit Flow</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 Food Profit Flow Ltd · foodprofitflow.com · All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
