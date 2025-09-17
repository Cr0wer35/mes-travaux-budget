import { MobileNavigation } from "@/components/MobileNavigation";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AddExpense from "./pages/AddExpense";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Budgets from "./pages/HierarchicalBudgets";
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
              <Route path="/" element={<Dashboard />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/add-expense" element={<AddExpense />} />
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
