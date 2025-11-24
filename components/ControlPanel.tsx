import React from 'react';
import { Play, MapPin, RotateCcw } from 'lucide-react';

interface Server {
  id: number;
  name: string;
  sponsor: string;
  country: string;
  url: string;
}

interface ControlPanelProps {
  servers: Server[];
  selectedServer: Server | null;
  onSelect: (server: Server) => void;
  isTesting: boolean;
}

export function ControlPanel({
  servers,
  selectedServer,
  onSelect,
  isTesting,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto mt-8 z-20 relative">
      {/* Server Selector */}
      <div className="w-full">
        <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2 block ml-1 text-center">
          Server Tujuan
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-cyan-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <select
            value={selectedServer?.id || ''}
            onChange={(e) => {
              const server = servers.find((s) => s.id === Number(e.target.value));
              if (server) onSelect(server);
            }}
            disabled={isTesting}
            className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none transition-all font-medium text-center text-base"
          >
            {servers.map((server) => (
              <option key={server.id} value={server.id}>
                {server.sponsor} - {server.name}, {server.country}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
