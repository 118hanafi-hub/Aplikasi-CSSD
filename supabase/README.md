# Supabase backend foundation

This folder contains the first shared-database schema for the CSSD app. It supports account profiles/roles, instrument inventory and set composition, dirty returns, sterilization cycles and packages, temperature logs, maintenance records, and database-triggered audit history.

## Important

The current React prototype still uses browser `localStorage`; it does **not** connect to this schema yet. Applying the migration alone will not make the prototype share data between phones or users. Do not enter real operational or patient data into the prototype.

## Prepare a Supabase project

1. Create a Supabase project under the facility's account and keep project ownership with the facility.
2. In Supabase SQL Editor, run `migrations/202611100001_initial_cssd_schema.sql`.
3. Create individual accounts through Supabase Auth (do not share accounts). New accounts receive the `operator` role by default.
4. An administrator can set roles in the protected `profiles` table: `admin`, `supervisor`, `operator`, or `room_user`. Do not expose a service-role key in the browser or commit it to GitHub.
5. The frontend still needs a follow-up integration to use Supabase Auth and query these tables. Only then will data be shared across devices and support concurrent users.

## Tables

- `profiles`: identity and role; elevated roles are admin-managed.
- `instrument_items`, `instrument_sets`, `instrument_set_items`: individually identified instruments and set composition.
- `dirty_returns`: receipt of soiled instruments from a room.
- `sterilization_cycles`, `sterile_packages`: cycle/lot and package records. Packages have a random QR token and a contents snapshot.
- `temperature_logs`, `maintenance_records`: operational logs.
- `audit_events`: append-only trigger-generated record of data changes.

Row-level security is enabled. Signed-in accounts can read working records; CSSD roles can create/update, only admins can delete, and room users can submit/read their own dirty-return records. Audit history is readable by administrators and supervisors only. Validate these policies with the facility's actual roles and workflow before production use.

The schema is a starting point, not a validated clinical or regulatory workflow. Configure sterilization parameters, release criteria, and expiry rules only from approved facility SOPs and applicable standards.
