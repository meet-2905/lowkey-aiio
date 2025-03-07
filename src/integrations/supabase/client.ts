
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nlvksfcbajxhjxkeltjk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdmtzZmNiYWp4aGp4a2VsdGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODQ3NDIsImV4cCI6MjA1Njg2MDc0Mn0.pBNqePAKNFCj1oiZN6np6ihZt1u55LcUVASRuFNMO3s";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
