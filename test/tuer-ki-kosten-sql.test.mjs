// PGlite-Test für docs/tuer-ki/tuer_ki_kosten.sql (nicht anwenden in Prod).
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sqlPfad = join(root, 'docs/tuer-ki/tuer_ki_kosten.sql')

async function neueDb() {
  const db = new PGlite()
  await db.exec(`
    do $$ begin
      if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
      if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
      if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
    end $$;
  `)
  await db.exec(readFileSync(sqlPfad, 'utf8'))
  return db
}

async function reserviere(db, { tag = '2026-11-26', monat = '2026-11', schaetzung = 0.2, tagLimit = 0.5, monatLimit = 10 } = {}) {
  return db.query(
    `select * from public.tuer_ki_kosten_reserviere($1, $2, $3, $4, $5)`,
    [tag, monat, schaetzung, tagLimit, monatLimit],
  )
}

async function korrigiere(db, { tag = '2026-11-26', monat = '2026-11', reserviert = 0.2, echt = 0.05, ein = 2000, aus = 120 } = {}) {
  return db.query(
    `select public.tuer_ki_kosten_korrigiere($1, $2, $3, $4, $5, $6)`,
    [tag, monat, reserviert, echt, ein, aus],
  )
}

function stand(db) {
  return db.query(`select periode, gebucht_eur::float8 as eur, tokens_ein, tokens_aus from public.tuer_ki_kosten order by periode`)
}

test('SQL: Reservierung atomar gegen Tages- und Monatsdeckel, Korrektur auf echte usage', async () => {
  const db = await neueDb()
  try {
    const eins = await reserviere(db, { schaetzung: 0.2 })
    assert.equal(eins.rows[0].erlaubt, true)
    assert.equal(eins.rows[0].grund, null)
    assert.ok(Math.abs(Number(eins.rows[0].tag_eur) - 0.2) < 1e-9)
    assert.ok(Math.abs(Number(eins.rows[0].monat_eur) - 0.2) < 1e-9)

    const zwei = await reserviere(db, { schaetzung: 0.2 })
    assert.equal(zwei.rows[0].erlaubt, true)
    assert.ok(Math.abs(Number(zwei.rows[0].tag_eur) - 0.4) < 1e-9)

    const voll = await reserviere(db, { schaetzung: 0.2 })
    assert.equal(voll.rows[0].erlaubt, false)
    assert.equal(voll.rows[0].grund, 'tag')
    assert.ok(Math.abs(Number(voll.rows[0].tag_eur) - 0.4) < 1e-9)

    let rows = (await stand(db)).rows
    const tag = rows.find((r) => r.periode === 'tag:2026-11-26')
    const monat = rows.find((r) => r.periode === 'monat:2026-11')
    assert.ok(tag && monat)
    assert.ok(Math.abs(tag.eur - 0.4) < 1e-9)
    assert.ok(Math.abs(monat.eur - 0.4) < 1e-9)
    assert.equal(tag.tokens_ein, 0)
    assert.equal(tag.tokens_aus, 0)

    await korrigiere(db, { reserviert: 0.2, echt: 0.05, ein: 2000, aus: 120 })
    rows = (await stand(db)).rows
    const tag2 = rows.find((r) => r.periode === 'tag:2026-11-26')
    const monat2 = rows.find((r) => r.periode === 'monat:2026-11')
    assert.ok(Math.abs(tag2.eur - 0.25) < 1e-9)
    assert.ok(Math.abs(monat2.eur - 0.25) < 1e-9)
    assert.equal(tag2.tokens_ein, 2000)
    assert.equal(tag2.tokens_aus, 120)
    assert.equal(monat2.tokens_ein, 2000)
    assert.equal(monat2.tokens_aus, 120)

    const wieder = await reserviere(db, { schaetzung: 0.2 })
    assert.equal(wieder.rows[0].erlaubt, true)
    assert.ok(Math.abs(Number(wieder.rows[0].tag_eur) - 0.45) < 1e-9)
  } finally {
    await db.close()
  }
})

