import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.group("ShowCapno Pro: Startup");
// Fix: Use type casting to access the process property on window to satisfy the TypeScript compiler
console.log("Environment check:", (window as any).process?.env);
console.log("DOM Ready. Locating root...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("ShowCapno Pro Fatal: Root element not found.");
  console.groupEnd();
  throw new Error("Could not find root element to mount to");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("React mount successful.");
} catch (error) {
  console.error("ShowCapno Pro Fatal: Failed to render.", error);
} finally {
  console.groupEnd();
}