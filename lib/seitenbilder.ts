// Vorhandene, nachgewiesene Unsplash-Fotos (data/bildnachweise.json) als Kartenbilder.
const b = (name: string) => `/tuer/bilder/weg/${name}.webp`

export const SEITENBILDER: Record<string, string> = {
  soFunktionierts: b('grundlagen'),
  wasDuSparst: b('sparen'),
  kosten: b('dokumente'),
  offeneFragen: b('skeptisch'),
  faq: b('freiburg'),
  mitmachen: b('vorbei'),
}
