-- Correct the initial permissive policies so room_user accounts cannot read
-- operational records belonging to other rooms/users. PostgreSQL combines
-- permissive policies with OR, so the original broad dirty_returns policy must
-- be replaced, not supplemented.
drop policy if exists staff_read_dirty_returns on public.dirty_returns;
drop policy if exists "room users read own dirty returns" on public.dirty_returns;

create policy "CSSD staff read dirty returns" on public.dirty_returns for select to authenticated
  using (public.cssd_has_role(array['admin', 'supervisor', 'operator']::public.cssd_role[]));
create policy "room users read own dirty returns" on public.dirty_returns for select to authenticated
  using (received_by = (select auth.uid()) and public.cssd_has_role(array['room_user']::public.cssd_role[]));
