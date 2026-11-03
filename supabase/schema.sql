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
-- De app leest alleen haar eigen rij; toegang geven gebeurt via de serverfunctie account (service role).
grant select on public.toegang to authenticated;
revoke insert, update, delete, truncate on public.toegang from authenticated;
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
-- Echt wissen kan niet vanuit de app: verwijderen is een grafsteentje (verwijderd = true).
revoke delete, truncate on public.records from authenticated;
drop policy if exists "records lezen" on public.records;
drop policy if exists "records toevoegen" on public.records;
drop policy if exists "records wijzigen" on public.records;
create policy "records lezen" on public.records for select to authenticated using (public.heeft_toegang());
create policy "records toevoegen" on public.records for insert to authenticated with check (public.heeft_toegang());
create policy "records wijzigen" on public.records for update to authenticated using (public.heeft_toegang()) with check (public.heeft_toegang());

-- Samenvoegen veld per veld, zoals store.pasToe in de app: de recentste versie wint per veld, ontbrekende
-- velden komen erbij. Een grafsteentje (verwijderd) vervangt alles. Een oudere versie overschrijft nooit iets.
-- Verandert er niets, dan gebeurt er niets (geen lege update, geen echo naar het andere toestel).
-- server_tijd en gewijzigd_door zet de database zelf.
create or replace function public.records_stempel() returns trigger
language plpgsql set search_path = public as $$
declare
  samenvoegen boolean;
begin
  if tg_op = 'UPDATE' then
    -- Samenvoegen kan alleen tussen twee gewone records, niet met een grafsteentje.
    samenvoegen := coalesce(not new.verwijderd and not old.verwijderd
      and jsonb_typeof(new.data) = 'object' and jsonb_typeof(old.data) = 'object', false);
    if new.bijgewerkt >= old.bijgewerkt then
      -- Nieuwer: de nieuwe velden winnen, ontbrekende velden blijven staan.
      if samenvoegen then
        new.data := old.data || new.data;
      end if;
    else
      -- Ouder: alleen ontbrekende velden aanvullen; datum en vlag blijven die van de nieuwere versie.
      if not samenvoegen then
        return null;
      end if;
      new.data := new.data || old.data;
      new.bijgewerkt := old.bijgewerkt;
      new.verwijderd := old.verwijderd;
    end if;
    -- Niets veranderd: geen update.
    if new.data = old.data and new.bijgewerkt = old.bijgewerkt and new.verwijderd = old.verwijderd then
      return null;
    end if;
    new.gewijzigd_door := coalesce(auth.jwt() ->> 'email', new.gewijzigd_door, old.gewijzigd_door);
  else
    new.gewijzigd_door := coalesce(auth.jwt() ->> 'email', new.gewijzigd_door);
  end if;
  new.server_tijd := clock_timestamp();
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

-- 6. Tabellen per onderdeel: leesbare overzichten om in de Table Editor van Supabase te openen (alleen lezen).
--    Het zijn views op records met security_invoker, zodat dezelfde toegangsregels gelden als voor records.
--    Verwijderde records staan er niet in. De laatste kolom (data) is altijd het volledige record.
--    Wijzigen gebeurt in de app: die voegt elke bewerking veld per veld samen en stuurt ze naar het andere toestel.
--    Een kolom weghalen of hernoemen kan niet met create or replace view: dan eerst drop view.

-- Sollicitaties: recentst verstuurd (of aangemaakt) bovenaan.
create or replace view public.sollicitaties with (security_invoker = true) as
select
  r.id,
  r.data ->> 'organisatie' as organisatie,
  r.data ->> 'functie' as functie,
  r.data ->> 'status' as status,
  r.data ->> 'spoor' as spoor,
  r.data ->> 'type' as soort,
  r.data ->> 'datumVerstuurd' as verstuurd_op,
  r.data ->> 'opvolgdatum' as opvolgen_op,
  r.data ->> 'gesprekDatum' as gesprek_op,
  r.data ->> 'contactpersoon' as contactpersoon,
  r.data ->> 'contactEmail' as contact_email,
  r.data ->> 'bronUrl' as vacature_link,
  r.data ->> 'notities' as notities,
  r.data ->> 'aangemaakt' as aangemaakt,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data
from public.records r
where r.collectie = 'sollicitaties' and not r.verwijderd
order by coalesce(nullif(r.data ->> 'datumVerstuurd', ''), nullif(r.data ->> 'aangemaakt', '')) desc nulls last, r.data ->> 'organisatie';
comment on view public.sollicitaties is 'Sollicitaties van Remi, zoals in de app (Werk, Sollicitaties). Alleen lezen: wijzigen gebeurt in de app. De kolom data bevat het volledige record, ook het logboek.';

