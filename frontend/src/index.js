import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

if (window.ResizeObserver) {
  const OriginalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class extends OriginalResizeObserver {
    constructor(callback) {
      const patchedCallback = (entries, observer) => {
        requestAnimationFrame(() => {
          try {
            callback(entries, observer);
          } catch (err) {}
        });
      };
      super(patchedCallback);
    }
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
