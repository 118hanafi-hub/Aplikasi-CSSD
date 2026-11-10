import type { JSX } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import App from './App';

export default function AppRouter(): JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<App />} />
      </Routes>
    </HashRouter>
  );
}
