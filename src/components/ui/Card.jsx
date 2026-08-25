import { cn } from "@/components/layout/Sidebar";

export function Card({ children, className, hover = false, ...props }) {
  return (
    <div className={cn(
      "relative bg-[var(--color-bg-card)]/75 backdrop-blur-md border border-[var(--color-border)]/60 rounded-2xl p-4 md:p-6 transition-all duration-500 overflow-hidden shadow-sm",
      hover && "hover:bg-[var(--color-surface-hover)]/90 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/40 hover:shadow-[0_12px_40px_var(--color-primary-glow)] group",
      className
    )}
    {...props}
    >

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  color = "default",
  comparison = null 
}) {
  const colors = {
    default: "text-[var(--color-text-main)]",
    primary: "text-[var(--color-primary)]",
    success: "text-[var(--color-success)]",
    danger: "text-[var(--color-danger)]",
    warning: "text-[var(--color-warning)]"
  };

  return (
    <div className="flex flex-col w-full group/metric">
      <Card hover data-color={color} data-metric-title={title} className="flex flex-col p-3 md:p-6 animate-[fade-up_0.5s_ease-out_both] flex-1">
        <div className="flex justify-between items-start mb-1 md:mb-2">
          <h3 className="text-[10px] md:text-xs font-normal md:font-medium text-[var(--color-text-secondary)] uppercase tracking-widest leading-tight">{title}</h3>
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-start md:justify-between">
          <div>
            <p className={cn("font-medium md:font-semibold tracking-tight whitespace-nowrap text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight", colors[color])}>
              {value}
            </p>
            {(subtitle || trendValue) && (
              <div className="flex items-center gap-2 mt-1 md:mt-2">
                {trend && (
                  <span className={cn(
                    "text-xs font-normal px-2 py-1 rounded-full",
                    trend === 'up' ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" : "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                  )}>
                    {trend === 'up' ? '↑' : '↓'} {trendValue}
                  </span>
                )}
                {subtitle && <span className="text-sm text-[var(--color-text-muted)]">{subtitle}</span>}
              </div>
            )}
          </div>

          {/* Comparison note (Inside Tile - Wraps into 2nd line on mobile so full sentence is 100% visible, single line on desktop) */}
          {comparison && (
            <div className="flex flex-wrap md:flex-nowrap items-baseline gap-x-1 gap-y-0.5 mt-1.5 md:mt-3 pt-1.5 md:pt-2 border-t border-[var(--color-border)]/40 text-[10px] sm:text-[11px] md:text-[12px] leading-tight md:leading-normal">
              <span className={cn(
                "font-bold inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap",
                comparison.isPositive ? "text-emerald-400" : "text-rose-400"
              )}>
                {comparison.trend === 'up' && '▲ '}
                {comparison.trend === 'down' && '▼ '}
                {comparison.trend === 'neutral' && '• '}
                {comparison.highlight}
              </span>
              <span className="text-[var(--color-text-secondary)] font-medium break-words">
                {comparison.label}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
