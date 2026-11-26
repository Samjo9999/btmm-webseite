-- Tür-KI Kostendeckel (persistenter Zähler). Noch nicht anwenden.
-- Reihenfolge: erst dieses Skript im bestehenden Supabase-Projekt anwenden
-- (dasselbe wie tuer_ki_rate, EU-Region Frankfurt, service_role bereits in der Server-Env),
-- danach erst den zugehörigen Code mergen und deployen. Wird der Code vorher live
-- geschaltet, ist die Tür-KI fail-closed (kein Modellaufruf).
-- Keine neuen Konten, keine neuen Dienste, keine neuen Env-Variablen.
-- Prod-Migration nur nach ausdrücklicher Freigabe des Nutzers.
--
-- Felder: nur Periodenschlüssel (UTC-Tag bzw. UTC-Monat) und Summen in Euro/Token.
-- Kein Hash, keine IP, kein Inhalt, keine Sitzung, kein Bezug zu Personen oder Konten.
-- Vor jedem Scaleway-Aufruf wird der ungünstigste Fall (geschätzte Eingabe + volle Ausgabe)
-- atomar reserviert; nach dem Aufruf wird auf die echte usage korrigiert.
-- Scheitert die Reservierung technisch: fail-closed, kein LLM-Aufruf.
-- Scheitert nur die Korrektur: die Reservierung bleibt stehen (sicheres Überzählen).

create table if not exists public.tuer_ki_kosten (
  periode        text          primary key,  -- 'tag:YYYY-MM-DD' oder 'monat:YYYY-MM' (UTC)
  gebucht_eur    numeric(14,10) not null default 0 check (gebucht_eur >= 0),
  tokens_ein     bigint        not null default 0 check (tokens_ein >= 0),
  tokens_aus     bigint        not null default 0 check (tokens_aus >= 0),
  aktualisiert   timestamptz   not null default now()
);

alter table public.tuer_ki_kosten enable row level security;
-- Keine Policies: nur der Server (service role) schreibt und liest.
revoke all on table public.tuer_ki_kosten from public, anon, authenticated;
grant all on table public.tuer_ki_kosten to service_role;

-- Reserviert den ungünstigsten Fall gegen Tages- und Monatsdeckel. Sperrt beide Zeilen atomar.
create or replace function public.tuer_ki_kosten_reserviere(
  p_tag text,
  p_monat text,
  p_schaetzung_eur numeric,
  p_tag_limit numeric,
  p_monat_limit numeric
)
returns table (erlaubt boolean, grund text, tag_eur numeric, monat_eur numeric)
language plpgsql security definer set search_path = public as $$
declare
  v_tag text := 'tag:' || p_tag;
  v_monat text := 'monat:' || p_monat;
  v_tag_eur numeric;
  v_monat_eur numeric;
begin
  if p_schaetzung_eur is null or p_schaetzung_eur < 0
     or p_tag_limit is null or p_monat_limit is null or p_tag_limit < 0 or p_monat_limit < 0
     or p_tag is null or p_monat is null
     or p_tag !~ '^\d{4}-\d{2}-\d{2}$'
     or p_monat !~ '^\d{4}-\d{2}$'
  then
    raise exception 'kosten-reserve-ungueltig';
  end if;

  insert into public.tuer_ki_kosten (periode) values (v_monat) on conflict do nothing;
  insert into public.tuer_ki_kosten (periode) values (v_tag) on conflict do nothing;

  -- Feste Sperrreihenfolge (monat: vor tag:), damit parallele Aufrufe nicht verkleben.
  perform 1 from public.tuer_ki_kosten
    where periode in (v_monat, v_tag)
    order by periode
    for update;

  select gebucht_eur into strict v_monat_eur from public.tuer_ki_kosten where periode = v_monat;
  select gebucht_eur into strict v_tag_eur from public.tuer_ki_kosten where periode = v_tag;

  if v_tag_eur + p_schaetzung_eur > p_tag_limit then
    return query select false, 'tag'::text, v_tag_eur, v_monat_eur;
    return;
  end if;
  if v_monat_eur + p_schaetzung_eur > p_monat_limit then
    return query select false, 'monat'::text, v_tag_eur, v_monat_eur;
    return;
  end if;

  update public.tuer_ki_kosten
    set gebucht_eur = gebucht_eur + p_schaetzung_eur, aktualisiert = now()
    where periode in (v_tag, v_monat);

  return query select true, null::text, v_tag_eur + p_schaetzung_eur, v_monat_eur + p_schaetzung_eur;
end $$;
revoke all on function public.tuer_ki_kosten_reserviere(text, text, numeric, numeric, numeric) from public, anon, authenticated;
grant execute on function public.tuer_ki_kosten_reserviere(text, text, numeric, numeric, numeric) to service_role;

-- Setzt die Reservierung auf den echten Verbrauch herunter (oder auf, falls er höher lag)
-- und addiert die Token. Läuft in derselben Transaktion pro Aufruf.
create or replace function public.tuer_ki_kosten_korrigiere(
  p_tag text,
  p_monat text,
  p_reserviert_eur numeric,
  p_echt_eur numeric,
  p_ein bigint,
  p_aus bigint
)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_tag text := 'tag:' || p_tag;
  v_monat text := 'monat:' || p_monat;
  v_delta numeric;
begin
  if p_reserviert_eur is null or p_echt_eur is null or p_reserviert_eur < 0 or p_echt_eur < 0
     or p_ein is null or p_aus is null or p_ein < 0 or p_aus < 0
     or p_tag is null or p_monat is null
     or p_tag !~ '^\d{4}-\d{2}-\d{2}$'
     or p_monat !~ '^\d{4}-\d{2}$'
  then
    raise exception 'kosten-korrektur-ungueltig';
  end if;

  insert into public.tuer_ki_kosten (periode) values (v_monat) on conflict do nothing;
  insert into public.tuer_ki_kosten (periode) values (v_tag) on conflict do nothing;

  perform 1 from public.tuer_ki_kosten
    where periode in (v_monat, v_tag)
    order by periode
    for update;

  v_delta := p_echt_eur - p_reserviert_eur;

  update public.tuer_ki_kosten
    set gebucht_eur = greatest(0, gebucht_eur + v_delta),
        tokens_ein = tokens_ein + p_ein,
        tokens_aus = tokens_aus + p_aus,
        aktualisiert = now()
    where periode in (v_tag, v_monat);
end $$;
revoke all on function public.tuer_ki_kosten_korrigiere(text, text, numeric, numeric, bigint, bigint) from public, anon, authenticated;
grant execute on function public.tuer_ki_kosten_korrigiere(text, text, numeric, numeric, bigint, bigint) to service_role;
