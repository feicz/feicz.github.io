import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Unit, SensorData, DeviceState, AlarmThresholds, AIAnalysis } from './types.ts';
import { CapnoParser, generateMockPacket } from './services/capnoParser.ts';
import { analyzeRespiratoryStatus } from './services/geminiService.ts';
import { serialService } from './services/serialService.ts';
import Waveform from './components/Waveform.tsx';
import StatsCard from './components/StatsCard.tsx';
import Alarms from './components/Alarms.tsx';
import SettingsModal from './components/SettingsModal.tsx';

const DEFAULT_THRESHOLDS: AlarmThresholds = {
  etCO2High: 45,
  etCO2Low: 30,
  rrHigh: 25,
  rrLow: 8,
  fiCO2High: 5
};

const App: React.FC = () => {
  // 状态初始化...
  const [device, setDevice] = useState<DeviceState>({
    isConnected: false,
    isWarmup: false,
    isZeroing: false,
    battery: 100,
    sn: 'SN-CAPT5-8821'
  });

  const [connectionType, setConnectionType] = useState<'NONE' | 'USB' | 'BLE' | 'DEMO'>('DEMO');
  const [currentData, setCurrentData] = useState<SensorData>({
    etCO2: 0,
    fiCO2: 0,
    rr: 0,
    waveform: [],
    status: 'Ready',
    timestamp: Date.now()
  });

  const [unit, setUnit] = useState<Unit>(Unit.mmHg);
  const [thresholds, setThresholds] = useState<AlarmThresholds>(DEFAULT_THRESHOLDS);
  const [aiInsight, setAiInsight] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const waveformBuffer = useRef<number[]>([]);
  const byteBuffer = useRef<number[]>([]);
  const syncCounter = useRef(0);

  const processIncomingBytes = useCallback((bytes: number[]) => {
    byteBuffer.current.push(...bytes);
    while (byteBuffer.current.length >= 6) {
      const startIdx = byteBuffer.current.indexOf(0x80);
      if (startIdx === -1) {
        byteBuffer.current = [];
        break;
      }
      if (startIdx > 0) byteBuffer.current = byteBuffer.current.slice(startIdx);
      if (byteBuffer.current.length < 6) break;
      const packet = byteBuffer.current.slice(0, 6);
      if (CapnoParser.verifyChecksum(packet)) {
        const wb1 = packet[3];
        const wb2 = packet[4];
        const co2Value = CapnoParser.decodeCO2Value(wb1, wb2);
        waveformBuffer.current.push(co2Value);
        if (waveformBuffer.current.length > 500) waveformBuffer.current.shift();
        syncCounter.current++;
        if (syncCounter.current % 100 === 0) {
          const slice = waveformBuffer.current.slice(-100);
          setCurrentData(prev => ({
            ...prev,
            etCO2: Math.max(...slice),
            fiCO2: Math.min(...slice),
            rr: 12 + Math.floor(Math.random() * 2),
            timestamp: Date.now()
          }));
        }
        byteBuffer.current = byteBuffer.current.slice(6);
      } else {
        byteBuffer.current = byteBuffer.current.slice(1);
      }
    }
  }, []);

  useEffect(() => {
    if (connectionType !== 'DEMO') return;
    const interval = setInterval(() => {
      const packet = generateMockPacket(syncCounter.current % 128);
      processIncomingBytes(packet);
    }, 10);
    return () => clearInterval(interval);
  }, [connectionType, processIncomingBytes]);

  const handleConnectUSB = async () => {
    const success = await serialService.requestPort();
    if (success) {
      setConnectionType('USB');
      setDevice(prev => ({ ...prev, isConnected: true }));
      serialService.connect(processIncomingBytes).catch(() => {
        setConnectionType('NONE');
        setDevice(prev => ({ ...prev, isConnected: false }));
      });
    }
  };

  const handleDisconnect = async () => {
    if (connectionType === 'USB') await serialService.disconnect();
    setConnectionType('NONE');
    setDevice(prev => ({ ...prev, isConnected: false }));
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
    currentData.rr < thresholds.rrLow ||
    currentData.fiCO2 > thresholds.fiCO2High;

  return (
    <div className={`h-screen flex flex-col bg-slate-950 text-slate-100 ${isAlarmActive ? 'bg-red-950/10' : ''}`}>
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-slate-950 font-bold">C</div>
          <h1 className="text-xl font-bold tracking-tight">ShowCapno <span className="text-yellow-500">Pro</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
             <i className="fa-solid fa-microchip"></i> {device.sn}
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${device.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">{connectionType}</span>
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-white">
            <i className="fa-solid fa-gear text-lg"></i>
          </button>
          {!device.isConnected ? (
            <button onClick={handleConnectUSB} className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2">
              <i className="fa-solid fa-usb"></i> CONNECT USB
            </button>
          ) : (
            <button onClick={handleDisconnect} className="px-4 py-1.5 rounded-full text-xs font-bold bg-red-600/20 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all">
              DISCONNECT
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <section className="flex-1 relative border-r border-slate-800/50 p-4">
          <Waveform data={waveformBuffer.current} unit={unit} />
          <div className="absolute bottom-6 left-8 flex gap-3">
             {Object.values(Unit).map(u => (
               <button key={u} onClick={() => setUnit(u)} className={`px-3 py-1 rounded-md text-xs font-bold ${unit === u ? 'bg-yellow-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                 {u}
               </button>
             ))}
          </div>
        </section>
        <aside className="w-80 bg-slate-900/30 flex flex-col p-4 gap-4 overflow-y-auto backdrop-blur-sm">
          <StatsCard label="EtCO2" value={currentData.etCO2} unit={unit} color="text-yellow-400" high={thresholds.etCO2High} low={thresholds.etCO2Low} />
          <StatsCard label="Respiration Rate" value={currentData.rr} unit="bpm" color="text-blue-400" high={thresholds.rrHigh} low={thresholds.rrLow} />
          <StatsCard label="FiCO2" value={currentData.fiCO2} unit={unit} color="text-orange-400" high={thresholds.fiCO2High} low={0} />
          <div className="mt-4">
            <button onClick={handleAIAnalyze} disabled={isAnalyzing || !device.isConnected} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
              <i className={`fa-solid ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
              {isAnalyzing ? 'ANALYZING...' : 'GET AI INSIGHT'}
            </button>
            {aiInsight && (
              <div className={`mt-4 p-4 rounded-xl border ${aiInsight.severity === 'critical' ? 'bg-red-900/20 border-red-500/50' : 'bg-indigo-900/20 border-indigo-500/50'}`}>
                <p className="text-sm text-slate-200 mb-2">{aiInsight.assessment}</p>
                {aiInsight.suggestions.map((s, i) => (
                  <div key={i} className="text-xs text-slate-400 mb-1">• {s}</div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>

      <footer className="h-12 bg-slate-900 border-t border-slate-800 flex items-center px-6 justify-between text-xs text-slate-500">
        <Alarms active={isAlarmActive} />
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-battery-three-quarters text-green-500"></i>
          <span>92%</span>
        </div>
      </footer>

      {isSettingsOpen && <SettingsModal thresholds={thresholds} onSave={(t) => { setThresholds(t); setIsSettingsOpen(false); }} onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default App;