-- Deprecated: this standalone setup script is intentionally disabled.
-- The old version installed broad client permissions and diverged from the app.
-- Apply the complete versioned history in supabase/migrations using `supabase db push`.
-- Review and test migrations in a staging project before applying to production.
-- Existing installations must include the 20260906 security and checkout migrations.
DO $$
BEGIN
  RAISE EXCEPTION 'Use supabase/migrations; this legacy setup entry point is disabled';
END;
$$;
