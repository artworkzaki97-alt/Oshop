import { createClient } from '@supabase/supabase-js';
import 'server-only';

// Hardcoded credentials for Server-Side Admin operations (Bypasses RLS)
// WARN: This file must NEVER be imported on the client side.
const supabaseUrl = 'https://tflgxjuwjfljngzwbgiv.supabase.co';
const supabaseServiceRoleKey = 'sb_secret_wciMupmvgLkiO2NG8Yq1aw__rkgdkQw';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
