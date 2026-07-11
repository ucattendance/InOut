import React from 'react';
import ReactDOM from 'react-dom/client';
import './utils/axiosSetup';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import './styles/admin-ui.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals


// Drop legacy dashboard cache so stale attendance/users are not shown.
if (typeof window !== 'undefined') {
  localStorage.removeItem('dashboard_cache');
  localStorage.removeItem('dashboard_cache_time');
}

// Ensure any old service worker or caches from previous deployments are removed.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  // Unregister all service workers
  navigator.serviceWorker.getRegistrations()
    .then(regs => regs.forEach(reg => reg.unregister().catch(() => {})))
    .catch(() => {});

  // Optionally clear runtime caches
  if (window.caches && window.caches.keys) {
    window.caches.keys()
      .then(keys => Promise.all(keys.map(k => window.caches.delete(k))))
      .catch(() => {});
  }
}

