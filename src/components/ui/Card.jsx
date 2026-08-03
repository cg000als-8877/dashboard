import { cn } from "@/components/layout/Sidebar";

export function Card({ children, className, hover = false, ...props }) {
  return (
    <div className={cn(
      "relative bg-[var(--color-bg-card)]/90 border border-[var(--color-border)] rounded-2xl p-4 md:p-6 transition-all duration-500 overflow-hidden shadow-sm",
      hover && "hover:bg-[var(--color-surface-hover)] hover:-translate-y-1 hover:border-[var(--color-border)] hover:shadow-[0_12px_40px_rgba(79,140,255,0.15)] group",
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

export function MetricCard({ title, value, subtitle, trend, trendValue, color = "default" }) {
  const colors = {
    default: "text-[var(--color-text-main)]",
    primary: "text-[var(--color-primary)]",
    success: "text-[var(--color-success)]",
    danger: "text-[var(--color-danger)]",
    warning: "text-[var(--color-warning)]"
  };

  return (
    <Card hover className="flex flex-col p-3 md:p-6 animate-[fade-up_0.5s_ease-out_both]">
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <h3 className="text-[10px] md:text-xs font-normal md:font-medium text-[var(--color-text-secondary)] uppercase tracking-widest leading-tight">{title}</h3>
      </div>
      <div className="min-w-0">
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
    </Card>
  );
}