-- Vacatures: recentst toegevoegd bovenaan.
create or replace view public.vacatures with (security_invoker = true) as
select
  r.id,
  r.data ->> 'titel' as titel,
  r.data ->> 'organisatie' as organisatie,
  r.data ->> 'plaats' as plaats,
  r.data ->> 'bron' as bron,
  r.data ->> 'url' as url,
  r.data ->> 'deadline' as deadline,
  r.data ->> 'spoor' as spoor,
  r.data ->> 'status' as status,
  r.data ->> 'toegevoegd' as toegevoegd,
  r.data ->> 'tekst' as tekst,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data
from public.records r
where r.collectie = 'vacatures' and not r.verwijderd
order by nullif(r.data ->> 'toegevoegd', '') desc nulls last, r.data ->> 'titel';
comment on view public.vacatures is 'Bewaarde vacatures, zoals in de app (Werk, Vacatures). Alleen lezen: wijzigen gebeurt in de app. De kolom data bevat het volledige record.';

-- Hotlist: hoogste prioriteit (1) bovenaan.
create or replace view public.hotlist with (security_invoker = true) as
select
  r.id,
  r.data ->> 'naam' as naam,
  r.data ->> 'spoor' as spoor,
  r.data ->> 'type' as soort,
  r.data ->> 'plaats' as plaats,
  r.data ->> 'prioriteit' as prioriteit,
  r.data ->> 'status' as status,
  r.data ->> 'website' as website,
  r.data ->> 'contact' as contact,
  r.data ->> 'rollen' as rollen,
  r.data ->> 'instap' as instap,
  r.data ->> 'notities' as notities,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data
from public.records r
where r.collectie = 'hotlist' and not r.verwijderd
order by case when r.data ->> 'prioriteit' ~ '^[0-9]{1,6}$' then (r.data ->> 'prioriteit')::int end nulls last, r.data ->> 'naam';
comment on view public.hotlist is 'Organisaties om te benaderen, zoals in de app (Werk, Hotlist). Prioriteit 1 is het hoogst. Alleen lezen: wijzigen gebeurt in de app. De kolom data bevat het volledige record.';

-- Stappenplan: per groep, eerstvolgende deadline eerst.
create or replace view public.stappenplan with (security_invoker = true) as
select
  r.id,
  r.data ->> 'groep' as groep,
  r.data ->> 'titel' as titel,
  r.data ->> 'wat' as wat,
  r.data ->> 'wie' as wie,
  r.data ->> 'voor' as voor,
  r.data ->> 'deadline' as deadline,
  r.data ->> 'status' as status,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data
from public.records r
where r.collectie = 'stappenplan' and not r.verwijderd
order by r.data ->> 'groep', nullif(r.data ->> 'deadline', '') nulls last, r.data ->> 'titel';
comment on view public.stappenplan is 'Stappen en taken, zoals in de app (Stappenplan). Alleen lezen: wijzigen gebeurt in de app. De kolom data bevat het volledige record.';

-- Planning: afspraken op datum en uur.
create or replace view public.planning with (security_invoker = true) as
select
  r.id,
  r.data ->> 'datum' as datum,
  r.data ->> 'tijd' as uur,
  r.data ->> 'titel' as titel,
  r.data ->> 'voor' as voor,
  r.data ->> 'plaats' as plaats,
  r.data ->> 'status' as status,
  r.data ->> 'notitie' as notitie,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data
from public.records r
where r.collectie = 'agenda' and not r.verwijderd
order by r.data ->> 'datum', r.data ->> 'tijd' nulls first;
comment on view public.planning is 'Afspraken uit de planning van de app (collectie agenda), op datum en uur. Alleen lezen: wijzigen gebeurt in de app. De kolom data bevat het volledige record.';

-- Documenten: recentst ontvangen (of gedateerd) bovenaan.
create or replace view public.documenten with (security_invoker = true) as
select
  r.id,
  r.data ->> 'titel' as titel,
  r.data ->> 'soort' as soort,
  r.data ->> 'datum' as datum,
  r.data ->> 'ontvangen' as ontvangen,
  r.data ->> 'van' as van,
  r.data ->> 'aan' as aan,
  r.data ->> 'aangetekend' as aangetekend,
  r.data ->> 'samenvatting' as samenvatting,
  case when jsonb_typeof(r.data -> 'bijlagen') = 'array' then jsonb_array_length(r.data -> 'bijlagen') else 0 end as aantal_bijlagen,
  r.data ->> 'notities' as notities,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data
