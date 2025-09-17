import { Button } from "@/components/ui/button";
import { Home, Plus, Receipt, Target } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function MobileNavigation() {
  const location = useLocation();

  const navItems = [
    { to: "/", icon: Home, label: "Accueil" },
    { to: "/expenses", icon: Receipt, label: "Dépenses" },
    { to: "/budgets", icon: Target, label: "Budgets" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-border/50" />

      {/* Navigation content */}
      <div className="relative px-2 py-2">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);

            return (
              <Link key={item.to} to={item.to}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col items-center gap-1 h-auto py-2 px-2 mobile-touch ${
                    active
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}

          {/* Floating Add Button */}
          <Link to="/add-expense">
            <Button
              size="sm"
              className="gradient-primary text-white shadow-primary h-12 w-12 rounded-full p-0 mobile-touch transition-spring hover:scale-105"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
