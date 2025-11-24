import React from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface StartButtonProps {
  onClick: () => void;
  visible: boolean;
  label?: string;
}

export function StartButton({ onClick, visible, label = "MULAI" }: StartButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={!visible}
      className={`absolute inset-0 m-auto z-20 w-48 h-48 sm:w-64 sm:h-64 rounded-full flex flex-col items-center justify-center transition-all duration-500 ease-out transform hover:scale-105 active:scale-95 group cursor-pointer ${
        visible 
          ? 'opacity-100 scale-100 pointer-events-auto' 
          : 'opacity-0 scale-150 pointer-events-none'
      }`}
    >
      {/* Outer Glow Ring */}
      <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30 group-hover:border-cyan-400/50 transition-colors animate-[spin_10s_linear_infinite]" />
      
      {/* Main Circle Gradient */}
      <div className="absolute inset-2 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shadow-2xl shadow-cyan-500/10 group-hover:shadow-cyan-500/20 transition-shadow">
         {/* Inner Gradient Background */}
         <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-90" />
         
         {/* Text Content */}
         <div className="relative z-10 flex flex-col items-center gap-2">
            <span className="text-2xl sm:text-4xl font-bold text-white tracking-widest font-mono group-hover:text-cyan-400 transition-colors">
              {label}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-[0.3em]">
              TEST SPEED
            </span>
         </div>
      </div>
      
      {/* Pulse Effect behind */}
      <div className="absolute -inset-4 rounded-full border border-cyan-500/20 animate-ping -z-10" />
    </button>
  );
}
