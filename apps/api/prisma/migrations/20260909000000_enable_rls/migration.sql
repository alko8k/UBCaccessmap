-- Enable Row Level Security on every table, with no policies attached.
--
-- Supabase auto-generates a PostgREST API over the `public` schema, reachable
-- with the project's anon key. That key is public by design, so any table
-- without RLS is readable — and potentially writable — by anyone who has it.
-- The exposure that matters here is `User` (UBC email addresses) and the
-- ability to write `role = 'ADMIN'`.
--
-- Enabling RLS with zero policies denies all access through that API. It does
-- not affect this application: the API server connects over the native Postgres
-- protocol as the role that owns these tables, and a table owner bypasses RLS
-- unless FORCE ROW LEVEL SECURITY is set, which it deliberately is not.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MagicLinkToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Building" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Washroom" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WashroomAttribute" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Rating" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataImport" ENABLE ROW LEVEL SECURITY;
