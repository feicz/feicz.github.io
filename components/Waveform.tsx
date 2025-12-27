
import React, { useEffect, useRef } from 'react';
import { Unit } from '../types.ts';

interface WaveformProps {
  data: number[];
  unit: Unit;
}

const Waveform: React.FC<WaveformProps> = ({ data, unit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleY = (val: number) => {
      // Map CO2 (0-60) to canvas height
      const maxVal = unit === Unit.mmHg ? 60 : unit === Unit.kPa ? 8 : 8;
      return canvas.height - (val / maxVal) * (canvas.height * 0.8) - (canvas.height * 0.1);
    };

    let animationFrame: number;
    const render = () => {
      // Clear a small strip ahead of the cursor for the "sweep" effect
      const sweepWidth = 10;
      const x = (cursorRef.current % canvas.width);
      
      ctx.fillStyle = '#020617'; // Slate-950
      ctx.fillRect(x, 0, sweepWidth, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      if (x % 50 === 0) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw segment
      if (data.length > 2) {
        const val = data[data.length - 1];
        const prevVal = data[data.length - 2];
        
        ctx.beginPath();
        ctx.strokeStyle = '#facc15'; // Yellow-400
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.moveTo(x - 1 < 0 ? canvas.width : x - 1, scaleY(prevVal));
        ctx.lineTo(x, scaleY(val));
        ctx.stroke();

        // Add glow
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.2)';
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      cursorRef.current = (cursorRef.current + 1.5) % canvas.width;
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [data, unit]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          canvasRef.current.width = parent.clientWidth;
          canvasRef.current.height = parent.clientHeight;
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block" 
    />
  );
};

export default Waveform;
