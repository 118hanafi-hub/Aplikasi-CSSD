export type Role = 'admin' | 'supervisor' | 'operator' | 'room_user';

export const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: 'admin', label: 'Admin' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'operator', label: 'Operator' },
  { value: 'room_user', label: 'Pengguna Ruang' }
];

export type InstrumentSet = {
  id: string;
  name: string;
  status: string;
  created_at?: string;
};

export type DirtyReturn = {
  id: string;
  origin_room: string;
  description: string;
  qty: number;
  condition: string;
  received_by: string;
  created_at?: string;
};

export type SterilizationCycle = {
  id: string;
  cycle_no: string;
  package_name: string;
  method: string;
  machine: string;
  operator: string;
  status: string;
  sterilized_at?: string | null;
  expired_at?: string | null;
  created_at?: string;
};

export type TemperatureLog = {
  id: string;
  area: string;
  value_c: number;
  note?: string | null;
  recorded_by: string;
  created_at?: string;
};

export type MaintenanceLog = {
  id: string;
  machine: string;
  activity: string;
  due_date?: string | null;
  status: string;
  officer: string;
  created_at?: string;
};
