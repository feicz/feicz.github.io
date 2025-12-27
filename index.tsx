import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("ShowCapno Pro: Initializing application mount...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("ShowCapno Pro Fatal: Root element not found in DOM.");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("ShowCapno Pro: Render cycle initiated.");
} catch (error) {
  console.error("ShowCapno Pro Fatal: Failed to render root component.", error);
}
