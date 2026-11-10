import React from 'react';
import ReactDOM from 'react-dom/client';
import AppAccess from './AppAccess';
import './index.css';
import './menu-refresh.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppAccess />
  </React.StrictMode>
);
