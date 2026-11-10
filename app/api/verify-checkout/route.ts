import { NextResponse } from 'next/server'

// Online-Zahlung ist deaktiviert: Termine nur als unverbindliche Anfrage,
// keine Vorkasse (RECHT.md, Fragen BtMM-Bot 03.11.2026, Nr. 3).
export async function GET() {
  return NextResponse.json(
    { error: 'Online-Zahlung ist derzeit deaktiviert. Bitte stelle eine Terminanfrage.' },
    { status: 410 },
  )
}

export async function POST() {
  return GET()
}
