import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import all message files
import deCommon from '../../messages/de/common.json'
import deHome from '../../messages/de/home.json'
import deKoerperarbeit from '../../messages/de/koerperarbeit.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'de',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      de: {
        common: deCommon,
        home: deHome,
        koerperarbeit: deKoerperarbeit,
      },
    },
  })

export default i18n
