-- Centrale database voor de app "Nieuwe start" (Remi en Giulia).
-- Eenmalig uitvoeren in Supabase (SQL Editor of via de connector). Opnieuw uitvoeren kan geen kwaad.
-- De adressen met toegang staan NIET in dit bestand (de repository is openbaar); die komen via de serverfunctie
-- account in de tabel toegang (zie 7 onderaan).

-- 1. Wie mag erin: alleen accounts met een rij in deze tabel zien en wijzigen gegevens.
--    Toegang hangt aan het account (user_id), niet aan het e-mailadres: wie later een account maakt met een adres
--    uit deze tabel, of het adres van zijn account daarin verandert, krijgt zo geen toegang.
--    Rijen komen er alleen via de serverfunctie account (service role), met een toegangscode.
create table if not exists public.toegang (
  email text primary key,
  wie text not null check (wie in ('remi', 'giulia')),
  user_id uuid unique references auth.users (id) on delete cascade
);
-- Eenmalige overgang voor een database van vóór user_id: een rij krijgt het account met hetzelfde bevestigde
-- e-mailadres (zoals de vorige regel met de e-mailclaim het al toeliet). Daarna gebeurt dit nooit meer vanzelf.
do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'toegang' and column_name = 'user_id') then
    alter table public.toegang add column user_id uuid unique references auth.users (id) on delete cascade;
    update public.toegang t set user_id = u.id from auth.users u
      where lower(u.email) = lower(t.email) and u.email_confirmed_at is not null;
  end if;
end $$;
alter table public.toegang enable row level security;
-- De app leest alleen haar eigen rij; toegang geven gebeurt via de serverfunctie account (service role).
revoke all on public.toegang from anon, authenticated;
grant select on public.toegang to authenticated;
drop policy if exists "toegang: eigen rij lezen" on public.toegang;
create policy "toegang: eigen rij lezen" on public.toegang
  for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.heeft_toegang() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.toegang t where t.user_id = auth.uid());
$$;
revoke all on function public.heeft_toegang() from public, anon;
grant execute on function public.heeft_toegang() to authenticated;

-- 2. Alle gegevens van de app: één rij per record (mail, stap, afspraak, document, testantwoorden, ...).
--    data = het volledige record zoals de app het bewaart, met in data._t per veld de stempel (ISO-tekst) van de
--    laatste wijziging van dat veld. De kolommen bijgewerkt en verwijderd zijn altijd data.bijgewerkt en
--    data.verwijderd. Verwijderen gebeurt met een grafsteentje: {id, verwijderd: true, bijgewerkt, _t: {}}.
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
create policy "records lezen" on public.records for select to authenticated using ((select public.heeft_toegang()));
create policy "records toevoegen" on public.records for insert to authenticated with check ((select public.heeft_toegang()));
create policy "records wijzigen" on public.records for update to authenticated using ((select public.heeft_toegang())) with check ((select public.heeft_toegang()));

-- Samenvoegen met stempels per veld, met exact dezelfde regels als store.pasToe in de app:
-- 1. Is een van beide versies een grafsteentje, dan wint de versie met de hoogste bijgewerkt volledig; bij een
--    gelijke bijgewerkt wint het grafsteentje. Een herleefd record (niet verwijderd, nieuwer dan het grafsteentje)
--    vervangt het grafsteentje dus volledig.
-- 2. Anders per veld: de waarde met de hoogste _t[veld] wint (een ontbrekende stempel telt als lege tekst, dus
--    laagst). Bij een gelijke stempel wint de waarde met de grootste JSON-tekst, zodat elk toestel hetzelfde kiest
--    (hier waarde::text van jsonb: voor tekst, getallen, true, false en null gelijk aan JSON.stringify; bij objecten
--    en lijsten zet jsonb de sleutels in een vaste volgorde en spaties na ':' en ',').
--    Velden die maar aan één kant bestaan, blijven. _t wordt het maximum per veld, bijgewerkt het maximum.
-- Stempels worden als tekst vergeleken (collate "C"), net als in JavaScript.
-- Verandert er niets, dan gebeurt er niets (geen lege update, geen echo naar het andere toestel).
-- De kolommen bijgewerkt en verwijderd volgen data.bijgewerkt en data.verwijderd.
-- server_tijd en gewijzigd_door zet de database zelf.
create or replace function public.records_stempel() returns trigger
language plpgsql set search_path = public as $$
declare
  graf_nieuw boolean;
  graf_oud boolean;
  st_nieuw text;
  st_oud text;
  t_oud jsonb;
  t_nieuw jsonb;
  uit jsonb;
  veld text;
  waarde jsonb;
  stempel text;
