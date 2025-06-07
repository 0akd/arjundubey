import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fjkgoytvsbubhrnudklo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqa2dveXR2c2J1YmhybnVka2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjYyMDEsImV4cCI6MjA2NDgwMjIwMX0.jFIvySIayfigk2w0sdQELbAzlv6onG0YbbdXsEeYLZo';
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;