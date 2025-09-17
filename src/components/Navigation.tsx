import { Button } from "@/components/ui/button";
import { LayoutDashboard, Plus, Receipt, Target } from "lucide-react";
import { NavLink } from "react-router-dom";

export function Navigation() {
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/budgets", icon: Target, label: "Budgets" },
    { to: "/expenses", icon: Receipt, label: "Dépenses" },
  ];

  return (
    <nav className="bg-card border-b shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Travaux Tracker</h1>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}

            {/* Add Expense Button */}
            <NavLink to="/expenses/new">
              <Button
                size="sm"
                className="gradient-primary text-primary-foreground shadow-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
