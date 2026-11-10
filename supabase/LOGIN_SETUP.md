# Login integration setup

The frontend can use Supabase Auth when environment variables are configured. This is an incremental login step; operational forms still use browser-local demo data and have not yet been connected to the shared database.

1. Create a Supabase project owned by the facility.
2. Apply the initial schema migration and then `202611100002_fix_room_user_return_policies.sql` in the SQL Editor.
3. In Supabase Project Settings → API, copy the Project URL and the public anon/publishable key. Never put a `service_role` secret in frontend environment variables.
4. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Create individual staff accounts in Supabase Auth; disable public sign-up. The database trigger creates each profile with the least-privileged `operator` role. Assign roles only through an administrator-controlled workflow.
6. Restart Vite after changing environment variables.

Do not deploy the login or enter operational data until database policies have been reviewed by the facility. The UI displays an explicit warning that its records remain local even after login; shared CRUD integration is a separate next step. Do not use patient-identifying information in this prototype.
