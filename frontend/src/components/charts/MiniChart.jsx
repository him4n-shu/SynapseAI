const colorClasses = {
  lime: "stroke-neon-lime",
  purple: "stroke-neon-purple",
  cyan: "stroke-neon-cyan",
  yellow: "stroke-neon-yellow",
};

const fillClasses = {
  lime: "fill-neon-lime/20",
  purple: "fill-neon-purple/20",
  cyan: "fill-neon-cyan/20",
  yellow: "fill-neon-yellow/20",
};

const MiniChart = ({ data, color = "lime", height = 60 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 200;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
    >
      <polygon points={areaPoints} className={fillClasses[color]} />
      <polyline
        points={points}
        fill="none"
        className={colorClasses[color]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MiniChart;

