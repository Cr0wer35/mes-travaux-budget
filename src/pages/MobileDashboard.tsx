import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, AlertTriangle, BarChart3, PieChart, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useExpenseStats } from '@/hooks/useExpenseStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const COLORS = [
  'hsl(243 75% 59%)',  // Primary
  'hsl(240 89% 68%)',  // Primary Glow  
  'hsl(238 86% 77%)',  // Primary Light
  'hsl(142 76% 36%)',  // Success
  'hsl(32 95% 44%)',   // Warning
  'hsl(0 84.2% 60.2%)', // Destructive
];

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  variant = 'default',
  icon: Icon,
  className = '' 
}: {
  title: string;
  value: string;
  subtitle: string;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-destructive" />;
    return null;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success': return 'border-success/20 bg-success/5';
      case 'warning': return 'border-warning/20 bg-warning/5';
      case 'danger': return 'border-destructive/20 bg-destructive/5';
      default: return '';
    }
  };

  return (
    <Card className={`notion-card ${getVariantStyles()} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{subtitle}</p>
              {getTrendIcon()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MobileDashboard() {
  const stats = useExpenseStats();
  const [showCharts, setShowCharts] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBudgetVariant = () => {
    if (stats.budgetUsedPercentage > 100) return 'danger';
    if (stats.budgetUsedPercentage > 80) return 'warning';
    return 'success';
  };

  const getBudgetTrend = () => {
    if (stats.budgetUsedPercentage > 100) return 'down';
    if (stats.budgetUsedPercentage > 80) return 'down';
    return 'up';
  };

  // Prepare data for charts
  const categoryData = Object.entries(stats.byCategory)
    .filter(([_, data]) => data.spent > 0)
    .map(([category, data]) => ({
      name: category.length > 12 ? category.substring(0, 12) + '...' : category,
      value: data.spent,
    }));

  const comparisonData = Object.entries(stats.byCategory)
    .filter(([_, data]) => data.budget > 0 || data.spent > 0)
    .slice(0, 5) // Limit for mobile display
    .map(([category, data]) => ({
      category: category.length > 8 ? category.substring(0, 8) + '...' : category,
      budget: data.budget,
      spent: data.spent,
    }));

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="notion-card border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Erreur de chargement</h3>
            <p className="text-sm text-muted-foreground mb-4">{stats.error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <div className="gradient-hero px-4 pt-8 pb-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Mes Travaux</h1>
            <p className="text-white/80 text-sm">Suivi de vos dépenses en temps réel</p>
          </div>
          <Link to="/add-expense">
            <Button size="sm" className="bg-white/20 hover:bg-white/30 border-white/20 text-white shadow-glow mobile-touch">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </Link>
        </div>

        {/* Quick Stats in Header */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-3">
            <p className="text-white/60 text-xs font-medium mb-1">Total dépensé</p>
            <p className="text-xl font-bold text-white">{formatCurrency(stats.totalSpent)}</p>
          </div>
          <div className="glass-card p-3">
            <p className="text-white/60 text-xs font-medium mb-1">Budget restant</p>
            <p className={`text-xl font-bold ${stats.remainingBudget < 0 ? 'text-red-200' : 'text-green-200'}`}>
              {formatCurrency(stats.remainingBudget)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6 -mt-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4">
          <MetricCard
            title="Budget total"
            value={formatCurrency(stats.totalBudget)}
            subtitle="Budget prévu initialement"
            icon={BarChart3}
          />
          <MetricCard
            title="Budget utilisé"
            value={`${stats.budgetUsedPercentage.toFixed(1)}%`}
            subtitle={stats.budgetUsedPercentage > 100 ? 'Dépassement de budget!' : 'Progression du budget'}
            variant={getBudgetVariant()}
            trend={getBudgetTrend()}
            icon={TrendingUp}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/expenses" className="block">
            <Card className="notion-card hover:shadow-primary transition-spring">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Dépenses</h3>
                <p className="text-xs text-muted-foreground">Voir la liste</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/budgets" className="block">
            <Card className="notion-card hover:shadow-primary transition-spring">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center mx-auto mb-3">
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Budgets</h3>
                <p className="text-xs text-muted-foreground">Gérer les budgets</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Charts Toggle */}
        <Card className="notion-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Visualisations</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCharts(!showCharts)}
                className="mobile-touch"
              >
                {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {showCharts && (
            <CardContent className="space-y-6">
              {/* Pie Chart */}
              {categoryData.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Répartition par catégorie</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Bar Chart */}
              {comparisonData.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Budget vs Réel</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="category" 
                        tick={{ fontSize: 10 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        tickFormatter={(value) => `${Math.round(value/1000)}k€`}
                        tick={{ fontSize: 10 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="budget" fill="hsl(var(--primary))" name="Budget" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="spent" fill="hsl(var(--warning))" name="Dépensé" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Bottom padding for navigation */}
        <div className="h-20" />
      </div>
    </div>
  );
}