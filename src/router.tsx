import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { DirtyReturnsPage } from './pages/DirtyReturnsPage';
import { InventoryPage } from './pages/InventoryPage';
import { SterilizationPage } from './pages/SterilizationPage';
import { TemperaturePage } from './pages/TemperaturePage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ReportsPage } from './pages/ReportsPage';
import { LabelDetailPage } from './pages/LabelDetailPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/penerimaan-alat-kotor" element={<DirtyReturnsPage />} />
          <Route path="/inventaris" element={<InventoryPage />} />
          <Route path="/sterilisasi" element={<SterilizationPage />} />
          <Route path="/log-suhu" element={<TemperaturePage />} />
          <Route path="/pemeliharaan" element={<MaintenancePage />} />
          <Route path="/laporan" element={<ReportsPage />} />
          <Route path="/label/:id" element={<LabelDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
