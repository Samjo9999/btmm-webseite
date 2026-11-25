export const EMOJI_MAPPING: Readonly<Record<string, string>>
export const EMOJI_RX: RegExp
export function zaehleEmojis(text: unknown): number
export function hatEmojis(text: unknown): boolean
export function entferneEmojis<T>(text: T): T
export function filterEmojisTief<T>(wert: T): T
export function zaehleEmojisTief(wert: unknown): number
