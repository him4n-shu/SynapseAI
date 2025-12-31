const colorClasses = {
  lime: "bg-neon-lime",
  purple: "bg-neon-purple",
  cyan: "bg-neon-cyan",
  yellow: "bg-neon-yellow",
};

const ProgressBar = ({
  label,
  value,
  maxValue = 100,
  color = "lime",
  showValue = true,
}) => {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {showValue && (
          <span className="text-sm font-medium text-foreground">{value}%</span>
        )}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

