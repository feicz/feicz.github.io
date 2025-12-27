import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 定义反馈函数辅助调试
const updateLoader = (msg: string) => {
  const el = document.getElementById('loader-msg');
  if (el) el.innerText = msg;
  console.log(`[Boot]: ${msg}`);
};

const main = async () => {
  try {
    updateLoader("Loading Application Modules...");
    
    const container = document.getElementById('root');
    if (!container) {
      throw new Error("Target container #root not found in DOM.");
    }

    updateLoader("Mounting React Fiber...");
    const root = createRoot(container);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // 成功渲染后移除加载器
    setTimeout(() => {
      const loader = document.getElementById('init-loader');
      if (loader) loader.style.display = 'none';
      console.log("✅ Boot sequence complete.");
    }, 100);

  } catch (err) {
    console.error("Boot Error:", err);
    updateLoader("Boot Failed - Check Overlay");
    // 手动触发错误处理以显示在 overlay
    if (window.onerror) {
      window.onerror(err instanceof Error ? err.message : String(err), "", 0, 0, err as Error);
    }
  }
};

// 立即尝试执行
main();