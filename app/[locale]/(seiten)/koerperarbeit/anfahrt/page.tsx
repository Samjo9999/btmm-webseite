import { redirect } from 'next/navigation'

// Ort, Räume und Anfahrt der Körperarbeit stehen nur auf der BtB-Webseite.
export default function AnfahrtPage() {
  redirect('https://www.backtobalance.online/kontakt')
}
