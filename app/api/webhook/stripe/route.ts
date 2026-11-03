import { NextResponse } from 'next/server'

// Online-Zahlung und Spenden sind deaktiviert (RECHT.md, Fragen BtMM-Bot 03.11.2026).
// Der Endpunkt bestätigt nur noch den Empfang, verarbeitet nichts und versendet keine E-Mails.
export async function POST() {
  return NextResponse.json({ received: true, disabled: true })
}
