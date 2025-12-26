
import React from 'react';

interface StatsCardProps {
  label: string;
  value: number;
  unit: string;
  color: string;
  high: number;
  low: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, unit, color, high, low }) => {
  const isAlarm = value > high || (low > 0 && value < low);

  return (
    <div className={`p-5 rounded-2xl transition-all duration-300 border ${
      isAlarm ? 'bg-red-600/20 border-red-500 shadow-lg shadow-red-500/20 animate-pulse' : 'bg-slate-800/40 border-slate-700/50'
    }`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        {isAlarm && <i className="fa-solid fa-triangle-exclamation text-red-500 text-xs"></i>}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className={`text-5xl font-bold digital-font ${isAlarm ? 'text-red-500' : color}`}>
          {value.toFixed(label === 'Respiration Rate' ? 0 : 1)}
        </span>
        <span className="text-sm font-semibold text-slate-500">{unit}</span>
      </div>

      <div className="mt-3 flex gap-3 text-[10px] font-bold">
        <div className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-700">
          LO: {low}
        </div>
        <div className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-700">
          HI: {high}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
