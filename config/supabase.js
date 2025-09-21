import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kybsgddkyshtauvkjfxw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YnNnZGRreXNodGF1dmtqZnh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzMyNzAsImV4cCI6MjA3Mzk0OTI3MH0.fp257DVUGV3RZWDYv6ki2Drx8HsCMH_2u1LZMlIqiIg';

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };