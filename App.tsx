
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Unit, SensorData, DeviceState, AlarmThresholds, AIAnalysis } from './types';
import { CapnoParser, generateMockPacket } from './services/capnoParser';
import { analyzeRespiratoryStatus } from './services/geminiService';
import Waveform from './components/Waveform';
import StatsCard from './components/StatsCard';
import Alarms from './components/Alarms';

const DEFAULT_THRESHOLDS: AlarmThresholds = {
  etCO2High: 45,
  etCO2Low: 30,
  rrHigh: 25,
  rrLow: 8,
  fiCO2High: 5
};

const App: React.FC = () => {
  // Connection & Device State
  const [device, setDevice] = useState<DeviceState>({
    isConnected: false,
    isWarmup: false,
    isZeroing: false,
    battery: 100,
    sn: 'SN-CAPT5-8821'
  });

  // Clinical Data State
  const [currentData, setCurrentData] = useState<SensorData>({
    etCO2: 0,
    fiCO2: 0,
    rr: 0,
    waveform: [],
    status: 'Ready',
    timestamp: Date.now()
  });

  const [unit, setUnit] = useState<Unit>(Unit.mmHg);
  const [thresholds] = useState<AlarmThresholds>(DEFAULT_THRESHOLDS);
  const [aiInsight, setAiInsight] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demoMode, setDemoMode] = useState(true);

  // Buffer for waveform animation
  const waveformBuffer = useRef<number[]>([]);
  const syncCounter = useRef(0);

  // Real-time processing loop (100Hz)
  useEffect(() => {
    if (!device.isConnected && !demoMode) return;

    const interval = setInterval(() => {
      // Logic for demo or serial stream
      const packet = generateMockPacket(syncCounter.current % 128);
      syncCounter.current++;

      // In real implementation, this would be triggered by serial/BT events
      const wb1 = packet[3];
      const wb2 = packet[4];
      const co2Value = CapnoParser.decodeCO2Value(wb1, wb2);

      waveformBuffer.current.push(co2Value);
      if (waveformBuffer.current.length > 500) {
        waveformBuffer.current.shift();
      }

      // Update numeric stats every 1 second or based on DPI
      if (syncCounter.current % 100 === 0) {
        setCurrentData(prev => ({
          ...prev,
          etCO2: Math.max(...waveformBuffer.current.slice(-100)),
          fiCO2: Math.min(...waveformBuffer.current.slice(-100)),
          rr: 12 + Math.floor(Math.random() * 2),
          timestamp: Date.now()
        }));
      }
    }, 10); // 100Hz

    return () => clearInterval(interval);
  }, [device.isConnected, demoMode]);

  const handleConnect = async () => {
    // Simulate connection logic
    setDevice(prev => ({ ...prev, isConnected: true }));
    setDemoMode(false);
  };

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeRespiratoryStatus(currentData.etCO2, currentData.rr, currentData.fiCO2, unit);
    setAiInsight(result);
    setIsAnalyzing(false);
  };

  const isAlarmActive = 
    currentData.etCO2 > thresholds.etCO2High || 
    currentData.etCO2 < thresholds.etCO2Low ||
    currentData.rr > thresholds.rrHigh ||
    currentData.rr < thresholds.rrLow;

  return (
    <div className={`h-screen flex flex-col bg-slate-950 text-slate-100 ${isAlarmActive ? 'alarm-critical' : ''}`}>
      {/* Header Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-slate-950 font-bold">C</div>
          <h1 className="text-xl font-bold tracking-tight">ShowCapno <span className="text-yellow-500">Pro</span></h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
             <i className="fa-solid fa-microchip"></i> {device.sn}
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${device.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm font-semibold">{device.isConnected ? 'CONNECTED' : 'OFFLINE'}</span>
          </div>
          <button 
            onClick={() => setDevice(p => ({ ...p, isConnected: !p.isConnected }))}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${device.isConnected ? 'bg-slate-800 hover:bg-slate-700' : 'bg-yellow-500 text-slate-950 hover:bg-yellow-400'}`}
          >
            {device.isConnected ? 'DISCONNECT' : 'CONNECT BLE'}
          </button>
        </div>
      </header>

      {/* Main Content Area: Left Waveform (75%), Right Values (25%) */}
      <main className="flex-1 flex overflow-hidden">
        {/* Waveform View */}
        <section className="flex-1 relative border-r border-slate-800/50 p-4">
          <div className="absolute top-6 left-8 z-10 flex gap-4">
            <div className="bg-slate-900/80 px-3 py-1 rounded border border-yellow-500/30">
              <span className="text-xs text-yellow-500 font-bold uppercase">CO2 Waveform ({unit})</span>
            </div>
          </div>
          
          <Waveform data={waveformBuffer.current} unit={unit} />
          
          {/* Waveform Controls */}
          <div className="absolute bottom-6 left-8 flex gap-3">
             {Object.values(Unit).map(u => (
               <button 
                key={u}
                onClick={() => setUnit(u)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${unit === u ? 'bg-yellow-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
               >
                 {u}
               </button>
             ))}
          </div>
        </section>

        {/* Numeric Dashboard */}
        <aside className="w-80 bg-slate-900/30 flex flex-col p-4 gap-4 overflow-y-auto">
          <StatsCard 
            label="EtCO2" 
            value={currentData.etCO2} 
            unit={unit} 
            color="text-yellow-400" 
            high={thresholds.etCO2High} 
            low={thresholds.etCO2Low} 
          />
          <StatsCard 
            label="Respiration Rate" 
            value={currentData.rr} 
            unit="bpm" 
            color="text-blue-400" 
            high={thresholds.rrHigh} 
            low={thresholds.rrLow} 
          />
          <StatsCard 
            label="FiCO2" 
            value={currentData.fiCO2} 
            unit={unit} 
            color="text-orange-400" 
            high={thresholds.fiCO2High} 
            low={0} 
          />

          {/* AI Clinical Insight Section */}
          <div className="mt-4 flex-1">
            <button 
              onClick={handleAIAnalyze}
              disabled={isAnalyzing}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              <i className={`fa-solid ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
              {isAnalyzing ? 'ANALYZING...' : 'GET AI INSIGHT'}
            </button>

            {aiInsight && (
              <div className={`mt-4 p-4 rounded-xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                aiInsight.severity === 'critical' ? 'bg-red-900/20 border-red-500/50' : 
                aiInsight.severity === 'caution' ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-indigo-900/20 border-indigo-500/50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                   <i className="fa-solid fa-clipboard-check text-indigo-400"></i>
                   <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Clinical Assessment</span>
                </div>
                <p className="text-sm leading-relaxed mb-4 text-slate-200">{aiInsight.assessment}</p>
                <div className="space-y-2">
                  {aiInsight.suggestions.map((s, i) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-400">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Footer / Alarms Status */}
      <footer className="h-12 bg-slate-900 border-t border-slate-800 flex items-center px-6 justify-between text-xs font-medium text-slate-500">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-clock"></i>
            <span>Monitoring Active: 02:45:12</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-database"></i>
            <span>Local DB Storage: OK</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Alarms active={isAlarmActive} />
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-battery-three-quarters text-green-500"></i>
            <span>92%</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
