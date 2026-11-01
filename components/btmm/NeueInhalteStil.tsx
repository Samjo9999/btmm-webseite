export function NeueInhalteStil() {
  return <style>{`
    .btmm-ergaenzung { color: var(--btb-dunkel, #1a1505); }
    .btmm-ergaenzung .btmm-knopf { background: var(--btmm-primary, #9e57a4); color: white !important; }
    .btmm-ergaenzung .btmm-hinweis--offen { background: var(--btmm-hell, #ddcddf); border-color: var(--btmm-akzent, #b058b3); color: var(--btmm-dunkel, #780268); }
    .btmm-ergaenzung .btmm-abschnitt h2, .btmm-ergaenzung a:not(.btmm-knopf):not(.btmm-karte) { color: var(--btmm-dunkel, #780268); }
  `}</style>
}
