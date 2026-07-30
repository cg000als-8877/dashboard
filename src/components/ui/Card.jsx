import { cn } from "@/components/layout/Sidebar";

export function Card({ children, className, hover = false, ...props }) {
  return (
    <div className={cn(
      "relative bg-[rgba(20,25,35,0.3)] backdrop-blur-2xl border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 md:p-6 transition-all duration-500 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)]",
      hover && "hover:bg-[rgba(25,30,45,0.4)] hover:-translate-y-1 hover:border-[rgba(255,255,255,0.1)] hover:shadow-[0_12px_40px_rgba(79,140,255,0.15)] group",
      className
    )}
    {...props}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)] opacity-0 group-hover:opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-opacity duration-500 pointer-events-none"></div>
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
        <h3 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest leading-tight">{title}</h3>
      </div>
      <div className="min-w-0">
        <p className={cn("font-extrabold tracking-tight whitespace-nowrap drop-shadow-md text-xl sm:text-2xl md:text-3xl lg:text-4xl", colors[color])}>
          {value}
        </p>
        {(subtitle || trendValue) && (
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span className={cn(
                "text-xs font-semibold px-2 py-1 rounded-full",
                trend === 'up' ? "bg-[rgba(46,204,113,0.1)] text-[var(--color-success)]" : "bg-[rgba(255,90,95,0.1)] text-[var(--color-danger)]"
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
