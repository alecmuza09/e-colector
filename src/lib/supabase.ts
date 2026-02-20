import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wrmabdjtlefnxvdtxww.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybWFidGRqdGxlZm54dmR0eHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2Mjc3MDUsImV4cCI6MjA4MTIwMzcwNX0.BnDL0cgFPERxhfyCvh6omZ-gKW0sJeVJscySDuCF92s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
