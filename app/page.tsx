"use client";

import { useState, useEffect } from 'react';
import SpeedGauge from '@/components/SpeedGauge';
import { ControlPanel } from '@/components/ControlPanel';
import { StatsGrid } from '@/components/StatsGrid';
import { StartButton } from '@/components/StartButton';
import { useSpeedTest } from '@/hooks/useSpeedTest';
import { Zap } from 'lucide-react';

interface Server {
  id: number;
  name: string;
  sponsor: string;
  country: string;
  url: string;
}

export default function Home() {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  
  const { 
    status, 
    currentSpeed, 
    progress, 
    results, 
    startTest 
  } = useSpeedTest();

  useEffect(() => {
    fetch('/api/servers')
      .then(res => res.json())
      .then(data => {
        setServers(data);
        if (data.length > 0) setSelectedServer(data[0]);
      });
  }, []);

  const handleStart = () => {
    if (selectedServer) {
      startTest(selectedServer);
    }
  };

  // Determine gauge value
  const gaugeValue = status === 'uploading' 
    ? currentSpeed 
    : (status === 'downloading' ? currentSpeed : (results.download || 0));

  // Dynamic Scale
  const [maxScale, setMaxScale] = useState(100);
  
  useEffect(() => {
    if (gaugeValue > maxScale) {
      // Jump to next tier: 100 -> 500 -> 1000 -> 2000
      if (gaugeValue > 1000) setMaxScale(2000);
      else if (gaugeValue > 500) setMaxScale(1000);
      else if (gaugeValue > 100) setMaxScale(500);
    }
  }, [gaugeValue, maxScale]);

  // Calculate visual progress for each phase (0-100%)
  let visualProgress = 0;
  if (status === 'downloading') {
     // Progress 10-50 maps to 0-100
     visualProgress = Math.max(0, (progress - 10) * 2.5); 
  } else if (status === 'uploading') {
     // Progress 50-100 maps to 0-100
     visualProgress = Math.max(0, (progress - 50) * 2);
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-950 text-slate-50 selection:bg-cyan-500/30">
      {/* Background Grid Pattern Removed */}
      
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl px-4 py-8 sm:py-12 gap-6 sm:gap-8 relative z-10">
        
        {/* Title */}
        <div className="flex flex-col items-center gap-2 mb-2 sm:mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 sm:p-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transform -skew-x-12">
               <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white transform skew-x-12 fill-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Speed <span className="text-cyan-400">Test</span>
            </h1>
          </div>
        </div>

        {/* Gauge Section with Overlay Start Button */}
        <div className="relative mt-4 sm:mt-8 w-full flex flex-col items-center">
           
           <div className="relative w-full max-w-[300px] sm:max-w-lg aspect-square flex items-center justify-center">
              {/* Gauge Container - Hidden/Shrink when IDLE */}
              <div className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                 status === 'idle' || status === 'completed' 
                   ? 'opacity-0 scale-50 blur-sm pointer-events-none' 
                   : 'opacity-100 scale-100 blur-0'
              }`}>
                 <SpeedGauge 
                   value={gaugeValue} 
                   status={status} 
                   max={maxScale}
                 />
              </div>

              {/* Start Button Overlay - Visible when IDLE/COMPLETED */}
              <StartButton 
                 visible={status === 'idle' || status === 'completed'} 
                 onClick={handleStart}
                 label={status === 'completed' ? 'ULANGI' : 'MULAI'}
              />
           </div>

           {/* Progress Bar (Loading) - Only for Download/Upload */}
           <div className={`w-full max-w-[280px] sm:max-w-md h-1.5 bg-slate-900 rounded-full overflow-hidden transition-opacity duration-500 -mt-8 sm:-mt-12 mb-8 ${
              (status === 'downloading' || status === 'uploading') ? 'opacity-100' : 'opacity-0'
           }`}>
              <div 
                className={`h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200 ease-linear shadow-[0_0_10px_rgba(6,182,212,0.5)] ${status === 'uploading' ? 'ml-auto' : ''}`}
                style={{ width: `${visualProgress}%` }} 
              />
           </div>
        </div>

        {/* Controls - Moved above StatsGrid */}
        <ControlPanel 
          servers={servers}
          selectedServer={selectedServer}
          onSelect={setSelectedServer}
          isTesting={status !== 'idle' && status !== 'completed'}
        />

        {/* Results Grid - Moved to bottom */}
        <StatsGrid 
          ping={results.ping} 
          jitter={results.jitter} 
          download={results.download} 
          upload={results.upload} 
        />

      </div>
      
      <footer className="w-full p-6 text-center text-slate-600 text-sm border-t border-slate-900/50 backdrop-blur-sm relative z-10">
        <p>&copy; 2025 SpeedTest. Made with ❤️ by YSRNDEV.</p>
      </footer>
    </main>
  );
}
