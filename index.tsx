import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Start identifying startup sequence
console.group("ShowCapno Pro: Initializing");
console.log("Process ENV:", (window as any).process?.env);

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Fatal: Mount target '#root' not found.");
  console.groupEnd();
  throw new Error("Could not find root element to mount to");
}

try {
  console.log("Creating React root...");
  const root = createRoot(rootElement);
  
  console.log("Rendering application...");
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log("Mount sequence complete.");
} catch (error) {
  console.error("Fatal Error during application mount:", error);
  // Display error to user if possible
  const debugDiv = document.getElementById('debug-error');
  if (debugDiv) {
    debugDiv.style.display = 'block';
    debugDiv.textContent = `Mount Error: ${error instanceof Error ? error.message : String(error)}`;
  }
} finally {
  console.groupEnd();
}