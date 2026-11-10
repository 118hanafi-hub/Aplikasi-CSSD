export type Role = 'admin' | 'supervisor' | 'operator' | 'room_user';

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  supervisor: 'Supervisor',
  operator: 'Operator',
  room_user: 'Pengguna Ruang'
};
