# Architecture rules
- Keep public marketing content in the index route, using existing semantic tokens and UI components so presentation changes do not alter application workflows.
- Reuse the existing customer-service channel for sales and demonstration requests; do not introduce lead forms without persistent delivery.
- Share setup upload and participant components between onboarding entry points; use authenticated company-scoped progress so refreshes do not restart setup.
- Use the existing policy extraction RPC for all setup uploads; filename-only API adapters cannot activate a policy.