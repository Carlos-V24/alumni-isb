import { createBrowserClient } from '@supabase/ssr';

// Este cliente sincroniza automáticamente la sesión con las cookies del navegador
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);