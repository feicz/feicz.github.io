import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

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
    updateLoader("DOM Environment Verified");
    
    const container = document.getElementById('root');
    if (!container) {
        throw new Error("Critical: Application mount point #root not found.");
    }

    updateLoader("Loading Component Tree...");
    
    // 短暂延迟确保运行时转换完成
    await new Promise(r => setTimeout(r, 50));

    updateLoader("Mounting React Reconciler...");
    const root = createRoot(container);
    
    updateLoader("Starting Main Viewport...");
    root.render(<App />);

    // 渲染完成后，平滑移除加载器
    setTimeout(() => {
      const loader = document.getElementById('init-loader');
      if (loader) {
          loader.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.style.display = 'none';
          }, 600);
      }
      console.log("✅ Bootstrapping finished successfully.");
    }, 500);

  } catch (err: any) {
    console.error("Bootstrapping Error:", err);
    updateLoader("HALTED: System initialization failed.");
    
    // 确保错误信息显示在红色层
    if (window.onerror) {
        window.onerror(err.message || String(err), "", 0, 0, err);
    }
  }
};

// 立即执行初始化
init();