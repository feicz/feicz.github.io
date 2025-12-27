
import React, { useState } from 'react';
import { AlarmThresholds } from '../types.ts';

interface SettingsModalProps {
  thresholds: AlarmThresholds;
  onSave: (thresholds: AlarmThresholds) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ thresholds, onSave, onClose }) => {
  const [localThresholds, setLocalThresholds] = useState<AlarmThresholds>({ ...thresholds });

  const handleChange = (key: keyof AlarmThresholds, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setLocalThresholds(prev => ({ ...prev, [key]: num }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-bell text-yellow-500"></i>
            <h2 className="font-bold text-lg">Alarm Thresholds</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* EtCO2 Group */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-yellow-500">EtCO2 Limits (mmHg)</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">High</span>
                <input 
                  type="number" 
                  value={localThresholds.etCO2High}
                  onChange={(e) => handleChange('etCO2High', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Low</span>
                <input 
                  type="number" 
                  value={localThresholds.etCO2Low}
                  onChange={(e) => handleChange('etCO2Low', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* RR Group */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-blue-500">Resp Rate Limits (bpm)</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">High</span>
                <input 
                  type="number" 
                  value={localThresholds.rrHigh}
                  onChange={(e) => handleChange('rrHigh', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Low</span>
                <input 
                  type="number" 
                  value={localThresholds.rrLow}
                  onChange={(e) => handleChange('rrLow', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* FiCO2 Group */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-orange-500">FiCO2 Limit (mmHg)</label>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">High</span>
              <input 
                type="number" 
                value={localThresholds.fiCO2High}
                onChange={(e) => handleChange('fiCO2High', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(localThresholds)}
            className="px-6 py-2 bg-yellow-500 text-slate-950 text-sm font-bold rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/10"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
