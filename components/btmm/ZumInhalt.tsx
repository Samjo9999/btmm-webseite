/** Sprunglink für Tastatur und Screenreader: erster Tab-Stopp, springt über Kopf und Navigation zu <main id="inhalt">. */
const TEXT: Record<string, string> = {
  de: 'Zum Inhalt springen', en: 'Skip to content', fr: 'Aller au contenu', es: 'Saltar al contenido',
  pt: 'Pular para o conteúdo', ru: 'Перейти к содержимому', ar: 'انتقل إلى المحتوى', hi: 'सामग्री पर जाएँ',
  bn: 'মূল বিষয়বস্তুতে যান', ja: '本文へスキップ', zh: '跳到正文',
}

export function ZumInhalt({ locale }: { locale: string }) {
  return (
    <a href="#inhalt" className="zum-inhalt">
      {TEXT[locale] ?? TEXT.de}
    </a>
  )
}
