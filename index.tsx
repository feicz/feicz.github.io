import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("[System] ShowCapno Pro starting...");

const updateLoader = (msg: string) => {
  const el = document.getElementById('loader-msg');
  const debugEl = document.getElementById('debug-log');
  if (el) el.innerText = msg;
  if (debugEl) {
    const entry = document.createElement('div');
    entry.textContent = `> ${msg}`;
    debugEl.appendChild(entry);
  }
  console.log(`[App Boot]: ${msg}`);
};

const init = async () => {
  try {
    updateLoader("Environment Check Complete");
    
    const container = document.getElementById('root');
    if (!container) {
        throw new Error("Critical: DOM container #root not found.");
    }

    updateLoader("Loading Core Components...");
    
    // Ensure styles are ready
    await new Promise(r => setTimeout(r, 100));

    updateLoader("Initializing User Interface...");
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Finalize loading sequence
    setTimeout(() => {
      const loader = document.getElementById('init-loader');
      if (loader) {
          loader.style.transition = 'opacity 0.8s ease-out';
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.style.display = 'none';
          }, 800);
      }
      console.log("✅ ShowCapno Pro is now operational.");
    }, 800);

  } catch (err: any) {
    console.error("Critical Failure during initialization:", err);
    updateLoader("SYSTEM HALTED: Boot process failed.");
    
    if (window.onerror) {
        window.onerror(err.message || String(err), "index.tsx", 0, 0, err);
    }
  }
};

// Initiate application boot
init();