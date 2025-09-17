import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useExpenseStats } from "@/hooks/useExpenseStats";
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  Home,
  PieChart as PieChartIcon,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--accent))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
];

export default function Dashboard() {
  const stats = useExpenseStats();
  const [selectedView, setSelectedView] = useState<
    "overview" | "categories" | "rooms"
  >("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k€`;
    }
    return formatCurrency(amount);
  };

  // Prepare data for pie chart (categories)
  const categoryData = Object.entries(stats.byCategory)
    .filter(([_, data]) => data.spent > 0)
    .map(([category, data]) => ({
      name: category,
      value: data.spent,
      percentage:
        stats.totalSpent > 0
          ? ((data.spent / stats.totalSpent) * 100).toFixed(1)
          : "0",
    }))
    .sort((a, b) => b.value - a.value);

  // Prepare data for bar chart (budget vs actual)
  const comparisonData = Object.entries(stats.byCategory)
    .filter(([_, data]) => data.budget > 0 || data.spent > 0)
    .map(([category, data]) => ({
      category:
        category.length > 8 ? category.substring(0, 8) + "..." : category,
      fullCategory: category,
      budget: data.budget,
      spent: data.spent,
      remaining: Math.max(0, data.budget - data.spent),
      overBudget: Math.max(0, data.spent - data.budget),
    }))
    .sort((a, b) => b.spent - a.spent);

  // Room data
  const roomData = Object.entries(stats.byRoom)
    .filter(([_, data]) => data.spent > 0)
    .map(([room, data]) => ({
      name: room,
      value: data.spent,
      budget: data.budget,
      percentage:
        data.budget > 0 ? ((data.spent / data.budget) * 100).toFixed(1) : "0",
    }))
    .sort((a, b) => b.value - a.value);

  const getBudgetStatus = () => {
    if (stats.budgetUsedPercentage > 100)
      return {
        variant: "destructive",
        icon: AlertTriangle,
        text: "Dépassement",
      };
    if (stats.budgetUsedPercentage > 80)
      return { variant: "warning", icon: TrendingUp, text: "Attention" };
    return { variant: "success", icon: Target, text: "Sur la bonne voie" };
  };

  const budgetStatus = getBudgetStatus();
  const StatusIcon = budgetStatus.icon;

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile-First */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Dashboard Travaux
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Analyse complète de vos dépenses et budget
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={stats.refresh}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Actualiser</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Navigation Tabs Mobile-First */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white p-1 rounded-lg border">
            {[
              { key: "overview", label: "Vue d'ensemble", icon: BarChart3 },
              { key: "categories", label: "Catégories", icon: PieChartIcon },
              { key: "rooms", label: "Pièces", icon: Home },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={selectedView === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedView(key as any)}
                className="flex-1 flex items-center justify-center space-x-2 text-xs sm:text-sm"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(" ")[0]}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Dépensé
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {formatCompactCurrency(stats.totalSpent)}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Budget
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {formatCompactCurrency(stats.totalBudget)}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Restant
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {formatCompactCurrency(stats.remainingBudget)}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-lg ${
                    stats.remainingBudget >= 0 ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {stats.remainingBudget >= 0 ? (
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Utilisation
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {stats.budgetUsedPercentage.toFixed(0)}%
                  </p>
                </div>
                <div
                  className={`p-2 rounded-lg ${
                    budgetStatus.variant === "success"
                      ? "bg-green-100"
                      : budgetStatus.variant === "warning"
                      ? "bg-yellow-100"
                      : "bg-red-100"
                  }`}
                >
                  <StatusIcon
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      budgetStatus.variant === "success"
                        ? "text-green-600"
                        : budgetStatus.variant === "warning"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Progression du Budget</h3>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(stats.totalSpent)} sur{" "}
                  {formatCurrency(stats.totalBudget)}
                </p>
              </div>
              <Badge
                variant={budgetStatus.variant as any}
                className="mt-2 sm:mt-0 w-fit"
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {budgetStatus.text}
              </Badge>
            </div>
            <Progress
              value={Math.min(stats.budgetUsedPercentage, 100)}
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0%</span>
              <span>{stats.budgetUsedPercentage.toFixed(1)}%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Content Based on Selected View */}
        {selectedView === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget vs Dépenses */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Budget vs Dépenses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value, name) => [
                          formatCurrency(value as number),
                          name === "budget" ? "Budget" : "Dépensé",
                        ]}
                        labelFormatter={(label) =>
                          comparisonData.find((d) => d.category === label)
                            ?.fullCategory || label
                        }
                      />
                      <Bar
                        dataKey="budget"
                        fill="hsl(var(--muted))"
                        name="budget"
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        dataKey="spent"
                        fill="hsl(var(--primary))"
                        name="spent"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5" />
                  <span>Répartition par Catégorie</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {categoryData.slice(0, 5).map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {formatCompactCurrency(item.value)}
                        </span>
                        <span className="text-muted-foreground">
                          ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === "categories" && (
          <div className="space-y-6">
            {/* Detailed Category Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Analyse Détaillée par Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comparisonData.map((item, index) => {
                    const usagePercentage =
                      item.budget > 0 ? (item.spent / item.budget) * 100 : 0;
                    const isOverBudget =
                      item.spent > item.budget && item.budget > 0;

                    return (
                      <div
                        key={item.fullCategory}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                          <h4 className="font-semibold text-lg">
                            {item.fullCategory}
                          </h4>
                          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                            {isOverBudget && (
                              <Badge variant="destructive" className="text-xs">
                                Dépassement
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(item.spent)} /{" "}
                              {formatCurrency(item.budget)}
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={Math.min(usagePercentage, 100)}
                          className="h-2 mb-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{usagePercentage.toFixed(1)}% utilisé</span>
                          <span>
                            {item.budget > item.spent
                              ? `${formatCurrency(item.remaining)} restant`
                              : `${formatCurrency(
                                  item.overBudget
                                )} de dépassement`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === "rooms" && (
          <div className="space-y-6">
            {/* Room Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {roomData.map((room, index) => {
                const usagePercentage =
                  room.budget > 0 ? (room.value / room.budget) * 100 : 0;
                const isOverBudget =
                  room.value > room.budget && room.budget > 0;

                return (
                  <Card key={room.name} className="relative overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Home className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{room.name}</h3>
                        </div>
                        {isOverBudget && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Dépassé
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dépensé</span>
                          <span className="font-medium">
                            {formatCurrency(room.value)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Budget</span>
                          <span className="font-medium">
                            {formatCurrency(room.budget)}
                          </span>
                        </div>

                        {room.budget > 0 && (
                          <>
                            <Progress
                              value={Math.min(usagePercentage, 100)}
                              className="h-2"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{usagePercentage.toFixed(1)}%</span>
                              <span>
                                {room.value <= room.budget
                                  ? `${formatCurrency(
                                      room.budget - room.value
                                    )} restant`
                                  : `+${formatCurrency(
                                      room.value - room.budget
                                    )}`}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Error State */}
        {stats.error && (
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Erreur de chargement
              </h3>
              <p className="text-muted-foreground mb-4">{stats.error}</p>
              <Button onClick={stats.refresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
