
export enum Unit {
  mmHg = 'mmHg',
  kPa = 'kPa',
  Percent = '%'
}

export interface SensorData {
  etCO2: number;
  fiCO2: number;
  rr: number;
  waveform: number[];
  status: string;
  timestamp: number;
}

export interface AlarmThresholds {
  etCO2High: number;
  etCO2Low: number;
  rrHigh: number;
  rrLow: number;
  fiCO2High: number;
}

export interface DeviceState {
  isConnected: boolean;
  isWarmup: boolean;
  isZeroing: boolean;
  battery: number;
  sn: string;
  error?: string;
}

export interface AIAnalysis {
  assessment: string;
  suggestions: string[];
  severity: 'normal' | 'caution' | 'critical';
}