from public.records r
where r.collectie = 'dossier' and not r.verwijderd
order by coalesce(nullif(r.data ->> 'ontvangen', ''), nullif(r.data ->> 'datum', '')) desc nulls last, r.data ->> 'titel';
comment on view public.documenten is 'Brieven en documenten uit het dossier van de app. De bestanden zelf staan in de view bijlagen en in de opslag (bucket bijlagen). Alleen lezen: wijzigen gebeurt in de app. De kolom data bevat het volledige record.';

-- Mails: eerst de gewone mails, dan het archief; recentst bewerkt bovenaan.
create or replace view public.mails with (security_invoker = true) as
select
  r.id,
  r.data ->> 'onderwerp' as onderwerp,
  r.data ->> 'titel' as titel,
  r.data ->> 'naar' as naar,
  r.data ->> 'cc' as cc,
  case when r.data ->> 'soort' = 'archief' then 'gearchiveerd' else r.data ->> 'status' end as status,
  r.data ->> 'verstuurdOp' as verstuurd_op,
  r.data ->> 'verstuurdVan' as verstuurd_van,
  case when jsonb_typeof(r.data -> 'bijlagen') = 'array' then jsonb_array_length(r.data -> 'bijlagen') else 0 end as aantal_bijlagen,
  r.data ->> 'tekst' as tekst,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data
from public.records r
where r.collectie = 'berichten' and not r.verwijderd and r.data ->> 'soort' in ('mail', 'archief')
order by r.data ->> 'soort' = 'archief', r.bijgewerkt desc;
comment on view public.mails is 'E-mails uit de app (Communicatie, E-mails), met concepten, verstuurde en gearchiveerde mails. Alleen lezen: wijzigen en versturen gebeurt in de app. De kolom data bevat het volledige record.';

-- Contactmomenten: recentste bovenaan.
create or replace view public.contactmomenten with (security_invoker = true) as
select
  r.id,
  r.data ->> 'datum' as datum,
  r.data ->> 'met' as met,
  r.data ->> 'kanaal' as kanaal,
  r.data ->> 'richting' as richting,
  r.data ->> 'onderwerp' as onderwerp,
  r.data ->> 'samenvatting' as samenvatting,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data
from public.records r
where r.collectie = 'communicatie' and not r.verwijderd
order by nullif(r.data ->> 'datum', '') desc nulls last, r.bijgewerkt desc;
comment on view public.contactmomenten is 'Contactmomenten (telefoon, mail, gesprek) uit de app (collectie communicatie). Alleen lezen: wijzigen gebeurt in de app. De kolom data bevat het volledige record.';

-- Verkenning: per domein.
create or replace view public.verkenning with (security_invoker = true) as
select
  r.id,
  r.data ->> 'domein' as domein,
  r.data ->> 'naam' as naam,
  r.data ->> 'fit' as fit,
  r.data ->> 'status' as status,
  r.data ->> 'notities' as notities,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data
from public.records r
where r.collectie = 'verkenning' and not r.verwijderd
order by r.data ->> 'domein', r.data ->> 'naam';
comment on view public.verkenning is 'Beroepen en domeinen die Remi verkent, zoals in de app (Verkenning). Alleen lezen: wijzigen gebeurt in de app. De kolom data bevat het volledige record.';

-- Opleidingen: op naam.
create or replace view public.opleidingen with (security_invoker = true) as
select
  r.id,
  r.data ->> 'naam' as naam,
  r.data ->> 'instelling' as instelling,
  r.data ->> 'duur' as duur,
  r.data ->> 'kost' as kost,
  r.data ->> 'status' as status,
  r.data ->> 'url' as url,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data
from public.records r
where r.collectie = 'opleidingen' and not r.verwijderd
order by r.data ->> 'naam';
comment on view public.opleidingen is 'Opleidingen en cursussen, zoals in de app (Opleidingen). Alleen lezen: wijzigen gebeurt in de app. De kolom data bevat het volledige record.';

-- Tests: de zelftests van het welzijn, één rij per test.
create or replace view public.tests with (security_invoker = true) as
select
  r.id as test,
  r.data ->> 'datum' as datum,
  r.data -> 'scores' as scores,
  r.data ->> 'extra' as extra,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data
