import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * ShowCapno Pro Entry Point
 * -------------------------
 * 负责在浏览器环境中启动 React 应用。
 */

const startApp = () => {
  console.group("ShowCapno Pro System Boot");
  
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error("Critical: Could not find mount point '#root'.");
    console.groupEnd();
    return;
  }

  try {
    console.log("Initializing React 19 Root...");
    const root = createRoot(rootElement);
    
    console.log("Mounting Application Component...");
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log("System Ready.");
  } catch (error) {
    console.error("Initialization Failed:", error);
  } finally {
    console.groupEnd();
  }
};

// 确保在 DOM 加载完成后启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}