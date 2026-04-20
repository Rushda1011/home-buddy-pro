import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  action?: React.ReactNode
  className?: string
}

export function StatCard({ title, value, icon, trend, action, className }: StatCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-card p-6 shadow-elegant transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {action && <div className="ml-auto">{action}</div>}
          </div>
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{trend.label || `${Math.abs(trend.value)}% from last month`}</span>
            </div>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/5" />
    </div>
  )
}
