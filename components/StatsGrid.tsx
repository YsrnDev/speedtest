import React from 'react';
import { Activity, ArrowDown, ArrowUp, Zap } from 'lucide-react';

interface StatsGridProps {
  ping: number | null;
  jitter: number | null;
  download: number | null;
  upload: number | null;
}

export function StatsGrid({ ping, jitter, download, upload }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto mt-12">
      <StatCard
        label="Ping"
        value={ping?.toFixed(0) || '--'}
        unit="ms"
        icon={<Zap className="w-5 h-5 text-amber-400" />}
        color="border-amber-500/20 bg-amber-500/5"
      />
      <StatCard
        label="Jitter"
        value={jitter?.toFixed(0) || '--'}
        unit="ms"
        icon={<Activity className="w-5 h-5 text-purple-400" />}
        color="border-purple-500/20 bg-purple-500/5"
      />
      <StatCard
        label="Download"
        value={download?.toFixed(1) || '--'}
        unit="Mbps"
        icon={<ArrowDown className="w-5 h-5 text-cyan-400" />}
        color="border-cyan-500/20 bg-cyan-500/5"
      />
      <StatCard
        label="Upload"
        value={upload?.toFixed(1) || '--'}
        unit="Mbps"
        icon={<ArrowUp className="w-5 h-5 text-indigo-400" />}
        color="border-indigo-500/20 bg-indigo-500/5"
      />
    </div>
  );
}

function StatCard({ label, value, unit, icon, color }: { label: string; value: string; unit: string; icon: React.ReactNode; color: string }) {
  return (
    <div className={`flex flex-col p-4 rounded-2xl border ${color} backdrop-blur-sm`}>
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-100">{value}</span>
        <span className="text-xs text-slate-500 font-medium">{unit}</span>
      </div>
    </div>
  );
}
