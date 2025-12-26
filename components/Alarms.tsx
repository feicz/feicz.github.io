
import React, { useState } from 'react';

interface AlarmsProps {
  active: boolean;
}

const Alarms: React.FC<AlarmsProps> = ({ active }) => {
  const [silenced, setSilenced] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <button 
        onClick={() => setSilenced(!silenced)}
        className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
          silenced ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-800 text-slate-400'
        }`}
      >
        <i className={`fa-solid ${silenced ? 'fa-bell-slash' : 'fa-bell'}`}></i>
        <span className="font-bold">{silenced ? 'SILENCED (120s)' : 'ALARM READY'}</span>
      </button>

      {active && !silenced && (
        <div className="flex items-center gap-2 text-red-500 animate-bounce">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span className="font-black uppercase">Critical Threshold Alert</span>
        </div>
      )}
    </div>
  );
};

export default Alarms;
