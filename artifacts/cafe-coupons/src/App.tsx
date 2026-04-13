import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/Dashboard";
import CreateBatch from "@/pages/CreateBatch";
import Batches from "@/pages/Batches";
import BatchDetail from "@/pages/BatchDetail";
import Coupons from "@/pages/Coupons";
import PublicCoupon from "@/pages/PublicCoupon";
import StaffScanner from "@/pages/StaffScanner";
import PrintBatch from "@/pages/PrintBatch";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/create" component={CreateBatch} />
      <Route path="/batches" component={Batches} />
      <Route path="/batches/:id" component={BatchDetail} />
      <Route path="/coupons" component={Coupons} />
      <Route path="/coupon/:code" component={PublicCoupon} />
      <Route path="/staff" component={StaffScanner} />
      <Route path="/print/:batchId" component={PrintBatch} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