begin
  -- De binnenkomende versie: bijgewerkt en verwijderd in data en in de kolommen gelijk trekken.
  if jsonb_typeof(new.data) = 'object' then
    st_nieuw := coalesce(nullif(new.data ->> 'bijgewerkt', ''), to_char(new.bijgewerkt at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'));
    graf_nieuw := coalesce(new.verwijderd, false) or coalesce(new.data -> 'verwijderd' = 'true'::jsonb, false);
    new.data := new.data || jsonb_build_object('bijgewerkt', st_nieuw);
    if graf_nieuw then
      new.data := new.data || '{"verwijderd": true}'::jsonb;
    end if;
    new.bijgewerkt := st_nieuw::timestamptz;
    new.verwijderd := graf_nieuw;
  end if;

  if tg_op = 'UPDATE' then
    if jsonb_typeof(new.data) = 'object' and jsonb_typeof(old.data) = 'object' then
      st_oud := coalesce(nullif(old.data ->> 'bijgewerkt', ''), to_char(old.bijgewerkt at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'));
      graf_oud := old.verwijderd or coalesce(old.data -> 'verwijderd' = 'true'::jsonb, false);
      if graf_oud or graf_nieuw then
        -- Regel 1: de hoogste bijgewerkt wint volledig, bij gelijke bijgewerkt het grafsteentje.
        if not (st_nieuw collate "C" > st_oud collate "C" or (st_nieuw = st_oud and graf_nieuw and not graf_oud)) then
          return null;
        end if;
      else
        -- Regel 2: per veld.
        t_oud := case when jsonb_typeof(old.data -> '_t') = 'object' then old.data -> '_t' else '{}'::jsonb end;
        t_nieuw := case when jsonb_typeof(new.data -> '_t') = 'object' then new.data -> '_t' else '{}'::jsonb end;
        uit := old.data;
        for veld, waarde in select e.key, e.value from jsonb_each(new.data) e where e.key not in ('_t', 'bijgewerkt') loop
          if not (old.data ? veld)
            or coalesce(t_nieuw ->> veld, '') collate "C" > coalesce(t_oud ->> veld, '') collate "C"
            or (coalesce(t_nieuw ->> veld, '') = coalesce(t_oud ->> veld, '')
                and waarde::text collate "C" > (old.data -> veld)::text collate "C") then
            uit := uit || jsonb_build_object(veld, waarde);
          end if;
        end loop;
        for veld, stempel in select e.key, e.value from jsonb_each_text(t_nieuw) e loop
          if stempel is not null and (t_oud ->> veld is null or stempel collate "C" > (t_oud ->> veld) collate "C") then
            t_oud := t_oud || jsonb_build_object(veld, stempel);
          end if;
        end loop;
        if old.data ? '_t' or new.data ? '_t' then
          uit := uit || jsonb_build_object('_t', t_oud);
        end if;
        if st_nieuw collate "C" > st_oud collate "C" then
          st_oud := st_nieuw;
        end if;
        new.data := uit || jsonb_build_object('bijgewerkt', st_oud);
        new.bijgewerkt := st_oud::timestamptz;
        new.verwijderd := false;
      end if;
    elsif new.bijgewerkt <= old.bijgewerkt then
      -- Geen object (oude of vreemde gegevens): alleen een nieuwere versie vervangt.
      return null;
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
create policy "bijlagen lezen" on storage.objects for select to authenticated using (bucket_id = 'bijlagen' and (select public.heeft_toegang()));
create policy "bijlagen toevoegen" on storage.objects for insert to authenticated with check (bucket_id = 'bijlagen' and (select public.heeft_toegang()));
create policy "bijlagen wijzigen" on storage.objects for update to authenticated using (bucket_id = 'bijlagen' and (select public.heeft_toegang())) with check (bucket_id = 'bijlagen' and (select public.heeft_toegang()));
create policy "bijlagen verwijderen" on storage.objects for delete to authenticated using (bucket_id = 'bijlagen' and (select public.heeft_toegang()));

-- 4. Mail versturen vanaf het Gmail-adres van Remi (serverfunctie supabase/functions/gmail).
--    Deze tabellen hebben RLS aan en GEEN regels: alleen de serverfunctie (service role) kan erbij,
--    nooit de app in de browser. Zo blijven het clientgeheim en de toestemming van Remi afgeschermd.
--    Een koppellink (gmail_uitnodiging) geldt 48 uur en alleen voor het verwachte Gmail-adres (verwacht_email),
--    en alleen zolang wie hem maakte (aangemaakt_door_id) nog toegang heeft.
--    gmail_verzonden houdt per verzending (sleutel '<mail-id>:<poging>') bij dat ze bezig of verstuurd is,
--    zodat dezelfde mail nooit twee keer vertrekt (ook niet vanaf twee toestellen tegelijk).
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
  aangemaakt_door_id uuid not null references auth.users (id) on delete cascade,
  verwacht_email text not null,
  verloopt timestamptz not null
);
-- Een database van vóór het verwachte adres: oude koppellinks (zonder verwacht adres) vervallen.
alter table public.gmail_uitnodiging add column if not exists aangemaakt_door_id uuid references auth.users (id) on delete cascade;
alter table public.gmail_uitnodiging add column if not exists verwacht_email text;
delete from public.gmail_uitnodiging where verwacht_email is null or aangemaakt_door_id is null;
alter table public.gmail_uitnodiging alter column aangemaakt_door_id set not null;
alter table public.gmail_uitnodiging alter column verwacht_email set not null;
create table if not exists public.gmail_verzonden (
  sleutel text primary key,
  status text not null check (status in ('bezig', 'verstuurd')),
  gmail_id text,
  aangemaakt_op timestamptz not null default now(),
  door text
);
alter table public.gmail_app enable row level security;
alter table public.gmail_koppeling enable row level security;
alter table public.gmail_uitnodiging enable row level security;
alter table public.gmail_verzonden enable row level security;
revoke all on public.gmail_app, public.gmail_koppeling, public.gmail_uitnodiging, public.gmail_verzonden from anon, authenticated;

-- 5. Toegangscodes om toegang te krijgen: een account maken, een nieuw wachtwoord kiezen of een account waarmee je
--    al aangemeld bent koppelen (serverfunctie supabase/functions/account). Een code hoort bij één e-mailadres
--    (email, in kleine letters), is 24 uur geldig en eenmalig; een nieuwe code voor hetzelfde adres laat de oudere
--    meteen vervallen. Alleen de hash van de code wordt bewaard; de app kan deze tabel niet lezen.
create table if not exists public.account_code (
  code_hash text primary key,
  wie text not null check (wie in ('remi', 'giulia')),
  email text,
  verloopt timestamptz not null,
  gebruikt_op timestamptz,
  aangemaakt_door text
);
alter table public.account_code add column if not exists email text;
-- Oude codes zonder adres werken niet meer: ongebruikte meteen opruimen.
delete from public.account_code where email is null and gebruikt_op is null;
alter table public.account_code enable row level security;
revoke all on public.account_code from anon, authenticated;

-- Alle aanmeldingen van één account intrekken, na een nieuw wachtwoord met een toegangscode. Alleen de serverfunctie
-- account (service role) mag dit uitvoeren. Een toegangstoken dat al uitgegeven werd, blijft geldig tot het verloopt
-- (standaard een uur); vernieuwen lukt daarna niet meer.
create or replace function public.trek_sessies_in(uid uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from auth.refresh_tokens where user_id = uid::text;
  delete from auth.sessions where user_id = uid;
end $$;
revoke all on function public.trek_sessies_in(uuid) from public, anon, authenticated;
grant execute on function public.trek_sessies_in(uuid) to service_role;

-- 6. Tabellen per onderdeel: leesbare overzichten om in de Table Editor van Supabase te openen (alleen lezen).
--    Het zijn views op records met security_invoker, zodat dezelfde toegangsregels gelden als voor records.
--    Verwijderde records staan er niet in. De laatste kolom (data) is altijd het volledige record, zonder de
--    stempels per veld (_t); die staan alleen in records.data.
--    Wijzigen gebeurt in de app: die voegt elke bewerking veld per veld samen en stuurt ze naar het andere toestel.
--    Een kolom weghalen of hernoemen kan niet met create or replace view: dan eerst drop view.

-- Lijsten waar beide toestellen tegelijk aan toevoegen (het logboek van een sollicitatie, de bijlagen van een
--    document of mail): de app bewaart elk nieuw item in een eigen veld '<lijst>_<item-id>' (verwijderd: null), naast
--    de oude lijst '<lijst>' zelf, zodat het samenvoegen per veld er geen verliest. lijst_items geeft de volledige
--    lijst zoals de app ze toont (store.items in app/js/store.js): eerst de oude lijst, dan de items uit eigen velden
--    in de volgorde van toevoegen (veld op, dan id).
create or replace function public.lijst_items(data jsonb, lijst text) returns jsonb
language sql immutable set search_path = '' as $$
  with oud as (
    select e.waarde, e.nr
    from jsonb_array_elements(case when jsonb_typeof(data -> lijst) = 'array' then data -> lijst else '[]'::jsonb end)
      with ordinality as e(waarde, nr)
    where jsonb_typeof(e.waarde) = 'object'
  ),
  eigen as (
    select distinct on (x.item_id) x.item_id, x.waarde
    from (
      select coalesce(v.value ->> 'id', substr(v.key, length(lijst) + 2)) as item_id, v.value as waarde, v.key
      from jsonb_each(case when jsonb_typeof(data) = 'object' then data else '{}'::jsonb end) as v
      where left(v.key, length(lijst) + 1) = lijst || '_' and jsonb_typeof(v.value) = 'object'
    ) x
    where not exists (select 1 from oud o where o.waarde ->> 'id' = x.item_id)
    order by x.item_id, x.key
  )
  select coalesce((select jsonb_agg(o.waarde order by o.nr) from oud o), '[]'::jsonb)
    || coalesce((select jsonb_agg(case when e.waarde ->> 'id' is null then e.waarde || jsonb_build_object('id', e.item_id) else e.waarde end
                                  order by coalesce(e.waarde ->> 'op', '') collate "C", e.item_id collate "C") from eigen e), '[]'::jsonb)
$$;
revoke all on function public.lijst_items(jsonb, text) from public, anon;
grant execute on function public.lijst_items(jsonb, text) to authenticated, service_role;

-- Sollicitaties: recentst verstuurd (of aangemaakt) bovenaan. De kolom logboek kwam in het midden bij: daarom drop
--    view en opnieuw create.
drop view if exists public.sollicitaties;
create view public.sollicitaties with (security_invoker = true) as
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
  public.lijst_items(r.data, 'logboek') as logboek,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data - '_t' as data
from public.records r
where r.collectie = 'sollicitaties' and not r.verwijderd
order by coalesce(nullif(r.data ->> 'datumVerstuurd', ''), nullif(r.data ->> 'aangemaakt', '')) desc nulls last, r.data ->> 'organisatie';
comment on view public.sollicitaties is 'Sollicitaties van Remi, zoals in de app (Werk, Sollicitaties). Alleen lezen: wijzigen gebeurt in de app. De kolom logboek is het volledige logboek in volgorde (de oude lijst logboek en de regels uit de velden logboek_<id>). De kolom data bevat het volledige record.';

-- Vacatures: recentst gevonden bovenaan (oudere records zonder gevonden: op de datum van toevoegen).
--    De dagelijkse scan zet gevonden, score (A, B of C), sector, waarom en aandachtspunt; status_datum is de dag
--    van de laatste statuswijziging. Er kwamen kolommen in het midden bij: daarom drop view en opnieuw create.
drop view if exists public.vacatures;
create view public.vacatures with (security_invoker = true) as
select
  r.id,
  r.data ->> 'titel' as titel,
  r.data ->> 'organisatie' as organisatie,
  r.data ->> 'sector' as sector,
  r.data ->> 'plaats' as plaats,
  r.data ->> 'score' as score,
  r.data ->> 'status' as status,
  r.data ->> 'statusDatum' as status_datum,
  r.data ->> 'gevonden' as gevonden,
  r.data ->> 'deadline' as deadline,
  r.data ->> 'waarom' as waarom,
  r.data ->> 'aandachtspunt' as aandachtspunt,
  r.data ->> 'bron' as bron,
  r.data ->> 'url' as url,
  r.data ->> 'spoor' as spoor,
  r.data ->> 'toegevoegd' as toegevoegd,
  r.data ->> 'tekst' as tekst,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data - '_t' as data
from public.records r
where r.collectie = 'vacatures' and not r.verwijderd
order by coalesce(nullif(r.data ->> 'gevonden', ''), nullif(r.data ->> 'toegevoegd', '')) desc nulls last, r.data ->> 'score' nulls last, r.data ->> 'titel';
comment on view public.vacatures is 'Vacatures die de dagelijkse scan vond of die in de app bewaard werden (Werk, Vacatures, Gevonden), met score A, B of C en status (nieuw, voorgelegd, interessant, omgezet, niet, verlopen). Alleen lezen: wijzigen gebeurt in de app. De kolom data bevat het volledige record.';
-- Een nieuwe view krijgt in Supabase standaard rechten voor anon: meteen weer alleen lezen voor wie aangemeld is
-- (zoals onderaan voor alle views).
revoke all on public.vacatures from anon, authenticated;
grant select on public.vacatures to authenticated;

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
  r.data - '_t' as data
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
  r.data - '_t' as data
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
  r.data - '_t' as data
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
  jsonb_array_length(public.lijst_items(r.data, 'bijlagen')) as aantal_bijlagen,
  r.data ->> 'notities' as notities,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data - '_t' as data
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
  jsonb_array_length(public.lijst_items(r.data, 'bijlagen')) as aantal_bijlagen,
  r.data ->> 'tekst' as tekst,
  r.bijgewerkt,
  r.gewijzigd_door,
  r.data - '_t' as data
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
  r.data - '_t' as data
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
  r.data - '_t' as data
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
  r.data - '_t' as data
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
  r.data - '_t' as data
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
  r.data - '_t' as data
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
cross join lateral jsonb_array_elements(public.lijst_items(r.data, 'bijlagen')) as e(bijlage)
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

-- 7. Toegang geven gebeurt alleen nog met een toegangscode, via de serverfunctie account: wie al toegang heeft, maakt
--    in de app een code voor een e-mailadres; de ontvanger maakt daarmee een account met dat adres, of koppelt het
--    account waarmee hij al aangemeld is. Zet dus geen adressen rechtstreeks in toegang: toegang hangt aan het account
--    (user_id), en dat vult alleen de functie account in. De functie account gebruikt de admin-API en werkt ook
--    zonder open aanmelding.
--
--    Vaste controle bij elke uitrol (Supabase, Authentication, Sign In / Providers):
--      [ ] 'Allow new users to sign up' staat UIT (een account maken kan dan alleen met een toegangscode);
--      [ ] 'Confirm email' staat AAN;
--      [ ] 'Secure email change' staat AAN.
--    Zo kan niemand vooraf een account maken met het adres van iemand die een code krijgt. Bestaat er toch al een
--    account met dat adres zonder toegang (bijvoorbeeld voor een andere app in dezelfde database), dan neemt de
--    functie account het niet over en verwijdert ze het niet: wie het wachtwoord kent, meldt zich aan en koppelt de code.
--
--    Alleen de allereerste code (zolang nog niemand toegang heeft) zet je hier klaar: met de hash van de code in
--    hoofdletters zonder streepje (de code zelf nooit in de repository) en het adres in kleine letters.
-- insert into public.account_code (code_hash, wie, email, verloopt)
--   values (encode(sha256('ABCDEFGHJK'::bytea), 'hex'), 'remi', 'adres-van-remi@voorbeeld.be', now() + interval '24 hours');
