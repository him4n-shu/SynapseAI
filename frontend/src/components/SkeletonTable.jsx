const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="neon-card p-6 animate-pulse">
      {/* Table Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-border/50 mb-4">
        <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
        <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
        <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
        <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 py-3 border-b border-border/30">
          <div className="h-3 bg-gray-700/50 rounded w-1/4"></div>
          <div className="h-3 bg-gray-700/50 rounded w-1/4"></div>
          <div className="h-3 bg-gray-700/50 rounded w-1/4"></div>
          <div className="h-3 bg-gray-700/50 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonTable;

