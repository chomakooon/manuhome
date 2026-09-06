import { createClient } from 'npm:@supabase/supabase-js@2.115.0';
import { createAiChatHandler } from './handler.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
Deno.serve(createAiChatHandler({ supabase, apiKey: Deno.env.get('OPENROUTER_API_KEY') }));
