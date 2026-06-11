import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEuro(amount: number): string {
  return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}

export function formatDate(dateString: string, locale = 'de-DE'): string {
  return new Date(dateString).toLocaleString(locale)
}
