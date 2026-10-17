CREATE TABLE public.company_setup_progress (company_id uuid PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE, step text NOT NULL DEFAULT 'policy' CHECK (step IN ('policy','participants','completed')), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE ON public.company_setup_progress TO authenticated;
GRANT ALL ON public.company_setup_progress TO service_role;
ALTER TABLE public.company_setup_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read own company setup" ON public.company_setup_progress FOR SELECT TO authenticated USING (company_id = public.current_company_id() AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert own company setup" ON public.company_setup_progress FOR INSERT TO authenticated WITH CHECK (company_id = public.current_company_id() AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update own company setup" ON public.company_setup_progress FOR UPDATE TO authenticated USING (company_id = public.current_company_id() AND public.has_role(auth.uid(), 'admin')) WITH CHECK (company_id = public.current_company_id() AND public.has_role(auth.uid(), 'admin'));