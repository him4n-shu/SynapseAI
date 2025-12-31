import { memo } from 'react';

const statusColors = {
  completed: "bg-neon-lime",
  pending: "bg-neon-yellow",
  "in-progress": "bg-neon-cyan",
};

const ActivityItem = memo(({ title, subtitle, time, status = "completed", score }) => {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-card-hover transition-colors group">
      <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="text-right">
        {score !== undefined && (
          <span className="text-sm font-semibold text-neon-lime">{score}%</span>
        )}
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
});

ActivityItem.displayName = 'ActivityItem';

export default ActivityItem;