test('SQL: Monatsdeckel greift unabhängig vom Tag, ungueltige Werte werfen', async () => {
  const db = await neueDb()
  try {
    const mon = await reserviere(db, { schaetzung: 0.3, tagLimit: 0.5, monatLimit: 0.25 })
    assert.equal(mon.rows[0].erlaubt, false)
    assert.equal(mon.rows[0].grund, 'monat')
    const rows = (await stand(db)).rows
    assert.ok(rows.every((r) => r.eur === 0))

    await assert.rejects(() => reserviere(db, { tag: 'nicht-ein-datum', schaetzung: 0.1 }))
    await assert.rejects(() => reserviere(db, { schaetzung: -0.1 }))
    await assert.rejects(() => korrigiere(db, { echt: -1 }))
  } finally {
    await db.close()
  }
})

test('SQL: Tabelle hat keine Personenfelder; nur service_role darf lesen und ausfuehren', async () => {
  const db = await neueDb()
  try {
    const spalten = await db.query(`
      select column_name from information_schema.columns
      where table_schema = 'public' and table_name = 'tuer_ki_kosten'
      order by 1
    `)
    assert.deepEqual(spalten.rows.map((r) => r.column_name), [
      'aktualisiert', 'gebucht_eur', 'periode', 'tokens_aus', 'tokens_ein',
    ])
    const verboten = ['ip', 'hash', 'ip_hash', 'salz', 'session', 'inhalt', 'text', 'user']
    assert.equal(spalten.rows.some((r) => verboten.includes(r.column_name)), false)
    assert.match(readFileSync(sqlPfad, 'utf8'), /Noch nicht anwenden/)
    assert.doesNotMatch(readFileSync(sqlPfad, 'utf8'), /pg_cron/)

    const priv = await db.query(`
      select
        has_table_privilege('anon', 'public.tuer_ki_kosten', 'SELECT') as anon_select,
        has_table_privilege('anon', 'public.tuer_ki_kosten', 'INSERT') as anon_insert,
        has_table_privilege('authenticated', 'public.tuer_ki_kosten', 'SELECT') as auth_select,
        has_table_privilege('public', 'public.tuer_ki_kosten', 'SELECT') as public_select,
        has_table_privilege('service_role', 'public.tuer_ki_kosten', 'SELECT') as sr_select,
        has_table_privilege('service_role', 'public.tuer_ki_kosten', 'INSERT') as sr_insert,
        has_function_privilege('anon', 'public.tuer_ki_kosten_reserviere(text,text,numeric,numeric,numeric)', 'EXECUTE') as anon_res,
        has_function_privilege('authenticated', 'public.tuer_ki_kosten_reserviere(text,text,numeric,numeric,numeric)', 'EXECUTE') as auth_res,
        has_function_privilege('public', 'public.tuer_ki_kosten_reserviere(text,text,numeric,numeric,numeric)', 'EXECUTE') as public_res,
        has_function_privilege('service_role', 'public.tuer_ki_kosten_reserviere(text,text,numeric,numeric,numeric)', 'EXECUTE') as sr_res,
        has_function_privilege('anon', 'public.tuer_ki_kosten_korrigiere(text,text,numeric,numeric,bigint,bigint)', 'EXECUTE') as anon_kor,
        has_function_privilege('service_role', 'public.tuer_ki_kosten_korrigiere(text,text,numeric,numeric,bigint,bigint)', 'EXECUTE') as sr_kor
    `)
    const p = priv.rows[0]
    assert.equal(p.anon_select, false)
    assert.equal(p.anon_insert, false)
    assert.equal(p.auth_select, false)
    assert.equal(p.public_select, false)
    assert.equal(p.sr_select, true)
    assert.equal(p.sr_insert, true)
    assert.equal(p.anon_res, false)
    assert.equal(p.auth_res, false)
    assert.equal(p.public_res, false)
    assert.equal(p.sr_res, true)
    assert.equal(p.anon_kor, false)
    assert.equal(p.sr_kor, true)
  } finally {
    await db.close()
  }
})
