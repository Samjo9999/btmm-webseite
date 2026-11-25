-- NICHT ANWENDEN. Braucht Nutzer-Ja (Prod-Migration) und DS-OK.
-- Optionaler persistenter Zähler für das Rate-Limit der Tür-KI (DS-Leitplanken Tür-KI 25.11.2026).
-- Nur dieselben Felder wie im Server-Speicher: HMAC-Hash der IP (täglich wechselndes Salz, Salz nie in der DB),
-- Zähler und Zeitstempel. EU-Region. Löschung spätestens nach 24 Stunden.
-- Kein Klartext-IP, kein Inhalt, keine Sitzung, kein Bezug zu Konten.

create table if not exists public.tuer_ki_rate (
  ip_hash   text        not null,
  fenster   timestamptz not null,               -- Beginn des Stundenfensters
  anzahl    integer     not null default 0 check (anzahl >= 0),
  erstellt  timestamptz not null default now(),
  primary key (ip_hash, fenster)
);

alter table public.tuer_ki_rate enable row level security;
-- Keine Policies: nur der Server (service role) schreibt und liest.

-- Zählt eine Nachricht und gibt die Summe der letzten Stunde und des Tages zurück.
create or replace function public.tuer_ki_rate_zaehle(p_hash text)
returns table (stunde integer, tag integer)
language plpgsql security definer set search_path = public as $$
declare v_fenster timestamptz := date_trunc('hour', now());
begin
  insert into public.tuer_ki_rate (ip_hash, fenster, anzahl) values (p_hash, v_fenster, 1)
  on conflict (ip_hash, fenster) do update set anzahl = public.tuer_ki_rate.anzahl + 1;
  return query
    select coalesce(sum(anzahl) filter (where fenster >= v_fenster), 0)::int,
           coalesce(sum(anzahl) filter (where fenster >= date_trunc('day', now())), 0)::int
    from public.tuer_ki_rate where ip_hash = p_hash;
end $$;
revoke all on function public.tuer_ki_rate_zaehle(text) from public, anon, authenticated;

-- Löschung <= 24 h (pg_cron, stündlich)
-- select cron.schedule('tuer_ki_rate_purge', '7 * * * *', $$delete from public.tuer_ki_rate where erstellt < now() - interval '24 hours'$$);