from public.records r
where r.collectie = 'welzijn' and not r.verwijderd
order by r.id;
comment on view public.tests is 'Zelftests uit de app (Welzijn, collectie welzijn): datum, scores per schaal en de extra vraag. Zelftests, geen diagnose. Alleen lezen: wijzigen gebeurt in de app. De kolom data bevat ook de antwoorden per vraag.';

-- Dagboek: recentste dag bovenaan.
create or replace view public.dagboek with (security_invoker = true) as
select
  r.id,
  r.data ->> 'datum' as datum,
  r.data ->> 'bed' as naar_bed,
  r.data ->> 'op' as opgestaan,
  r.data ->> 'energieMiddag' as energie_middag,
  r.data ->> 'energieAvond' as energie_avond,
  r.data ->> 'stemming' as stemming,
  r.data ->> 'werkuren' as werkuren,
  r.data ->> 'hoofdpijn' as hoofdpijn,
  r.data ->> 'teLaat' as te_laat,
  r.data ->> 'notitie' as notitie,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data
from public.records r
where r.collectie = 'dagboek' and not r.verwijderd
order by nullif(r.data ->> 'datum', '') desc nulls last;
comment on view public.dagboek is 'Dagboek uit de app (Welzijn, Dagboek): slaap, energie en stemming (0 tot 10), werkuren, hoofdpijn en te laat. Alleen lezen: wijzigen gebeurt in de app. De kolom data bevat het volledige record.';

-- Bijlagen: één rij per bestand bij een document of een mail, en of het bestand in de opslag staat.
--    Het pad in de opslag is het id van de bijlage met dezelfde vervanging van tekens als in backend.js (PAD).
create or replace view public.bijlagen with (security_invoker = true) as
select
  case r.collectie when 'dossier' then 'document' else 'mail' end as bij,
  r.id as record_id,
  coalesce(r.data ->> 'titel', r.data ->> 'onderwerp') as bij_titel,
  e.bijlage ->> 'naam' as bestandsnaam,
  e.bijlage ->> 'type' as soort,
  e.bijlage ->> 'id' as pad,
  o.id is not null as in_opslag,
  case when o.metadata ->> 'size' ~ '^[0-9]{1,18}$' then (o.metadata ->> 'size')::bigint end as grootte_bytes,
  coalesce(o.updated_at, o.created_at) as opgeladen_op
from public.records r
cross join lateral jsonb_array_elements(case when jsonb_typeof(r.data -> 'bijlagen') = 'array' then r.data -> 'bijlagen' else '[]'::jsonb end) as e(bijlage)
left join lateral (
  select s.id, s.metadata, s.created_at, s.updated_at
  from storage.objects s
  where s.bucket_id = 'bijlagen' and s.name = regexp_replace(e.bijlage ->> 'id', '[^A-Za-z0-9/_.-]', '_', 'g')
  limit 1
) o on true
where r.collectie in ('dossier', 'berichten') and not r.verwijderd
order by bij, bij_titel, bestandsnaam;
comment on view public.bijlagen is 'Alle bijlagen (foto''s en pdf''s) bij documenten en mails. in_opslag zegt of het bestand in de opslag staat (bucket bijlagen, map volgens pad); grootte en datum komen uit de opslag. Alleen lezen: toevoegen en verwijderen gebeurt in de app.';

-- Alleen lezen, en alleen voor wie aangemeld is (de regels van records bepalen wat iemand ziet).
revoke all on public.sollicitaties, public.vacatures, public.hotlist, public.stappenplan, public.planning, public.documenten, public.mails,
  public.contactmomenten, public.verkenning, public.opleidingen, public.tests, public.dagboek, public.bijlagen from anon, authenticated;
grant select on public.sollicitaties, public.vacatures, public.hotlist, public.stappenplan, public.planning, public.documenten, public.mails,
  public.contactmomenten, public.verkenning, public.opleidingen, public.tests, public.dagboek, public.bijlagen to authenticated;

-- 7. Toegang geven gebeurt met een toegangscode in de app (functie account). Een eerste code zet je zo klaar
--    (met de hash van de code; de code zelf nooit in de repository):
-- insert into public.account_code (code_hash, wie, verloopt) values (encode(sha256('CODE'::bytea), 'hex'), 'giulia', now() + interval '7 days');
-- Of rechtstreeks een adres toegang geven:
-- insert into public.toegang (email, wie) values ('adres-van-giulia@voorbeeld.be', 'giulia'), ('adres-van-remi@voorbeeld.be', 'remi')
--   on conflict (email) do update set wie = excluded.wie;
