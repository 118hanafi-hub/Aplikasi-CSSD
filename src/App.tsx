import { useMemo, useState } from 'react';

type Status = 'Ready' | 'In Process' | 'Attention' | 'Maintenance' | 'Dirty';

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  location: string;
  condition: Status;
  serial: string;
  lastChecked: string;
};

type SetItem = {
  code: string;
  name: string;
  qty: number;
};

type SetRecord = {
  id: string;
  name: string;
  qr: string;
  items: SetItem[];
  status: Status;
};

type SterilizationCycle = {
  cycle: string;
  machine: string;
  method: string;
  operator: string;
  status: Status;
  lot: string;
  expiry: string;
};

type TemperatureLog = {
  area: string;
  time: string;
  value: string;
  status: 'Normal' | 'Warning';
};

type MaintenanceItem = {
  machine: string;
  nextService: string;
  owner: string;
  status: 'On Track' | 'Due Soon';
};

const navItems = [
  'Dashboard',
  'Inventory',
  'Sterilization',
  'Temperature',
  'Maintenance',
  'Reports'
] as const;

const inventory: InventoryItem[] = [
  { id: 'INST-001', name: 'Scalpel Handle No. 3', category: 'Instrumen Bedah', location: 'Rack A-01', condition: 'Ready', serial: 'SH-3001', lastChecked: '2026-11-09' },
  { id: 'INST-002', name: 'Forceps Kocher', category: 'Instrumen Bedah', location: 'Rack A-02', condition: 'In Process', serial: 'FK-2041', lastChecked: '2026-11-10' },
  { id: 'INST-003', name: 'Mikroskop Bedah', category: 'Mesin', location: 'Room 1', condition: 'Maintenance', serial: 'MB-9100', lastChecked: '2026-11-08' },
  { id: 'INST-004', name: 'Autoclave 1', category: 'Mesin Sterilisasi', location: 'Sterilization Room', condition: 'Ready', serial: 'AC-1201', lastChecked: '2026-11-09' },
  { id: 'INST-005', name: 'Trolley Steril', category: 'Sarana', location: 'Storage B-01', condition: 'Attention', serial: 'TR-5104', lastChecked: '2026-11-07' },
  { id: 'INST-006', name: 'Disinfectant Tank', category: 'Sarana', location: 'Cleaning Zone', condition: 'Dirty', serial: 'DT-7010', lastChecked: '2026-11-10' }
];

const instrumentSets: SetRecord[] = [
  {
    id: 'SET-001',
    name: 'Set Operasi Laparotomi',
    qr: 'CSSD-SET-001',
    status: 'Ready',
    items: [
      { code: 'SEG-01', name: 'Scalpel Blade No. 10', qty: 1 },
      { code: 'SEG-02', name: 'Forceps Kocher', qty: 2 },
      { code: 'SEG-03', name: 'Scissor Metzenbaum', qty: 1 },
      { code: 'SEG-04', name: 'Needle Holder', qty: 2 }
    ]
  },
  {
    id: 'SET-002',
    name: 'Set Bedah Minor',
    qr: 'CSSD-SET-002',
    status: 'In Process',
    items: [
      { code: 'SM-01', name: 'Scalpel Handle', qty: 1 },
      { code: 'SM-02', name: 'Suture Scissor', qty: 1 },
      { code: 'SM-03', name: 'Towel Clamp', qty: 4 }
    ]
  },
  {
    id: 'SET-003',
    name: 'Set Orthopedic',
    qr: 'CSSD-SET-003',
    status: 'Attention',
    items: [
      { code: 'ORT-01', name: 'Drill Bit', qty: 2 },
      { code: 'ORT-02', name: 'Bone Holder', qty: 1 },
      { code: 'ORT-03', name: 'Reamer', qty: 2 }
    ]
  }
];

const sterilizationCycles: SterilizationCycle[] = [
  { cycle: 'ST-1181', machine: 'Autoclave A', method: 'Steam 134°C', operator: 'Dewi', status: 'Ready', lot: 'LOT-20261110-01', expiry: '2026-12-10' },
  { cycle: 'ST-1182', machine: 'Autoclave B', method: 'Steam 121°C', operator: 'Rina', status: 'In Process', lot: 'LOT-20261110-02', expiry: '2026-12-11' },
  { cycle: 'ST-1183', machine: 'Gas Sterilizer', method: 'EO Gas', operator: 'Sari', status: 'Attention', lot: 'LOT-20261110-03', expiry: '2026-12-12' },
  { cycle: 'ST-1184', machine: 'Dry Heat', method: 'Dry Heat 180°C', operator: 'Toni', status: 'Maintenance', lot: 'LOT-20261110-04', expiry: '2026-12-13' }
];

const temperatureLogs: TemperatureLog[] = [
  { area: 'Sterilization Room', time: '08:00', value: '22.5°C', status: 'Normal' },
  { area: 'Packing Area', time: '09:30', value: '24.1°C', status: 'Normal' },
  { area: 'Storage A', time: '11:00', value: '19.8°C', status: 'Warning' },
  { area: 'Laundry Zone', time: '13:15', value: '26.2°C', status: 'Warning' }
];

const maintenanceItems: MaintenanceItem[] = [
  { machine: 'Autoclave A', nextService: '2026-11-15', owner: 'Engineering', status: 'On Track' },
  { machine: 'Dry Heat Cabinet', nextService: '2026-11-14', owner: 'Engineering', status: 'Due Soon' },
  { machine: 'Washing Machine 2', nextService: '2026-11-22', owner: 'CSSD', status: 'On Track' }
];

