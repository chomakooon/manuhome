import { createClient } from 'npm:@supabase/supabase-js@2.115.0';
import { createContactHandler } from './handler.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
Deno.serve(createContactHandler({ supabase }));
