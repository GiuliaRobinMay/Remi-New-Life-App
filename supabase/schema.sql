-- Centrale database voor de app "Nieuwe start" (Remi en Giulia).
-- Eenmalig uitvoeren in Supabase (SQL Editor of via de connector). Opnieuw uitvoeren kan geen kwaad.
-- De adressen met toegang staan NIET in dit bestand (de repository is openbaar); die komen in de tabel toegang.

-- 1. Wie mag erin: alleen de adressen in deze tabel zien en wijzigen gegevens.
create table if not exists public.toegang (
  email text primary key,
  wie text not null check (wie in ('remi', 'giulia'))
);
alter table public.toegang enable row level security;
revoke all on public.toegang from anon;
drop policy if exists "toegang: eigen rij lezen" on public.toegang;
create policy "toegang: eigen rij lezen" on public.toegang
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create or replace function public.heeft_toegang() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.toegang t where lower(t.email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function public.heeft_toegang() from public, anon;
grant execute on function public.heeft_toegang() to authenticated;

-- 2. Alle gegevens van de app: één rij per record (mail, stap, afspraak, document, testantwoorden, ...).
--    data = het volledige record zoals de app het bewaart; verwijderen gebeurt met verwijderd = true.
create table if not exists public.records (
  collectie text not null,
  id text not null,
  data jsonb not null,
  bijgewerkt timestamptz not null,
  verwijderd boolean not null default false,
  gewijzigd_door text,
  server_tijd timestamptz not null default clock_timestamp(),
  primary key (collectie, id)
);
create index if not exists records_server_tijd on public.records (server_tijd);
alter table public.records enable row level security;
revoke all on public.records from anon;
grant select, insert, update on public.records to authenticated;
drop policy if exists "records lezen" on public.records;
drop policy if exists "records toevoegen" on public.records;
drop policy if exists "records wijzigen" on public.records;
create policy "records lezen" on public.records for select to authenticated using (public.heeft_toegang());
create policy "records toevoegen" on public.records for insert to authenticated with check (public.heeft_toegang());
create policy "records wijzigen" on public.records for update to authenticated using (public.heeft_toegang()) with check (public.heeft_toegang());

-- De laatste bewerking wint: een oudere versie overschrijft nooit een nieuwere.
-- server_tijd en gewijzigd_door zet de database zelf.
create or replace function public.records_stempel() returns trigger
language plpgsql as $$
begin
  if tg_op = 'UPDATE' and new.bijgewerkt < old.bijgewerkt then
    return null;
  end if;
  new.server_tijd := clock_timestamp();
  new.gewijzigd_door := coalesce(auth.jwt() ->> 'email', new.gewijzigd_door);
  return new;
end $$;
drop trigger if exists records_stempel on public.records;
create trigger records_stempel before insert or update on public.records
  for each row execute function public.records_stempel();

-- Wijzigingen meteen doorsturen naar het andere toestel.
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'records') then
    alter publication supabase_realtime add table public.records;
  end if;
end $$;

-- 3. Bijlagen (foto's en pdf's): een afgeschermde opslagmap, niet openbaar.
insert into storage.buckets (id, name, public, file_size_limit)
values ('bijlagen', 'bijlagen', false, 52428800)
on conflict (id) do update set public = false;
drop policy if exists "bijlagen lezen" on storage.objects;
drop policy if exists "bijlagen toevoegen" on storage.objects;
drop policy if exists "bijlagen wijzigen" on storage.objects;
drop policy if exists "bijlagen verwijderen" on storage.objects;
create policy "bijlagen lezen" on storage.objects for select to authenticated using (bucket_id = 'bijlagen' and public.heeft_toegang());
create policy "bijlagen toevoegen" on storage.objects for insert to authenticated with check (bucket_id = 'bijlagen' and public.heeft_toegang());
create policy "bijlagen wijzigen" on storage.objects for update to authenticated using (bucket_id = 'bijlagen' and public.heeft_toegang()) with check (bucket_id = 'bijlagen' and public.heeft_toegang());
create policy "bijlagen verwijderen" on storage.objects for delete to authenticated using (bucket_id = 'bijlagen' and public.heeft_toegang());

-- 4. Mail versturen vanaf het Gmail-adres van Remi (serverfunctie supabase/functions/gmail).
--    Deze tabellen hebben RLS aan en GEEN regels: alleen de serverfunctie (service role) kan erbij,
--    nooit de app in de browser. Zo blijven het clientgeheim en de toestemming van Remi afgeschermd.
create table if not exists public.gmail_app (
  id int primary key default 1 check (id = 1),
  client_id text not null,
  client_secret text not null,
  ingesteld_door text,
  ingesteld_op timestamptz not null default now()
);
create table if not exists public.gmail_koppeling (
  id int primary key default 1 check (id = 1),
  email text not null,
  refresh_token text not null,
  gekoppeld_op timestamptz not null default now(),
  gekoppeld_door text
);
create table if not exists public.gmail_uitnodiging (
  state text primary key,
  aangemaakt_door text not null,
  verloopt timestamptz not null
);
alter table public.gmail_app enable row level security;
alter table public.gmail_koppeling enable row level security;
alter table public.gmail_uitnodiging enable row level security;
revoke all on public.gmail_app, public.gmail_koppeling, public.gmail_uitnodiging from anon, authenticated;

-- 5. Toegangscodes om een account te maken of een nieuw wachtwoord te kiezen (serverfunctie supabase/functions/account).
--    Alleen de hash van de code wordt bewaard; de app kan deze tabel niet lezen.
create table if not exists public.account_code (
  code_hash text primary key,
  wie text not null check (wie in ('remi', 'giulia')),
  verloopt timestamptz not null,
  gebruikt_op timestamptz,
  aangemaakt_door text
);
alter table public.account_code enable row level security;
revoke all on public.account_code from anon, authenticated;

-- 6. Toegang geven gebeurt met een toegangscode in de app (functie account). Een eerste code zet je zo klaar
--    (met de hash van de code; de code zelf nooit in de repository):
-- insert into public.account_code (code_hash, wie, verloopt) values (encode(sha256('CODE'::bytea), 'hex'), 'giulia', now() + interval '7 days');
-- Of rechtstreeks een adres toegang geven:
-- insert into public.toegang (email, wie) values ('adres-van-giulia@voorbeeld.be', 'giulia'), ('adres-van-remi@voorbeeld.be', 'remi')
--   on conflict (email) do update set wie = excluded.wie;
