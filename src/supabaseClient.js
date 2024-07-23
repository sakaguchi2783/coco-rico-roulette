// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cwmpzcqnjlbfmximqkkq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bXB6Y3FuamxiZm14aW1xa2txIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDE1Mjg5NiwiZXhwIjoyMDM1NzI4ODk2fQ.8SnSyn3SCVbSGeNgdV9VMaV6kJLwximYBkeV6aDdhF8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
