// Supabase Edge Function "account". Uitrollen zonder JWT-controle (verify_jwt = false): een account maken
// gebeurt vóór de aanmelding en wordt beveiligd met een eenmalige toegangscode; 'code' controleert zelf de aanmelding.
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';
import { maakHandler } from './handler.ts';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
Deno.serve(maakHandler(admin as never));
