import { Switch, Route, useLocation } from "wouter";
import { queryClient, getQueryFn } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ErrorBoundary } from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Admin from "@/pages/admin";
import Dashboard from "@/pages/dashboard";
import ProcessFlow from "@/pages/process-flow";
import CostAnalysis from "@/pages/cost-analysis";
import Simulator from "@/pages/simulator";
import Recommendations from "@/pages/recommendations";
import AddData from "@/pages/add-data";
import QuickAssessment from "@/pages/quick-assessment";
import MenuCosting from "@/pages/menu-costing";
import SupplierRisk from "@/pages/supplier-risk";
import CostClassification from "@/pages/cost-classification";
import PromotionsPage from "@/pages/promotions";
import DataImport from "@/pages/data-import";
import DeliveryPlatforms from "@/pages/delivery-platforms";
import ExpenseIntelligence from "@/pages/expense-intelligence";
import DrillDown from "@/pages/drill-down";

function AppRouter() {
  return (
    <Switch>
      <Route path="/app" component={Dashboard} />
      <Route path="/app/admin" component={Admin} />
      <Route path="/app/quick-assessment" component={QuickAssessment} />
      <Route path="/app/menu-costing" component={MenuCosting} />
      <Route path="/app/supplier-risk" component={SupplierRisk} />
      <Route path="/app/cost-classification" component={CostClassification} />
      <Route path="/app/promotions" component={PromotionsPage} />
      <Route path="/app/delivery-platforms" component={DeliveryPlatforms} />
      <Route path="/app/process-flow" component={ProcessFlow} />
      <Route path="/app/cost-analysis" component={CostAnalysis} />
      <Route path="/app/expense-intelligence" component={ExpenseIntelligence} />
      <Route path="/app/simulator" component={Simulator} />
      <Route path="/app/recommendations" component={Recommendations} />
      <Route path="/app/add-data" component={AddData} />
      <Route path="/app/data-import" component={DataImport} />
      <Route path="/app/drill-down" component={DrillDown} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Redirects to /login if the session is not authenticated
function AuthGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return <>{children}</>;
}

function AppLayout() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={false} style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <header className="flex items-center justify-between gap-2 px-3 py-2 border-b sticky top-0 z-50 bg-background h-12">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-auto">
              <ErrorBoundary>
                <AppRouter />
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}

function RootRouter() {
  const [location] = useLocation();
  if (location.startsWith("/app")) {
    return <AppLayout />;
  }
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <RootRouter />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
