import { notFound } from 'next/navigation'

// Unbekannte Pfade unter /[locale] landen hier, damit die lokalisierte
// not-found-Seite im [locale]-Layout (mit <html>/<body>) gerendert wird.
// Ohne diese Route rendert Next die Root-not-found ohne <html> -> React #418.
export default function CatchAll() {
  notFound()
}
