import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type Page = 'Dashboard' | 'Penerimaan Alat Kotor' | 'Inventaris' | 'Sterilisasi' | 'Log Suhu' | 'Pemeliharaan' | 'Laporan';
type InstrumentSet = { id: string; name: string; items: { name: string; qty: number }[]; status: string };
type DirtyReturn = { id: string; origin: string; description: string; qty: number; condition: string; receivedBy: string; time: string };
type PackageLabel = { id: string; cycleId: string; packageName: string; contents: string; sterilizedAt: string; expiry: string; method: string; machine: string; cycleNo: string; operator: string; status: 'Menunggu proses' | 'Dalam proses' | 'Selesai' | 'Ditahan' };
type TemperatureEntry = { id: string; area: string; value: string; time: string; officer: string; note: string };
type MaintenanceEntry = { id: string; machine: string; activity: string; dueDate: string; officer: string; status: string };

const nav: Page[] = ['Dashboard', 'Penerimaan Alat Kotor', 'Inventaris', 'Sterilisasi', 'Log Suhu', 'Pemeliharaan', 'Laporan'];
const initialSets: InstrumentSet[] = [
  { id: 'SET-001', name: 'Set Operasi Laparotomi', status: 'Siap', items: [{ name: 'Pinset anatomi', qty: 2 }, { name: 'Gunting Metzenbaum', qty: 1 }, { name: 'Needle holder', qty: 2 }, { name: 'Klem', qty: 4 }] },
  { id: 'SET-002', name: 'Set Bedah Minor', status: 'Dalam proses', items: [{ name: 'Scalpel handle', qty: 1 }, { name: 'Gunting', qty: 1 }, { name: 'Towel clamp', qty: 4 }] },
  { id: 'SET-003', name: 'Set Orthopedi', status: 'Perlu pemeriksaan', items: [{ name: 'Bone holder', qty: 1 }, { name: 'Drill bit', qty: 2 }, { name: 'Reamer', qty: 2 }] }
];
const initialLabels: PackageLabel[] = [
  { id: 'PKG-20261110-001', cycleId: 'CY-1181', packageName: 'Set Operasi Laparotomi', contents: 'Pinset anatomi (2), Gunting Metzenbaum (1), Needle holder (2), Klem (4)', sterilizedAt: '2026-11-10', expiry: '2026-12-10', method: 'Uap panas 134°C', machine: 'Autoclave A', cycleNo: '1181', operator: 'Dewi', status: 'Selesai' },
  { id: 'PKG-20261110-002', cycleId: 'CY-1182', packageName: 'Set Bedah Minor', contents: 'Scalpel handle (1), Gunting (1), Towel clamp (4)', sterilizedAt: '2026-11-10', expiry: '2026-12-11', method: 'Uap panas 121°C', machine: 'Autoclave B', cycleNo: '1182', operator: 'Rina', status: 'Dalam proses' }
];
const key = 'cssd-prototype-data-v1';
function readSaved<T>(name: string, fallback: T): T {
  try { const parsed = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, unknown>; return (parsed[name] as T) ?? fallback; } catch { return fallback; }
}
function writeSaved(name: string, value: unknown) {
  try { const parsed = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, unknown>; localStorage.setItem(key, JSON.stringify({ ...parsed, [name]: value })); } catch { /* local storage may be disabled */ }
}
function today() { return new Date().toISOString().slice(0, 10); }
function makeId(prefix: string) { return `${prefix}-${Date.now().toString().slice(-8)}`; }

