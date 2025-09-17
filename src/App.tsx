import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MobileNavigation } from "@/components/MobileNavigation";
import MobileDashboard from "./pages/MobileDashboard";
import Budgets from "./pages/Budgets";
import Expenses from "./pages/Expenses";
import AddExpense from "./pages/AddExpense";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background overflow-x-hidden">
          <main className="pb-20">
            <Routes>
              <Route path="/" element={<MobileDashboard />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/add-expense" element={<AddExpense />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <MobileNavigation />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
