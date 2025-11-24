'use client';

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SpeedGaugeProps {
  value: number;
  status: 'idle' | 'pinging' | 'downloading' | 'uploading' | 'completed';
  max?: number;
}

export function SpeedGauge({ value, status, max = 100 }: SpeedGaugeProps) {
  const [mounted, setMounted] = useState(false);
  
  // Smoothed value state for animation
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation loop to smoothly interpolate displayValue towards target value
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      setDisplayValue(prev => {
        const diff = value - prev;
        // If difference is small enough, snap to target
        if (Math.abs(diff) < 0.1) return value;
        
        // Easing factor: moves 10% of the remaining distance per frame
        // Adjust 0.1 to make it faster or slower (0.05 = slower, 0.2 = faster)
        return prev + (diff * 0.15);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [value]); // Re-run (or rather continue loop) when target value changes

  // Dimensions
  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 140; // Radius for the arc
  const strokeWidth = 24;

  // Helper to calculate coordinates
  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180.0;
    return {
      x: cx + (r * Math.cos(angleRad)),
      y: cy + (r * Math.sin(angleRad))
    };
  };

  // Custom Scale Configuration
  // We map specific values to specific percentages of the total arc (0 to 1)
  // Total arc is 260 degrees.
  const SCALE_POINTS = [
    { value: 0, pos: 0 },
    { value: 25, pos: 0.125 },
    { value: 50, pos: 0.25 },
    { value: 100, pos: 0.4 },
    { value: 250, pos: 0.6 },
    { value: 500, pos: 0.75 },
    { value: 750, pos: 0.875 },
    { value: 1000, pos: 1.0 },
  ];

  const getNormalizedScale = (val: number) => {
    if (val <= 0) return 0;
    if (val >= 1000) return 1;

    // Find which segment the value belongs to
    const nextIndex = SCALE_POINTS.findIndex(p => p.value >= val);
    const prevIndex = Math.max(0, nextIndex - 1);
    
    const prev = SCALE_POINTS[prevIndex];
    const next = SCALE_POINTS[nextIndex];

    if (!prev || !next) return 0;

    // Linear interpolation within the segment
    const segmentProgress = (val - prev.value) / (next.value - prev.value);
    return prev.pos + (segmentProgress * (next.pos - prev.pos));
  };

  // Calculate angles
  const normalizedValue = getNormalizedScale(displayValue);
  
  // 260 degree gauge (leaving bottom open)
  const startAngle = -220;
  const endAngle = 40;
  const angleRange = endAngle - startAngle;
  const currentAngle = startAngle + (normalizedValue * angleRange);

  // Return null or a placeholder on server to avoid mismatch
  if (!mounted) {
      return (
        <div className="relative flex flex-col items-center justify-center w-full max-w-lg mx-auto my-4">
           <div className="relative w-full aspect-square max-h-[400px] flex items-center justify-center">
               <div className="w-full h-full rounded-full border-8 border-slate-900/50 animate-pulse" />
           </div>
        </div>
      );
  }

  // Generate ticks based on Custom Scale Points
  const ticksElements = SCALE_POINTS.map((point, i) => {
    const tickAngle = startAngle + (point.pos * angleRange);
    // labelPos radius adjusted to move labels closer to the arc (further out from center)
    const labelPos = polarToCartesian(cx, cy, radius - 35, tickAngle);

    return (
      <g key={i}>
        {/* Tick Lines Removed */}
        <text 
          x={labelPos.x} 
          y={labelPos.y} 
          fill={point.pos <= normalizedValue ? "#fff" : "#64748b"}
          fontSize="12"
          fontWeight="600"
          textAnchor="middle"
          alignmentBaseline="middle"
          className="transition-colors duration-100"
        >
          {point.value}
        </text>
      </g>
    );
  });

  // SVG Arc Path Generator
  const makeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-lg mx-auto my-4">
       <div className="relative w-full aspect-square max-h-[400px]">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
             <defs>
               <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#06b6d4" />
                 <stop offset="100%" stopColor="#8b5cf6" />
               </linearGradient>
               <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                 <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                 <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                 </feMerge>
               </filter>
             </defs>

             {/* Ticks Ring */}
             <g>{ticksElements}</g>

             {/* Background Arc */}
             <path 
               d={makeArc(startAngle, endAngle)} 
               fill="none" 
               stroke="#1e293b" 
               strokeWidth={strokeWidth} 
               strokeLinecap="round" 
             />

             {/* Progress Arc */}
             <path 
               d={makeArc(startAngle, currentAngle)} 
               fill="none" 
               stroke="url(#progressGradient)" 
               strokeWidth={strokeWidth} 
               strokeLinecap="round" 
               filter="url(#glow)"
               // Removed CSS transition since we handle animation via JS interpolation now
             />

             {/* Needle Group */}
             {/* Using JS interpolation angle directly, no CSS transition needed for smoothness */}
             <g transform={`rotate(${currentAngle}, ${cx}, ${cy})`}>
                <path
                  d={`M ${cx} ${cy - 8} L ${cx + radius - 20} ${cy} L ${cx} ${cy + 8}`}
                  fill="url(#progressGradient)"
                  filter="url(#glow)"
                />
                 
                 {/* Center Cap */}
                 <circle cx={cx} cy={cy} r="12" fill="#1e293b" stroke="#22d3ee" strokeWidth="3" />
                 <circle cx={cx} cy={cy} r="6" fill="#22d3ee" />
             </g>

             {/* Center Text Group */}
             <g transform={`translate(${cx}, ${cy + 80})`}>
                {/* Speed Value */}
                <text 
                  y="0" 
                  textAnchor="middle" 
                  fill="white" 
                  className="font-mono" 
                  style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.05em' }}
                >
                  {displayValue.toFixed(0)}
                </text>
                
                {/* Status Label */}
                <text 
                  y="30" 
                  textAnchor="middle" 
                  fill="#22d3ee" 
                  className="text-xs font-bold tracking-[0.2em] uppercase"
                >
                  {status === 'idle' ? 'MBPS' : status === 'completed' ? 'SELESAI' : status}
                </text>
             </g>

             {/* Max Value Label removed as per request */}
          </svg>
       </div>
    </div>
  );
}

export default SpeedGauge;
