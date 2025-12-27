
/**
 * Web Serial API Service for USB CDC Communication
 */
export class SerialService {
  // Use 'any' as SerialPort is not globally defined in standard DOM types
  private port: any = null;
  // Use 'any' for the reader to ensure compatibility across different TS environments
  private reader: any = null;
  private keepReading: boolean = true;

  async requestPort(): Promise<boolean> {
    try {
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API not supported in this browser.');
      }
      // Accessing the non-standard serial property via any to avoid compilation errors
      this.port = await (navigator as any).serial.requestPort();
      return !!this.port;
    } catch (err) {
      console.error('User cancelled port selection or error occurred:', err);
      return false;
    }
  }

  async connect(onData: (bytes: number[]) => void): Promise<void> {
    if (!this.port) return;

    try {
      // Open the port with specific configuration for Capnostat 5
      await this.port.open({ baudRate: 19200 }); 
      console.log('Serial Port Opened');

      this.keepReading = true;
      while (this.port.readable && this.keepReading) {
        this.reader = this.port.readable.getReader();
        try {
          while (true) {
            const { value, done } = await this.reader.read();
            if (done) break;
            if (value) {
              onData(Array.from(value));
            }
          }
        } catch (error) {
          console.error('Serial read error:', error);
        } finally {
          this.reader.releaseLock();
        }
      }
    } catch (err) {
      console.error('Failed to open serial port:', err);
    }
  }

  async disconnect(): Promise<void> {
    this.keepReading = false;
    if (this.reader) {
      await this.reader.cancel();
    }
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
  }
}

export const serialService = new SerialService();
