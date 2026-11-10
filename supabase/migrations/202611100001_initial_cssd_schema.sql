-- CSSD shared-data foundation for Supabase/PostgreSQL.
-- Apply only after creating a Supabase project. This migration does not connect the current UI by itself.

create extension if not exists pgcrypto;

create type public.cssd_role as enum ('admin', 'supervisor', 'operator', 'room_user');

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.cssd_role not null default 'operator',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- New accounts receive the least-privileged default role. An administrator must
-- assign elevated roles; users cannot change their own role through the client.
create or replace function public.create_cssd_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'operator')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_cssd
  after insert on auth.users
  for each row execute procedure public.create_cssd_profile();

create or replace function public.cssd_has_role(allowed public.cssd_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.active
      and p.role = any (allowed)
  );
$$;

create table public.instrument_items (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text not null default 'Instrumen',
  location text not null default '',
  condition text not null default 'good' check (condition in ('good', 'needs_check', 'repair', 'retired')),
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.instrument_sets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  location text not null default '',
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.instrument_set_items (
  set_id uuid not null references public.instrument_sets(id) on delete cascade,
  instrument_id uuid not null references public.instrument_items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  primary key (set_id, instrument_id)
);

create table public.dirty_returns (
  id uuid primary key default gen_random_uuid(),
  origin text not null,
  description text not null,
  instrument_item_id uuid references public.instrument_items(id) on delete set null,
  instrument_set_id uuid references public.instrument_sets(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  condition text not null default 'dirty_intact',
  status text not null default 'received_dirty' check (status in ('received_dirty', 'needs_review', 'processing', 'closed')),
  received_by uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  received_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sterilization_cycles (
  id uuid primary key default gen_random_uuid(),
  cycle_number text not null,
  lot_number text not null,
  machine_number text not null,
  method text not null,
  status text not null default 'prepared' check (status in ('prepared', 'running', 'passed', 'failed', 'held', 'cancelled')),
  prepared_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  operator_id uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  result_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (machine_number, cycle_number)
);

create table public.sterile_packages (
  id uuid primary key default gen_random_uuid(),
  package_code text not null unique,
  qr_token uuid not null unique default gen_random_uuid(),
  cycle_id uuid not null references public.sterilization_cycles(id) on delete restrict,
  instrument_set_id uuid references public.instrument_sets(id) on delete restrict,
  contents_snapshot jsonb not null default '[]'::jsonb,
  sterilized_at date,
  expiry_date date,
  method text not null,
  machine_number text not null,
  cycle_number text not null,
  operator_id uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  status text not null default 'awaiting_cycle' check (status in ('awaiting_cycle', 'in_process', 'released', 'held', 'failed', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expiry_date is null or sterilized_at is null or expiry_date >= sterilized_at)
);

create table public.temperature_logs (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  measured_value numeric(7,2) not null,
  unit text not null default 'C' check (unit in ('C', 'F')),
  recorded_at timestamptz not null default now(),
  recorded_by uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  notes text,
  created_at timestamptz not null default now()
);

create table public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  machine_number text not null,
  activity_type text not null check (activity_type in ('routine', 'repair', 'calibration', 'inspection', 'other')),
  description text not null default '',
  scheduled_for date,
  completed_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  technician_name text not null default '',
  recorded_by uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id text not null,
  operation text not null check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  actor_id uuid references public.profiles(id) on delete set null default auth.uid(),
  occurred_at timestamptz not null default now(),
  before_data jsonb,
  after_data jsonb
);

create or replace function public.audit_cssd_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_row jsonb;
  new_row jsonb;
  row_id text;
begin
  if tg_op = 'INSERT' then
    new_row := to_jsonb(new);
    row_id := new_row ->> 'id';
  elsif tg_op = 'UPDATE' then
    old_row := to_jsonb(old);
    new_row := to_jsonb(new);
    row_id := coalesce(new_row ->> 'id', new_row ->> 'set_id');
  else
    old_row := to_jsonb(old);
    row_id := coalesce(old_row ->> 'id', old_row ->> 'set_id');
  end if;
  insert into public.audit_events (table_name, record_id, operation, actor_id, before_data, after_data)
  values (tg_table_name, coalesce(row_id, 'unknown'), tg_op, auth.uid(), old_row, new_row);
  return coalesce(new, old);
end;
$$;

-- Immutable history is recorded for operational changes. Sensitive credentials
-- are not stored in these application tables.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['profiles', 'instrument_items', 'instrument_sets', 'instrument_set_items', 'dirty_returns', 'sterilization_cycles', 'sterile_packages', 'temperature_logs', 'maintenance_records']
  loop
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute procedure public.audit_cssd_change()', table_name, table_name);
  end loop;
end;
$$;

create trigger touch_profiles_updated_at before update on public.profiles for each row execute procedure public.touch_updated_at();
create trigger touch_instrument_items_updated_at before update on public.instrument_items for each row execute procedure public.touch_updated_at();
create trigger touch_instrument_sets_updated_at before update on public.instrument_sets for each row execute procedure public.touch_updated_at();
create trigger touch_dirty_returns_updated_at before update on public.dirty_returns for each row execute procedure public.touch_updated_at();
create trigger touch_sterilization_cycles_updated_at before update on public.sterilization_cycles for each row execute procedure public.touch_updated_at();
create trigger touch_sterile_packages_updated_at before update on public.sterile_packages for each row execute procedure public.touch_updated_at();
create trigger touch_maintenance_records_updated_at before update on public.maintenance_records for each row execute procedure public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.instrument_items enable row level security;
alter table public.instrument_sets enable row level security;
alter table public.instrument_set_items enable row level security;
alter table public.dirty_returns enable row level security;
alter table public.sterilization_cycles enable row level security;
alter table public.sterile_packages enable row level security;
alter table public.temperature_logs enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.audit_events enable row level security;

create policy "users read their own profile or admins read all" on public.profiles for select to authenticated using (id = (select auth.uid()) or public.cssd_has_role(array['admin']::public.cssd_role[]));
create policy "admins update profiles" on public.profiles for update to authenticated using (public.cssd_has_role(array['admin']::public.cssd_role[])) with check (public.cssd_has_role(array['admin']::public.cssd_role[]));

-- All signed-in CSSD staff can read the working records. Operational writes are
-- limited to admin, supervisor, and operator roles.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['instrument_items', 'instrument_sets', 'instrument_set_items', 'dirty_returns', 'sterilization_cycles', 'sterile_packages', 'temperature_logs', 'maintenance_records']
  loop
    execute format('create policy %I on public.%I for select to authenticated using (public.cssd_has_role(array[''admin'', ''supervisor'', ''operator'', ''room_user'']::public.cssd_role[]))', 'staff_read_' || table_name, table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.cssd_has_role(array[''admin'', ''supervisor'', ''operator'']::public.cssd_role[]))', 'cssd_insert_' || table_name, table_name);
    execute format('create policy %I on public.%I for update to authenticated using (public.cssd_has_role(array[''admin'', ''supervisor'', ''operator'']::public.cssd_role[])) with check (public.cssd_has_role(array[''admin'', ''supervisor'', ''operator'']::public.cssd_role[]))', 'cssd_update_' || table_name, table_name);
    execute format('create policy %I on public.%I for delete to authenticated using (public.cssd_has_role(array[''admin'']::public.cssd_role[]))', 'admin_delete_' || table_name, table_name);
  end loop;
end;
$$;

-- Room users may submit dirty-return records under their own identity, but may
-- not edit or delete them. CSSD roles retain the normal operational policies.
create policy "room users submit own dirty returns" on public.dirty_returns for insert to authenticated
  with check (received_by = (select auth.uid()) and public.cssd_has_role(array['room_user']::public.cssd_role[]));
create policy "room users read own dirty returns" on public.dirty_returns for select to authenticated
  using (received_by = (select auth.uid()) and public.cssd_has_role(array['room_user']::public.cssd_role[]));

create policy "admins and supervisors read audit history" on public.audit_events for select to authenticated
  using (public.cssd_has_role(array['admin', 'supervisor']::public.cssd_role[]));
-- No client INSERT/UPDATE/DELETE policy for audit_events: triggers only.

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.instrument_items, public.instrument_sets, public.instrument_set_items, public.dirty_returns, public.sterilization_cycles, public.sterile_packages, public.temperature_logs, public.maintenance_records to authenticated;
grant select on public.audit_events to authenticated;
grant usage, select on sequence public.audit_events_id_seq to authenticated;
grant execute on function public.cssd_has_role(public.cssd_role[]) to authenticated;
