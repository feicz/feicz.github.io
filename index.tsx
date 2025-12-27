import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const updateLoader = (msg: string) => {
  const el = document.getElementById('loader-msg');
  const debugEl = document.getElementById('debug-log');
  if (el) el.innerText = msg;
  if (debugEl) debugEl.innerHTML += `<div>> ${msg}</div>`;
  console.log(`[Boot]: ${msg}`);
};

const main = async () => {
  try {
    updateLoader("Verifying Environment...");
    
    const container = document.getElementById('root');
    if (!container) {
        throw new Error("Target #root not found. DOM state: " + document.readyState);
    }

    updateLoader("Loading Application Assets...");
    
    // 给 DOM 一点响应时间
    await new Promise(r => setTimeout(r, 100));

    updateLoader("Initializing React Fiber...");
    const root = createRoot(container);
    
    updateLoader("Rendering Viewport...");
    // 移除 StrictMode 以排查初始化挂起问题
    root.render(<App />);

    // 给 React 一点时间完成首次渲染
    setTimeout(() => {
      const loader = document.getElementById('init-loader');
      if (loader) {
          loader.style.transition = 'opacity 0.5s ease';
          loader.style.opacity = '0';
          setTimeout(() => loader.style.display = 'none', 500);
      }
      console.log("✅ Application Ready");
    }, 600);

  } catch (err: any) {
    console.error("Critical Boot Error:", err);
    updateLoader("BOOT ERROR: See Overlay");
    
    const overlay = document.getElementById('error-overlay');
    if (overlay) {
        overlay.style.display = 'block';
        overlay.innerHTML += `<div style="color: #ef4444; margin-top: 1rem; font-family: monospace;">${err.stack || err.message}</div>`;
    }
  }
};

// 确保在正确的生命周期执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}