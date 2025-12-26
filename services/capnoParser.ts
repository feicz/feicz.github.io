
/**
 * Capnostat 5 Protocol Parser Implementation
 * Based on 1015115DS1 Rev A Documentation
 */

export class CapnoParser {
  // Command 80h: CO2 Waveform/Data Mode
  // Conversion: ((128 * WB1) + WB2) - 1000
  static decodeCO2Value(wb1: number, wb2: number): number {
    const raw = (wb1 * 128) + wb2;
    return (raw - 1000) / 100.0; // Returns mmHg by default (scaled by 100 in transmission)
  }

  // Checksum calculation: (not(sum) + 1) & 7Fh
  static calculateChecksum(bytes: number[]): number {
    let sum = 0;
    for (const b of bytes) {
      sum += b;
    }
    return ((-sum) & 0x7F);
  }

  static verifyChecksum(packet: number[]): boolean {
    if (packet.length < 3) return false;
    const checksum = packet[packet.length - 1];
    const data = packet.slice(0, packet.length - 1);
    let sum = 0;
    for (const b of data) sum += b;
    // Fix: Added parentheses to ensure bitwise operation evaluates before comparison and returns boolean
    return (((sum & 0x7F) + checksum) & 0x7F) === 0;
  }

  // DPI Decoding logic
  static decodeDPI(dpi: number, db1: number, db2: number): any {
    switch (dpi) {
      case 2: // ETCO2 x10
        return ((db1 * 128) + db2) / 10.0;
      case 3: // Respiration Rate
        return (db1 * 128) + db2;
      case 4: // Inspired CO2 x10
        return ((db1 * 128) + db2) / 10.0;
      default:
        return null;
    }
  }
}

// Simulated data generator for Demo Mode
export function generateMockPacket(sync: number): number[] {
  // Simulate a respiratory wave (sinusoidal-ish)
  const time = Date.now() / 1000;
  const rr = 12; // 12 breaths per minute
  const t = (time * (rr / 60)) % 1.0;
  
  let val = 0;
  if (t < 0.4) { // Expiration phase
    val = Math.sin((t / 0.4) * Math.PI) * 38;
  } else { // Inspiration phase
    val = 0;
  }

  const rawVal = Math.round((val * 100) + 1000);
  const wb1 = Math.floor(rawVal / 128) & 0x7F;
  const wb2 = rawVal % 128;

  const packet = [0x80, 0x05, sync, wb1, wb2];
  const cks = CapnoParser.calculateChecksum(packet);
  return [...packet, cks];
}
