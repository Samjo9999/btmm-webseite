// CORS Allow-All (*) is intentional for Supabase Edge Functions.
// Actual access control is enforced via JWT tokens (Authorization header),
// not via CORS origin restrictions. The browser's same-origin policy is a
// UX safeguard, not a security boundary for API endpoints. Restricting
// origins here would break Capacitor mobile apps (which have no web origin)
// and local development without adding meaningful security.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
