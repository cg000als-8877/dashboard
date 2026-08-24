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
      <Card hover className="flex flex-col p-3 md:p-6 animate-[fade-up_0.5s_ease-out_both] flex-1">
        <div className="flex justify-between items-start mb-1 md:mb-2">
          <h3 className="text-[10px] md:text-xs font-normal md:font-medium text-[var(--color-text-secondary)] uppercase tracking-widest leading-tight">{title}</h3>
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-between">
          <div>
            <p className={cn("font-medium md:font-semibold tracking-tight whitespace-nowrap text-xl sm:text-2xl md:text-3xl lg:text-4xl", colors[color])}>
              {value}
            </p>
            {(subtitle || trendValue) && (
              <div className="flex items-center gap-2 mt-2">
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

          {/* Desktop comparison note (Inside Tile - Standard size, Bold, No shapes) */}
          {comparison && (
            <div className="hidden md:flex items-center gap-1.5 mt-3 pt-2 border-t border-[var(--color-border)]/40 text-[12px] leading-normal flex-wrap">
              <span className={cn(
                "font-bold inline-flex items-center gap-1",
                comparison.isPositive ? "text-emerald-400" : "text-rose-400"
              )}>
                {comparison.trend === 'up' && '▲ '}
                {comparison.trend === 'down' && '▼ '}
                {comparison.trend === 'neutral' && '• '}
                {comparison.highlight}
              </span>
              <span className="text-[var(--color-text-secondary)] font-semibold">
                {comparison.label}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Mobile comparison note (Outside Tile with 1px gap - One continuous line, 10px font, Italic, Regular weight, No shapes) */}
      {comparison && (
        <div className="md:hidden mt-[1px] px-0.5 py-0.5 flex items-center gap-1 text-[10px] leading-tight font-normal italic tracking-tight flex-nowrap whitespace-nowrap overflow-hidden">
          <span className={cn(
            "font-normal italic tracking-tight inline-flex items-center gap-0.5 shrink-0",
            comparison.isPositive ? "text-emerald-400" : "text-rose-400"
          )}>
            {comparison.trend === 'up' && '▲ '}
            {comparison.trend === 'down' && '▼ '}
            {comparison.trend === 'neutral' && '• '}
            {comparison.highlight}
          </span>
          <span className="text-[var(--color-text-muted)] font-normal italic truncate">
            {comparison.label}
          </span>
        </div>
      )}
    </div>
  );
}
