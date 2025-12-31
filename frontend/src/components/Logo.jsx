import React from 'react';

const Logo = ({ className = "", size = "default" }) => {
  const sizes = {
    small: { container: "w-8 h-8", text: "text-xs" },
    default: { container: "w-9 h-9", text: "text-sm" },
    large: { container: "w-12 h-12", text: "text-base" },
  };

  const { container } = sizes[size] || sizes.default;

  return (
    <div className={`${container} rounded-xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-lime p-0.5 ${className}`}>
      <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center relative overflow-hidden">
        {/* Neural Network Pattern */}
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Connection Lines */}
          <g className="opacity-40">
            <line x1="12" y1="8" x2="20" y2="20" stroke="url(#gradient1)" strokeWidth="1" />
            <line x1="28" y1="8" x2="20" y2="20" stroke="url(#gradient1)" strokeWidth="1" />
            <line x1="8" y1="20" x2="20" y2="20" stroke="url(#gradient1)" strokeWidth="1" />
            <line x1="32" y1="20" x2="20" y2="20" stroke="url(#gradient1)" strokeWidth="1" />
            <line x1="12" y1="32" x2="20" y2="20" stroke="url(#gradient1)" strokeWidth="1" />
            <line x1="28" y1="32" x2="20" y2="20" stroke="url(#gradient1)" strokeWidth="1" />
          </g>

          {/* Nodes */}
          <g>
            {/* Top nodes */}
            <circle cx="12" cy="8" r="2.5" fill="url(#gradient2)" className="animate-pulse" style={{ animationDelay: '0s', animationDuration: '2s' }} />
            <circle cx="28" cy="8" r="2.5" fill="url(#gradient2)" className="animate-pulse" style={{ animationDelay: '0.3s', animationDuration: '2s' }} />
            
            {/* Middle nodes */}
            <circle cx="8" cy="20" r="2.5" fill="url(#gradient3)" className="animate-pulse" style={{ animationDelay: '0.6s', animationDuration: '2s' }} />
            <circle cx="32" cy="20" r="2.5" fill="url(#gradient3)" className="animate-pulse" style={{ animationDelay: '0.9s', animationDuration: '2s' }} />
            
            {/* Bottom nodes */}
            <circle cx="12" cy="32" r="2.5" fill="url(#gradient4)" className="animate-pulse" style={{ animationDelay: '1.2s', animationDuration: '2s' }} />
            <circle cx="28" cy="32" r="2.5" fill="url(#gradient4)" className="animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '2s' }} />
            
            {/* Center node (largest) */}
            <circle cx="20" cy="20" r="4" fill="url(#gradient5)" className="animate-pulse" style={{ animationDelay: '0s', animationDuration: '2s' }} />
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--neon-cyan))" />
              <stop offset="100%" stopColor="hsl(var(--neon-purple))" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--neon-cyan))" />
              <stop offset="100%" stopColor="hsl(var(--neon-lime))" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--neon-purple))" />
              <stop offset="100%" stopColor="hsl(var(--neon-cyan))" />
            </linearGradient>
            <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--neon-lime))" />
              <stop offset="100%" stopColor="hsl(var(--neon-purple))" />
            </linearGradient>
            <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--neon-cyan))" />
              <stop offset="50%" stopColor="hsl(var(--neon-purple))" />
              <stop offset="100%" stopColor="hsl(var(--neon-lime))" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default Logo;

