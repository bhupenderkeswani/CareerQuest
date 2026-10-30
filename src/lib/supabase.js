// Supabase client. Configured through web/.env.local (see .env.example). Without it the app runs
// entirely on its bundled sample data, so a missing or wrong key never breaks the app.
import { createClient } from '@supabase/supabase-js';

// Tolerate pasted quotes, a trailing slash or a "/rest/v1" suffix.
const clean = (v) => String(v || '').trim().replace(/^["']|["']$/g, '').trim();
const url = clean(import.meta.env.VITE_SUPABASE_URL).replace(/\/+$/, '').replace(/\/(rest|auth)\/v1$/, '');
const key = clean(import.meta.env.VITE_SUPABASE_ANON_KEY);

// A service-role key bypasses row-level security. If one is ever pasted here it would ship to every
// student's browser, so refuse it outright.
function claimsOf(k) {
  try {
    return JSON.parse(atob(k.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return {}; // not a JWT (for example the newer sb_publishable_ keys): fine
  }
}

let usable = Boolean(url && key && /^https?:\/\//.test(url));
export let configProblem = null;
if (usable) {
  const claims = claimsOf(key);
  let host = '';
  try { host = new URL(url).hostname; } catch { /* checked by the regex above */ }
  if (claims.role === 'service_role' || key.startsWith('sb_secret_')) {
    configProblem = 'VITE_SUPABASE_ANON_KEY holds a secret/service-role key. Use the anon (publishable) key. Ignoring Supabase until fixed.';
  } else if (host === 'supabase.com' || host.endsWith('.supabase.com')) {
    // The website and dashboard, not your project's API. Browsers show the resulting failure as a CORS error.
    configProblem = `VITE_SUPABASE_URL is ${url}, which is the Supabase website. Use your project's API URL, which looks like https://<project-ref>.supabase.co (Project Settings > API).`;
  } else if (claims.ref && host.endsWith('.supabase.co') && host !== `${claims.ref}.supabase.co`) {
    configProblem = `VITE_SUPABASE_URL (${host}) and the anon key belong to different projects (the key is for ${claims.ref}). Copy both from the same project.`;
  }
  if (configProblem) { usable = false; console.error('[supabase] ' + configProblem + ' Using the bundled sample data instead.'); }
}

export const isConfigured = usable;

// The public key only. A session exists for signed-in students and for reviewers.
export const supabase = usable
  ? createClient(url, key, {
      // PKCE puts ?code= in the query string on the way back from Google, which works with hash routes.
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce', storageKey: 'cq-auth' },
    })
  : null;