function App() {
  const [page, setPage] = useState<Page>('Dashboard');
  const [sets] = useState(initialSets);
  const [returns, setReturns] = useState<DirtyReturn[]>(() => readSaved('returns', []));
  const [labels, setLabels] = useState<PackageLabel[]>(() => readSaved('labels', initialLabels));
  const [temps, setTemps] = useState<TemperatureEntry[]>(() => readSaved('temps', []));
  const [maintenance, setMaintenance] = useState<MaintenanceEntry[]>(() => readSaved('maintenance', []));
  const [selectedSet, setSelectedSet] = useState(sets[0]);
  const [notice, setNotice] = useState('');
  const [scanValue, setScanValue] = useState('');
  const [focusedLabel, setFocusedLabel] = useState<PackageLabel | null>(null);

  useEffect(() => { writeSaved('returns', returns); }, [returns]);
  useEffect(() => { writeSaved('labels', labels); }, [labels]);
  useEffect(() => { writeSaved('temps', temps); }, [temps]);
  useEffect(() => { writeSaved('maintenance', maintenance); }, [maintenance]);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('label');
    if (id) { const found = labels.find((label) => label.id === id); if (found) setFocusedLabel(found); }
  }, [labels]);

  const counts = useMemo(() => ({ dirty: returns.length, waiting: labels.filter((x) => x.status === 'Menunggu proses').length, running: labels.filter((x) => x.status === 'Dalam proses').length, ready: labels.filter((x) => x.status === 'Selesai').length }), [returns, labels]);
  const announce = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(''), 3500); };
  const setStatus = (id: string, status: PackageLabel['status']) => setLabels((current) => current.map((x) => x.id === id ? { ...x, status } : x));
  const openLabel = (label: PackageLabel) => { setFocusedLabel(label); window.history.replaceState({}, '', `?label=${encodeURIComponent(label.id)}`); };

  function submitReturn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    setReturns((old) => [{ id: makeId('RET'), origin: String(data.get('origin')), description: String(data.get('description')), qty: Number(data.get('qty')), condition: String(data.get('condition')), receivedBy: String(data.get('officer')), time: new Date().toLocaleString('id-ID') }, ...old]);
    event.currentTarget.reset(); announce('Pengembalian dicatat dengan status diterima—kotor.');
  }
  function submitCycle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const id = makeId('PKG');
    const entry: PackageLabel = { id, cycleId: String(data.get('cycleNo')), packageName: String(data.get('packageName')), contents: String(data.get('contents')), sterilizedAt: String(data.get('sterilizedAt')), expiry: String(data.get('expiry')), method: String(data.get('method')), machine: String(data.get('machine')), cycleNo: String(data.get('cycleNo')), operator: String(data.get('operator')), status: 'Menunggu proses' };
    setLabels((old) => [entry, ...old]); event.currentTarget.reset(); openLabel(entry); announce('Muatan dan label dibuat. Cetak label sebelum menekan Start mesin.');
  }
  function submitTemp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    setTemps((old) => [{ id: makeId('TMP'), area: String(data.get('area')), value: String(data.get('value')), time: new Date().toLocaleString('id-ID'), officer: String(data.get('officer')), note: String(data.get('note')) }, ...old]); event.currentTarget.reset(); announce('Log suhu berhasil dicatat.');
  }
  function submitMaintenance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    setMaintenance((old) => [{ id: makeId('MNT'), machine: String(data.get('machine')), activity: String(data.get('activity')), dueDate: String(data.get('dueDate')), officer: String(data.get('officer')), status: 'Terjadwal' }, ...old]); event.currentTarget.reset(); announce('Jadwal pemeliharaan dicatat.');
  }

  if (focusedLabel) return <LabelDetail label={focusedLabel} onBack={() => { setFocusedLabel(null); window.history.replaceState({}, '', window.location.pathname); }} onPrint={() => window.print()} />;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">C</div><div><b>CSSD Care</b><small>STERILE MANAGEMENT</small></div></div>
      <nav className="nav-menu" aria-label="Menu utama">{nav.map((item, index) => <button key={item} type="button" className={`nav-item ${page === item ? 'active' : ''}`} onClick={() => setPage(item)}><span className="nav-icon">{['⌂', '↓', '▦', '◎', '◷', '⚙', '▤'][index]}</span>{item}</button>)}</nav>
      <div className="sidebar-note"><span className="online-dot"/> Prototype lokal<br/><small>Data tersimpan di browser ini</small></div>
    </aside>
    <main className="main-panel">
      <header className="topbar"><div><p className="eyebrow">CSSD · {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p><h1>{page}</h1></div><div className="user-pill"><span className="avatar">P</span><span><b>Petugas CSSD</b><small>Operator</small></span></div></header>
      {notice && <div role="status" className="notice">✓ {notice}</div>}
      {page === 'Dashboard' && <Dashboard counts={counts} labels={labels} returns={returns} temps={temps} onPage={setPage} onOpenLabel={openLabel} />}
      {page === 'Penerimaan Alat Kotor' && <DirtyReturns returns={returns} onSubmit={submitReturn} />}
      {page === 'Inventaris' && <Inventory sets={sets} selected={selectedSet} onSelect={setSelectedSet} scanValue={scanValue} onScanValue={setScanValue} onFind={() => { const found = sets.find((x) => x.id.toLowerCase() === scanValue.trim().toLowerCase()); if (found) { setSelectedSet(found); announce(`Isi ${found.name} ditampilkan.`); } else announce('Kode belum ditemukan pada data demo.'); }} />}
      {page === 'Sterilisasi' && <Sterilization labels={labels} onSubmit={submitCycle} onOpenLabel={openLabel} onSetStatus={setStatus} />}
      {page === 'Log Suhu' && <Temperature temps={temps} onSubmit={submitTemp} />}
      {page === 'Pemeliharaan' && <Maintenance entries={maintenance} onSubmit={submitMaintenance} />}
      {page === 'Laporan' && <Reports returns={returns} labels={labels} temps={temps} maintenance={maintenance} />}
    </main>
    <nav className="mobile-nav" aria-label="Navigasi mobile">{(['Dashboard', 'Penerimaan Alat Kotor', 'Sterilisasi', 'Inventaris'] as Page[]).map((item, i) => <button key={item} className={page === item ? 'active' : ''} onClick={() => setPage(item)} type="button"><span>{['⌂', '↓', '◎', '▦'][i]}</span>{['Beranda', 'Alat kotor', 'Sterilisasi', 'Inventaris'][i]}</button>)}</nav>
  </div>;
}

