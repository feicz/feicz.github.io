import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("🚀 ShowCapno Pro: Script Loaded");

const mountApp = () => {
  const container = document.getElementById('root');
  if (!container) {
    console.error("❌ ShowCapno Pro: Root container not found");
    return;
  }

  try {
    console.log("⚛️ ShowCapno Pro: Starting React 19...");
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ ShowCapno Pro: Render cycle initiated");
  } catch (err) {
    console.error("💥 ShowCapno Pro: Mount Failed", err);
  }
};

// 直接尝试执行，如果 DOM 还没好，监听 DOMContentLoaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  mountApp();
} else {
  document.addEventListener('DOMContentLoaded', mountApp);
}