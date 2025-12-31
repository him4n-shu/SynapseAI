const SkeletonCard = ({ className = "" }) => {
  return (
    <div className={`neon-card p-6 animate-pulse ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>
          <div className="h-8 w-8 bg-gray-700/50 rounded"></div>
        </div>
        
        {/* Main Content */}
        <div className="h-10 bg-gray-700/50 rounded w-1/2"></div>
        
        {/* Footer */}
        <div className="h-3 bg-gray-700/50 rounded w-2/3"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;

