REVOKE EXECUTE ON FUNCTION public.resolve_catchall_company() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.resolve_catchall_company() TO service_role;