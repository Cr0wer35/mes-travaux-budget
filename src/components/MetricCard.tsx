import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  variant = 'default', 
  trend,
  className 
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'gradient-success text-success-foreground shadow-primary';
      case 'warning':  
        return 'gradient-warning text-warning-foreground shadow-primary';
      case 'danger':
        return 'bg-destructive text-destructive-foreground shadow-primary';
      default:
        return 'gradient-card text-card-foreground shadow-card';
    }
  };

  return (
    <Card className={cn(
      'p-6 transition-smooth hover:scale-105',
      getVariantClasses(),
      className
    )}>
      <div className="space-y-2">
        <p className="text-sm font-medium opacity-80">{title}</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs',
              trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {getTrendIcon()}
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs opacity-70">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}