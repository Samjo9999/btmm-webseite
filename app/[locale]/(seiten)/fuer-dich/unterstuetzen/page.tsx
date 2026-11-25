// Überzeugungstür-Zielseite „unterstuetzen“ (PR #38), Inhalt in components/btmm/FuerDichSeite.tsx
import type { Metadata } from 'next'
import { FuerDichSeite, fuerDichMeta } from '@/components/btmm/FuerDichSeite'

type P = { params: { locale: string } }
export function generateMetadata({ params }: P): Metadata { return fuerDichMeta('unterstuetzen', params.locale) }
export default async function Seite({ params: { locale } }: P) { return FuerDichSeite({ locale, thema: 'unterstuetzen' }) }