const activityFeed = [
  'Set laparotomi siap didistribusikan ke ruang operasi.',
  'Pencatatan suhu storage A dilakukan setelah perubahan jam kerja.',
  'Autoclave B mulai siklus 121°C untuk 18 set instrumen.',
  'Pemeliharaan mesin dry heat dijadwalkan pada besok pagi.'
];

const statusColors: Record<Status, string> = {
  Ready: 'status-ready',
  'In Process': 'status-process',
  Attention: 'status-attention',
  Maintenance: 'status-maintenance',
  Dirty: 'status-dirty'
};

function App() {
  const [activeNav, setActiveNav] = useState<(typeof navItems)[number]>('Dashboard');
  const [selectedSet, setSelectedSet] = useState<SetRecord>(instrumentSets[0]);

  const quickStats = useMemo(
    () => [
      { label: 'Instrumen Siap Pakai', value: '742', change: '+18%' },
      { label: 'Siklus Berjalan', value: '12', change: '+3' },
      { label: 'Perawatan Jatuh Tempo', value: '04', change: '-1' },
      { label: 'Temuan Suhu', value: '02', change: 'Normal' }
    ],
    []
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-badge">CSSD</div>
          <div>
            <strong>CSSD System</strong>
            <small>Central Sterile</small>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <button
              key={item}
              className={`nav-item ${activeNav === item ? 'active' : ''}`}
              onClick={() => setActiveNav(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mini-card">
          <p>Scan cepat</p>
          <button type="button" className="primary-button">Scan QR</button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Monitoring hari ini</p>
            <h1>Dashboard CSSD</h1>
          </div>

          <div className="topbar-actions">
            <button type="button" className="ghost-button">Export</button>
            <button type="button" className="primary-button">Tambah Proses</button>
          </div>
        </header>

        <section className="stats-grid">
          {quickStats.map((stat) => (
            <article key={stat.label} className="stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <em>{stat.change}</em>
            </article>
          ))}
        </section>

        <section className="hero-row">
          <div className="panel panel-lg">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Inventaris</p>
                <h3>Overview alat & mesin</h3>
              </div>
              <button type="button" className="ghost-button tiny">Lihat semua</button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Kategori</th>
                    <th>Lokasi</th>
                    <th>Status</th>
                    <th>Terakhir</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-primary">{item.name}</div>
                        <small>{item.serial}</small>
                      </td>
                      <td>{item.category}</td>
                      <td>{item.location}</td>
                      <td>
                        <span className={`status-chip ${statusColors[item.condition]}`}>
                          {item.condition}
                        </span>
                      </td>
                      <td>{item.lastChecked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel panel-sm">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Label QR</p>
                <h3>Preview kemasan</h3>
              </div>
            </div>

            <div className="qr-box">
              <div className="qr-pattern">
                <span>QR</span>
              </div>
            </div>

            <div className="qr-details">
              <div>
                <small>Nomor paket</small>
                <strong>CSSD-SET-001</strong>
              </div>
              <div>
                <small>Metode</small>
                <strong>Steam 134°C</strong>
              </div>
            </div>

            <button type="button" className="primary-button full-width">Cetak Label</button>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Instrumen set</p>
                <h3>Rincian isi set</h3>
              </div>
            </div>

            <div className="set-selector">
              {instrumentSets.map((set) => (
                <button
                  key={set.id}
                  className={`set-button ${selectedSet.id === set.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSet(set)}
                  type="button"
                >
                  {set.name}
                </button>
              ))}
            </div>

            <div className="set-summary">
              <div>
                <small>Set aktif</small>
                <strong>{selectedSet.name}</strong>
              </div>
              <span className={`status-chip ${statusColors[selectedSet.status]}`}>
                {selectedSet.status}
              </span>
            </div>

            <ul className="item-list">
              {selectedSet.items.map((item) => (
                <li key={item.code}>
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.code}</small>
                  </div>
                  <span>{item.qty} pcs</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Sterilisasi</p>
                <h3>Queue proses</h3>
              </div>
            </div>

            <ul className="timeline-list">
              {sterilizationCycles.map((cycle) => (
                <li key={cycle.cycle} className="timeline-item">
                  <div>
                    <strong>{cycle.cycle}</strong>
                    <small>{cycle.machine} · {cycle.method}</small>
                  </div>
                  <div className="timeline-side">
                    <span className={`status-chip ${statusColors[cycle.status]}`}>{cycle.status}</span>
                    <small>{cycle.operator}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="content-grid bottom-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Lingkungan</p>
                <h3>Log suhu</h3>
              </div>
            </div>

            <ul className="log-list">
              {temperatureLogs.map((log) => (
                <li key={`${log.area}-${log.time}`}>
                  <div>
                    <strong>{log.area}</strong>
                    <small>{log.time}</small>
                  </div>
                  <div className="log-right">
                    <span>{log.value}</span>
                    <em className={log.status === 'Normal' ? 'normal' : 'warning'}>{log.status}</em>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Pemeliharaan</p>
                <h3>Jadwal mesin</h3>
              </div>
            </div>

            <ul className="maintenance-list">
              {maintenanceItems.map((item) => (
                <li key={item.machine}>
                  <div>
                    <strong>{item.machine}</strong>
                    <small>{item.owner}</small>
                  </div>
                  <div className="maintenance-right">
                    <span>{item.nextService}</span>
                    <em className={item.status === 'On Track' ? 'normal' : 'warning'}>{item.status}</em>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="activity-row">
          <div className="panel panel-full">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Aktivitas</p>
                <h3>Riwayat operasional</h3>
              </div>
            </div>

            <ul className="feed-list">
              {activityFeed.map((item, index) => (
                <li key={`${item}-${index}`}>
                  <span className="dot" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
