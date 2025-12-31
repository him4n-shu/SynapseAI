import { memo } from 'react';

const colorClasses = {
  lime: "text-neon-lime neon-glow-lime",
  purple: "text-neon-purple neon-glow-purple",
  cyan: "text-neon-cyan neon-glow-cyan",
  yellow: "text-neon-yellow neon-glow-yellow",
  orange: "text-neon-orange",
};

const bgClasses = {
  lime: "bg-neon-lime/10",
  purple: "bg-neon-purple/10",
  cyan: "bg-neon-cyan/10",
  yellow: "bg-neon-yellow/10",
  orange: "bg-neon-orange/10",
};

const StatCard = memo(({ title, value, icon: Icon, trend, color = "lime" }) => {
  return (
    <div className="neon-card p-5 group hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg ${bgClasses[color]} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${colorClasses[color].split(" ")[0]}`} />
          </div>
        )}
      </div>
      <div className={`stat-number ${colorClasses[color]}`}>{value}</div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span className={trend.isPositive ? "text-neon-lime" : "text-destructive"}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">vs last week</span>
        </div>
      )}
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;

