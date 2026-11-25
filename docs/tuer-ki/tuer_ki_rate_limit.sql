-- Tür-KI Rate-Limit (persistenter Zähler). Noch nicht anwenden.
-- Reihenfolge: erst verdrahten, dann migrieren.
-- Vorbedingung: pg_cron muss vorher im Zielprojekt aktiv sein, sonst bricht
-- dieses Skript bei cron.schedule ab. Nicht anwenden, bevor pg_cron aktiv ist.
-- Verdrahten: (1) TUER_KI_RATE_SALT nur in der Server-Env (HMAC-Tagessalz, nie in der DB),
-- (2) Supabase-Projekt in der EU-Region Frankfurt, (3) Extension pg_cron aktivieren.
-- Danach erst dieses Skript anwenden (Code-Bot, nach Test-OK und DS-OK fürs Anwenden).
-- Nutzer-Ja zur Prod-Migration liegt vor (25.11.2026, 15:15–15:17). Einschalten der Tür-KI frühestens 01.12.2026.
--
-- Felder wie im Server-Speicher: HMAC-Hash der IP, Zähler und Zeitstempel.
-- Das täglich wechselnde Salz wird nur in der Server-Umgebung bzw. im Server-Speicher
-- gehalten (HMAC aus Env-Secret plus Datum, siehe lib/tuerKi/rateLimit.ts). Dieses SQL
-- speichert kein Salz und enthält keine Salz-Spalte.
-- Löschung spätestens nach 24 Stunden (globaler Purge in der RPC und zusätzlich per pg_cron).
-- Kein Klartext-IP, kein Inhalt, keine Sitzung, kein Bezug zu Konten.
--
-- Offene Punkte vor dem Anwenden prüfen:
-- - Salzquelle: TUER_KI_RATE_SALT in der Server-Env gesetzt (nie in dieser Tabelle).
-- - EU-Region: Projekt liegt in Frankfurt; pg_cron ist eingeschaltet.

create table if not exists public.tuer_ki_rate (
  ip_hash   text        not null,
  fenster   timestamptz not null,               -- Beginn des Stundenfensters
  anzahl    integer     not null default 0 check (anzahl >= 0),
  erstellt  timestamptz not null default now(),
  primary key (ip_hash, fenster)
);

alter table public.tuer_ki_rate enable row level security;
-- Keine Policies: nur der Server (service role) schreibt und liest.
revoke all on table public.tuer_ki_rate from public, anon, authenticated;
grant all on table public.tuer_ki_rate to service_role;

-- Zählt eine Nachricht und gibt die Summe der letzten Stunde und des Tages zurück.
-- Zu Beginn jeder RPC: globaler Purge aller Einträge älter als 24 Stunden.
create or replace function public.tuer_ki_rate_zaehle(p_hash text)
returns table (stunde integer, tag integer)
language plpgsql security definer set search_path = public as $$
declare v_fenster timestamptz := date_trunc('hour', now());
begin
  delete from public.tuer_ki_rate where erstellt < now() - interval '24 hours';
  insert into public.tuer_ki_rate (ip_hash, fenster, anzahl) values (p_hash, v_fenster, 1)
  on conflict (ip_hash, fenster) do update set anzahl = public.tuer_ki_rate.anzahl + 1;
  return query
    select coalesce(sum(anzahl) filter (where fenster >= v_fenster), 0)::int,
           coalesce(sum(anzahl) filter (where fenster >= date_trunc('day', now())), 0)::int
    from public.tuer_ki_rate where ip_hash = p_hash;
end $$;
revoke all on function public.tuer_ki_rate_zaehle(text) from public, anon, authenticated;
grant execute on function public.tuer_ki_rate_zaehle(text) to service_role;

-- Zusätzlicher 24-h-Purge per pg_cron (stündlich zur Minute 7), zusätzlich zum Purge in der RPC.
-- Erst verdrahten (pg_cron muss bereits aktiv sein), dann migrieren.
select cron.unschedule(jobid)
  from cron.job
  where jobname = 'tuer_ki_rate_purge';
select cron.schedule(
  'tuer_ki_rate_purge',
  '7 * * * *',
  $$delete from public.tuer_ki_rate where erstellt < now() - interval '24 hours'$$
);