function Dashboard({ counts, labels, returns, temps, onPage, onOpenLabel }: { counts: { dirty: number; waiting: number; running: number; ready: number }; labels: PackageLabel[]; returns: DirtyReturn[]; temps: TemperatureEntry[]; onPage: (page: Page) => void; onOpenLabel: (label: PackageLabel) => void }) {
  return <>
    <section className="welcome-card"><div><p className="eyebrow">RINGKASAN OPERASIONAL</p><h2>Selamat bekerja, Petugas CSSD</h2><p>Pantau alur instrumen dan aktivitas hari ini dari satu tempat.</p></div><div className="welcome-symbol">✳</div></section>
    <section className="stats-grid">{[['Alat kotor masuk', counts.dirty, 'Perlu diproses'], ['Menunggu sterilisasi', counts.waiting, 'Label siap dicetak'], ['Siklus berlangsung', counts.running, 'Dalam proses'], ['Kemasan selesai', counts.ready, 'Tercatat di sistem']].map(([label, value, note]) => <article className="stat-card" key={String(label)}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</section>
    <section className="quick-actions"><div className="section-heading"><div><p className="eyebrow">AKSES CEPAT</p><h2>Mulai aktivitas</h2></div></div><div className="action-grid"><button onClick={() => onPage('Penerimaan Alat Kotor')} className="action-card" type="button"><span className="action-icon coral">↓</span><b>Terima alat kotor</b><small>Catat pengembalian dari ruangan</small></button><button onClick={() => onPage('Sterilisasi')} className="action-card" type="button"><span className="action-icon blue">◎</span><b>Buat muatan sterilisasi</b><small>Siapkan dan cetak label sebelum Start</small></button><button onClick={() => onPage('Log Suhu')} className="action-card" type="button"><span className="action-icon green">◷</span><b>Catat suhu</b><small>Tambahkan log area dan petugas</small></button><button onClick={() => onPage('Inventaris')} className="action-card" type="button"><span className="action-icon violet">▦</span><b>Lihat inventaris</b><small>Telusuri isi instrumen set</small></button></div></section>
    <div className="two-column"><section className="panel"><div className="panel-heading"><div><p className="eyebrow">TERBARU</p><h2>Muatan sterilisasi</h2></div><button className="text-button" onClick={() => onPage('Sterilisasi')} type="button">Lihat semua →</button></div>{labels.slice(0, 4).map((label) => <button className="list-row clickable" onClick={() => onOpenLabel(label)} key={label.id} type="button"><span className="row-icon">◎</span><span className="row-main"><b>{label.packageName}</b><small>{label.cycleId} · {label.machine}</small></span><Status value={label.status}/></button>)}</section><section className="panel"><div className="panel-heading"><div><p className="eyebrow">AKTIVITAS</p><h2>Catatan terbaru</h2></div></div>{returns.slice(0, 3).map((item) => <div className="list-row" key={item.id}><span className="row-icon coral">↓</span><span className="row-main"><b>{item.description}</b><small>{item.origin} · {item.time}</small></span><Status value="Diterima—kotor"/></div>)}{temps.slice(0, 2).map((item) => <div className="list-row" key={item.id}><span className="row-icon green">◷</span><span className="row-main"><b>{item.area}: {item.value}</b><small>{item.time} · {item.officer}</small></span></div>)}{!returns.length && !temps.length && <Empty text="Aktivitas yang Anda catat akan muncul di sini."/>}</section></div>
  </>;
}
function Status({ value }: { value: string }) { const cls = /selesai|siap/i.test(value) ? 'green' : /proses|berjalan/i.test(value) ? 'blue' : /ditahan|perlu|kotor/i.test(value) ? 'amber' : 'gray'; return <span className={`status ${cls}`}>{value}</span>; }
function PanelTitle({ eyebrow, title }: { eyebrow: string; title: string }) { return <div className="panel-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div></div>; }
function Empty({ text }: { text: string }) { return <div className="empty-state">{text}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }

function DirtyReturns({ returns, onSubmit }: { returns: DirtyReturn[]; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <div className="page-stack"><div className="notice soft">Catat serah-terima alat yang kembali dalam kondisi kotor. Status alat tidak berubah menjadi bersih sampai tahapan proses CSSD berikutnya dicatat.</div><section className="panel"><PanelTitle eyebrow="PENERIMAAN" title="Catat pengembalian alat kotor"/><form className="form-grid" onSubmit={onSubmit}><Field label="Ruangan asal"><input name="origin" placeholder="Contoh: Ruang Operasi 2" required/></Field><Field label="Instrumen atau set"><input name="description" placeholder="Nama set / instrumen" required/></Field><Field label="Jumlah"><input name="qty" type="number" min="1" defaultValue="1" required/></Field><Field label="Kondisi saat diterima"><select name="condition"><option>Kotor - utuh</option><option>Perlu pemeriksaan</option><option>Ada alat kurang</option><option>Rusak / perlu tindak lanjut</option></select></Field><Field label="Nama petugas penerima"><input name="officer" placeholder="Nama petugas CSSD" required/></Field><div className="form-actions"><button className="button primary" type="submit">Simpan penerimaan</button></div></form></section><section className="panel"><PanelTitle eyebrow="RIWAYAT" title="Pengembalian terbaru"/>{returns.length ? returns.map((item) => <div className="list-row" key={item.id}><span className="row-icon coral">↓</span><span className="row-main"><b>{item.description} · {item.qty} unit</b><small>{item.origin} · {item.time} · diterima {item.receivedBy}</small></span><Status value={item.condition}/></div>) : <Empty text="Belum ada data pengembalian. Entri yang disimpan akan tampil di sini."/>}</section></div>;
}
function Inventory({ sets, selected, onSelect, scanValue, onScanValue, onFind }: { sets: InstrumentSet[]; selected: InstrumentSet; onSelect: (set: InstrumentSet) => void; scanValue: string; onScanValue: (value: string) => void; onFind: () => void }) {
  return <div className="page-stack"><section className="panel"><PanelTitle eyebrow="TELUSURI DENGAN KODE" title="Cari instrumen atau set"/><div className="scan-row"><span className="scan-glyph">⌗</span><input value={scanValue} onChange={(e) => onScanValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onFind(); }} placeholder="Masukkan kode QR, contoh SET-001"/><button className="button primary" onClick={onFind} type="button">Cari kode</button></div><p className="helper">Prototype ini menerima kode manual. Pemindaian kamera akan ditambahkan pada tahap integrasi perangkat.</p></section><div className="two-column inventory-grid"><section className="panel"><PanelTitle eyebrow="INSTRUMEN SET" title="Daftar set"/>{sets.map((set) => <button key={set.id} type="button" className={`set-select ${selected.id === set.id ? 'chosen' : ''}`} onClick={() => onSelect(set)}><span className="row-icon violet">▦</span><span className="row-main"><b>{set.name}</b><small>{set.id} · {set.items.length} jenis item</small></span><Status value={set.status}/></button>)}</section><section className="panel"><PanelTitle eyebrow={`QR ${selected.id}`} title={selected.name}/><div className="set-content">{selected.items.map((item) => <div className="content-line" key={item.name}><span>{item.name}</span><b>{item.qty} buah</b></div>)}</div><div className="notice soft">Komposisi ini adalah data contoh. Isi dan jumlah aktual perlu dimasukkan melalui modul inventaris setelah database dibuat.</div></section></div></div>;
}
function Sterilization({ labels, onSubmit, onOpenLabel, onSetStatus }: { labels: PackageLabel[]; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; onOpenLabel: (label: PackageLabel) => void; onSetStatus: (id: string, status: PackageLabel['status']) => void }) {
  return <div className="page-stack"><div className="notice soft"><b>Alur demo:</b> buat muatan → cetak label QR → setelah label terpasang, catat Start mesin. Hasil siklus tetap harus diverifikasi sesuai SOP sebelum status siap.</div><section className="panel"><PanelTitle eyebrow="MUATAN BARU" title="Siapkan label sebelum Start"/><form className="form-grid" onSubmit={onSubmit}><Field label="Nama set / kemasan"><input name="packageName" placeholder="Contoh: Set Operasi Laparotomi" required/></Field><Field label="Isi instrumen dan jumlah"><textarea name="contents" placeholder="Pinset anatomi (2), Gunting (1)" rows={2} required/></Field><Field label="Mesin"><select name="machine"><option>Autoclave A</option><option>Autoclave B</option><option>Sterilisator suhu rendah</option><option>Mesin lain</option></select></Field><Field label="Metode sterilisasi"><select name="method"><option>Uap panas 134°C</option><option>Uap panas 121°C</option><option>Metode sesuai SOP fasilitas</option></select></Field><Field label="Nomor siklus"><input name="cycleNo" placeholder="Contoh: 1185" required/></Field><Field label="Nama petugas"><input name="operator" placeholder="Nama petugas" required/></Field><Field label="Tanggal sterilisasi"><input name="sterilizedAt" type="date" defaultValue={today()} required/></Field><Field label="Tanggal kedaluwarsa sesuai SOP"><input name="expiry" type="date" required/></Field><div className="form-actions"><button className="button primary" type="submit">Buat muatan & label QR</button></div></form></section><section className="panel"><PanelTitle eyebrow="LOT / RIWAYAT" title="Daftar kemasan"/>{labels.length ? labels.map((label) => <div className="cycle-card" key={label.id}><div className="row-icon blue">◎</div><div className="row-main"><b>{label.packageName}</b><small>{label.id} · {label.machine} · siklus {label.cycleNo} · {label.operator}</small><small>{label.method} · sterilisasi {label.sterilizedAt} · kedaluwarsa {label.expiry}</small></div><Status value={label.status}/><div className="cycle-actions"><button className="button secondary small" type="button" onClick={() => onOpenLabel(label)}>Lihat / cetak QR</button>{label.status === 'Menunggu proses' && <button className="button primary small" type="button" onClick={() => onSetStatus(label.id, 'Dalam proses')}>Start dicatat</button>}{label.status === 'Dalam proses' && <><button className="button secondary small" type="button" onClick={() => onSetStatus(label.id, 'Selesai')}>Catat hasil sesuai</button><button className="button danger small" type="button" onClick={() => onSetStatus(label.id, 'Ditahan')}>Tahan / gagal</button></>}</div></div>) : <Empty text="Belum ada muatan sterilisasi."/>}</section></div>;
}
function Temperature({ temps, onSubmit }: { temps: TemperatureEntry[]; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <div className="page-stack"><section className="panel"><PanelTitle eyebrow="PENCATATAN" title="Log suhu area"/><form className="form-grid" onSubmit={onSubmit}><Field label="Area"><input name="area" placeholder="Contoh: Ruang penyimpanan" required/></Field><Field label="Suhu terukur"><input name="value" placeholder="Contoh: 22.5°C" required/></Field><Field label="Nama petugas"><input name="officer" placeholder="Nama petugas" required/></Field><Field label="Catatan / tindak lanjut"><input name="note" placeholder="Opsional"/></Field><div className="form-actions"><button className="button primary" type="submit">Simpan log suhu</button></div></form></section><section className="panel"><PanelTitle eyebrow="RIWAYAT" title="Pencatatan terbaru"/>{temps.length ? temps.map((x) => <div className="list-row" key={x.id}><span className="row-icon green">◷</span><span className="row-main"><b>{x.area} · {x.value}</b><small>{x.time} · {x.officer}{x.note ? ` · ${x.note}` : ''}</small></span></div>) : <Empty text="Belum ada pencatatan suhu."/>}</section></div>;
}
function Maintenance({ entries, onSubmit }: { entries: MaintenanceEntry[]; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <div className="page-stack"><section className="panel"><PanelTitle eyebrow="MESIN & PERALATAN" title="Catat pemeliharaan"/><form className="form-grid" onSubmit={onSubmit}><Field label="Nama mesin"><input name="machine" placeholder="Contoh: Autoclave A" required/></Field><Field label="Jenis kegiatan"><select name="activity"><option>Pemeliharaan rutin</option><option>Perbaikan</option><option>Kalibrasi</option><option>Pemeriksaan</option></select></Field><Field label="Jadwal berikutnya"><input name="dueDate" type="date" required/></Field><Field label="Petugas / teknisi"><input name="officer" placeholder="Nama petugas atau teknisi" required/></Field><div className="form-actions"><button className="button primary" type="submit">Simpan jadwal</button></div></form></section><section className="panel"><PanelTitle eyebrow="JADWAL" title="Riwayat pemeliharaan"/>{entries.length ? entries.map((x) => <div className="list-row" key={x.id}><span className="row-icon violet">⚙</span><span className="row-main"><b>{x.machine} · {x.activity}</b><small>Jadwal {x.dueDate} · {x.officer}</small></span><Status value={x.status}/></div>) : <Empty text="Belum ada jadwal pemeliharaan."/>}</section></div>;
}
function Reports({ returns, labels, temps, maintenance }: { returns: DirtyReturn[]; labels: PackageLabel[]; temps: TemperatureEntry[]; maintenance: MaintenanceEntry[] }) {
  const rows = [['Penerimaan alat kotor', returns.length], ['Kemasan / siklus tercatat', labels.length], ['Log suhu', temps.length], ['Pemeliharaan terjadwal', maintenance.length]];
  return <div className="page-stack"><section className="panel"><PanelTitle eyebrow="RINGKASAN DATA" title="Laporan prototype"/><p className="helper">Ringkasan ini berdasarkan data yang tersimpan di browser/perangkat ini. Belum menjadi laporan resmi dan belum tersinkron ke pengguna lain.</p><div className="report-grid">{rows.map(([name, value]) => <div className="report-tile" key={String(name)}><small>{name}</small><b>{value}</b></div>)}</div></section><section className="panel"><PanelTitle eyebrow="BATASAN PROTOTYPE" title="Sebelum digunakan operasional"/><ul className="bullet-list"><li>Data saat ini disimpan lokal di browser perangkat, belum menggunakan database bersama.</li><li>Belum ada login, hak akses, sinkronisasi 50–60 pengguna, atau audit trail server.</li><li>Konfigurasi SOP, masa berlaku, parameter proses, dan validasi harus ditetapkan fasilitas.</li><li>Gunakan data simulasi saja; jangan memasukkan data pasien atau data sensitif.</li></ul></section></div>;
}
function LabelDetail({ label, onBack, onPrint }: { label: PackageLabel; onBack: () => void; onPrint: () => void }) {
  const qrUrl = `${window.location.origin}${window.location.pathname}?label=${encodeURIComponent(label.id)}`;
  return <main className="label-page"><div className="label-toolbar"><button className="button secondary" onClick={onBack} type="button">← Kembali</button><button className="button primary" onClick={onPrint} type="button">Cetak label</button></div><article className="print-label"><div className="label-brand"><span>CSSD CARE</span><small>IDENTITAS KEMASAN STERIL</small></div><div className="label-core"><div className="qr-frame"><QRCodeSVG value={qrUrl} size={170} level="M" includeMargin/></div><div className="label-info"><p className="eyebrow">{label.id}</p><h1>{label.packageName}</h1><p>{label.contents}</p><div className="label-status"><Status value={label.status}/></div></div></div><div className="label-facts"><div><small>Tanggal sterilisasi</small><b>{label.sterilizedAt}</b></div><div><small>Kedaluwarsa*</small><b>{label.expiry}</b></div><div><small>Metode</small><b>{label.method}</b></div><div><small>Nomor lot / siklus</small><b>{label.cycleId} / {label.cycleNo}</b></div><div><small>Nomor mesin</small><b>{label.machine}</b></div><div><small>Petugas</small><b>{label.operator}</b></div></div><footer>*Masa berlaku mengikuti SOP fasilitas. Pindai QR untuk melihat status dan detail kemasan.</footer></article><p className="label-explanation">QR ini membuka rekaman label pada aplikasi yang sama. Pada prototype, data label hanya tersedia pada browser tempat data dibuat.</p></main>;
}
export default App;
