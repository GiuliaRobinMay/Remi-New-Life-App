// Supabase Edge Function "gmail". Uitrollen zonder JWT-controle (verify_jwt = false): Google stuurt de browser van Remi
// zonder aanmelding terug naar deze functie (beveiligd met de state uit de koppellink); de acties uit de app
// controleren zelf de aanmelding. Optioneel GOOGLE_CLIENT_ID en GOOGLE_CLIENT_SECRET als geheimen van de functie:
// die gaan voor op wat in de app ingesteld werd.
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';
import { maakHandler } from './handler.ts';

const url = Deno.env.get('SUPABASE_URL')!;
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
Deno.serve(maakHandler(admin as never, {
  SUPABASE_URL: url,
  GOOGLE_CLIENT_ID: Deno.env.get('GOOGLE_CLIENT_ID') || '',
  GOOGLE_CLIENT_SECRET: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
}, fetch));
