ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS is_catchall_default boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS companies_single_catchall_default
  ON public.companies (is_catchall_default)
  WHERE is_catchall_default = true;

UPDATE public.companies SET is_catchall_default = false WHERE is_catchall_default = true;
UPDATE public.companies SET is_catchall_default = true
  WHERE id = '00b28419-606b-4f4f-9138-6f562d8dc1cb';

CREATE OR REPLACE FUNCTION public.resolve_catchall_company()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id FROM public.companies WHERE is_catchall_default = true LIMIT 1
$function$;