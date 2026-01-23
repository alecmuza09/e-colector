import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tgadxzrlpauyjmwbqkqf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dGyP1IaMaiORG0PI2UOcEQ_RD6dGa3D';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
