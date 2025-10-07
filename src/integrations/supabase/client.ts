import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qtbmhznjijmpvcusiznk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0Ym1oem5qaWptcHZjdXNpem5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0OTQ1NTIsImV4cCI6MjA3MTA3MDU1Mn0.00juQfr9Nk0FaQcksaTerc3XS4vJpcSX0kO9rWU3REw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);