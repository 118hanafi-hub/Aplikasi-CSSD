export const supabaseSql = `
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  role text not null default 'operator',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists instrument_sets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text default 'ready',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists instrument_items (
  id uuid primary key default gen_random_uuid(),
  set_id uuid references instrument_sets(id) on delete cascade,
  item_name text not null,
  qty int not null default 1,
  created_at timestamptz default now()
);

create table if not exists dirty_returns (
  id uuid primary key default gen_random_uuid(),
  origin_room text not null,
  description text not null,
  qty int not null default 1,
  condition text not null,
  received_by text not null,
  created_at timestamptz default now()
);

create table if not exists sterilization_cycles (
  id uuid primary key default gen_random_uuid(),
  cycle_no text not null unique,
  package_name text not null,
  method text not null,
  machine text not null,
  operator text not null,
  status text default 'waiting',
  sterilized_at timestamptz,
  expired_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists package_labels (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid references sterilization_cycles(id) on delete cascade,
  contents text not null,
  qr_code text,
  status text default 'waiting',
  created_at timestamptz default now()
);

create table if not exists temperature_logs (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  value_c numeric not null,
  note text,
  recorded_by text not null,
  created_at timestamptz default now()
);

create table if not exists maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  machine text not null,
  activity text not null,
  due_date date,
  status text default 'scheduled',
  officer text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table instrument_sets enable row level security;
alter table instrument_items enable row level security;
alter table dirty_returns enable row level security;
alter table sterilization_cycles enable row level security;
alter table package_labels enable row level security;
alter table temperature_logs enable row level security;
alter table maintenance_logs enable row level security;

create policy if not exists "authenticated_users_can_read" on profiles for select using (auth.role() = 'authenticated');
create policy if not exists "authenticated_users_can_manage" on dirty_returns for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists "authenticated_users_can_manage_cycles" on sterilization_cycles for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists "authenticated_users_can_manage_temp" on temperature_logs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists "authenticated_users_can_manage_maintenance" on maintenance_logs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists "authenticated_users_can_manage_sets" on instrument_sets for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists "authenticated_users_can_manage_items" on instrument_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists "authenticated_users_can_manage_labels" on package_labels for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
`;
