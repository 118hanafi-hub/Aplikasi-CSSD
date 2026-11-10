export type NavItem = {
  label: string;
  path: string;
  icon: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: '⌂' },
  { label: 'Penerimaan Alat Kotor', path: '/penerimaan-alat-kotor', icon: '↓' },
  { label: 'Inventaris', path: '/inventaris', icon: '▦' },
  { label: 'Sterilisasi', path: '/sterilisasi', icon: '◎' },
  { label: 'Log Suhu', path: '/log-suhu', icon: '◷' },
  { label: 'Pemeliharaan', path: '/pemeliharaan', icon: '⚙' },
  { label: 'Laporan', path: '/laporan', icon: '▤' }
];
