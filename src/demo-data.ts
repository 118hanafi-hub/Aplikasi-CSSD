export const demoData = {
  sets: [
    { id: 'SET-001', name: 'Set Operasi Laparotomi', status: 'Siap', items: [{ name: 'Pinset anatomi', qty: 2 }, { name: 'Gunting Metzenbaum', qty: 1 }, { name: 'Needle holder', qty: 2 }, { name: 'Klem', qty: 4 }] },
    { id: 'SET-002', name: 'Set Bedah Minor', status: 'Dalam proses', items: [{ name: 'Scalpel handle', qty: 1 }, { name: 'Gunting', qty: 1 }, { name: 'Towel clamp', qty: 4 }] },
    { id: 'SET-003', name: 'Set Orthopedi', status: 'Perlu pemeriksaan', items: [{ name: 'Bone holder', qty: 1 }, { name: 'Drill bit', qty: 2 }, { name: 'Reamer', qty: 2 }] }
  ],
  labels: [
    { id: 'PKG-20261110-001', cycleId: 'CY-1181', packageName: 'Set Operasi Laparotomi', contents: 'Pinset anatomi (2), Gunting Metzenbaum (1), Needle holder (2), Klem (4)', sterilizedAt: '2026-11-10', expiry: '2026-12-10', method: 'Uap panas 134°C', machine: 'Autoclave A', cycleNo: '1181', operator: 'Dewi', status: 'Selesai' },
    { id: 'PKG-20261110-002', cycleId: 'CY-1182', packageName: 'Set Bedah Minor', contents: 'Scalpel handle (1), Gunting (1), Towel clamp (4)', sterilizedAt: '2026-11-10', expiry: '2026-12-11', method: 'Uap panas 121°C', machine: 'Autoclave B', cycleNo: '1182', operator: 'Rina', status: 'Dalam proses' }
  ]
};
