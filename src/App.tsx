import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { App as CapacitorApp } from '@capacitor/app'
// import { SplashScreen } from '@capacitor/splash-screen'
// import { StatusBar, Style } from '@capacitor/status-bar'

// Components
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

// Pages - Import all page components
import HomePage from '@/pages/Page'
import AngebotePage from '@/pages/angebote/Page'
import AppPage from '@/pages/app/Page'
import BuchungsbedingungenPage from '@/pages/buchungsbedingungen/Page'
import ChronikPage from '@/pages/chronik/Page'
import DokumentePage from '@/pages/dokumente/Page'
import ErfahrungenPage from '@/pages/erfahrungen/Page'
import FaqPage from '@/pages/faq/Page'
import GruendungPage from '@/pages/gruendung/Page'
import ImpressumPage from '@/pages/impressum/Page'
import KoerperarbeitPage from '@/pages/koerperarbeit/Page'
import KoerperarbeitAblaufPage from '@/pages/koerperarbeit/ablauf/Page'
import KoerperarbeitAnfahrtPage from '@/pages/koerperarbeit/anfahrt/Page'
import KoerperarbeitBestaetigungPage from '@/pages/koerperarbeit/bestaetigung/Page'
import KoerperarbeitBewertungenPage from '@/pages/koerperarbeit/bewertungen/Page'
import KoerperarbeitBuchenPage from '@/pages/koerperarbeit/buchen/Page'
import KoerperarbeitFuerWenPage from '@/pages/koerperarbeit/fuer-wen/Page'
import KoerperarbeitKontaktPage from '@/pages/koerperarbeit/kontakt/Page'
import KoerperarbeitMethodePage from '@/pages/koerperarbeit/methode/Page'
import KoerperarbeitPreisePage from '@/pages/koerperarbeit/preise/Page'
import KoerperarbeitUeberPage from '@/pages/koerperarbeit/ueber/Page'
import KonzeptPage from '@/pages/konzept/Page'
import KonzeptGemeinschaftPage from '@/pages/konzept/gemeinschaft/Page'
import KonzeptInternationalPage from '@/pages/konzept/international/Page'
import KonzeptNachhaltigkeitPage from '@/pages/konzept/nachhaltigkeit/Page'
import KonzeptWirtschaftPage from '@/pages/konzept/wirtschaft/Page'
import MitmachenPage from '@/pages/mitmachen/Page'
import NachhaltigkeitPage from '@/pages/nachhaltigkeit/Page'
import PressePage from '@/pages/presse/Page'

export default function App() {
  useEffect(() => {
    // Hide splash screen (when SplashScreen is installed)
    // SplashScreen.hide().catch(() => {})

    // Set status bar style (when StatusBar is installed)
    // StatusBar.setStyle({ style: Style.Dark }).catch(() => {})

    // Handle app back button
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        CapacitorApp.exitApp()
      } else {
        window.history.back()
      }
    }).catch(() => {})
  }, [])

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Home */}
            <Route path="/" element={<HomePage />} />

            {/* Top-level pages */}
            <Route path="/angebote" element={<AngebotePage />} />
            <Route path="/app" element={<AppPage />} />
            <Route path="/buchungsbedingungen" element={<BuchungsbedingungenPage />} />
            <Route path="/chronik" element={<ChronikPage />} />
            <Route path="/dokumente" element={<DokumentePage />} />
            <Route path="/erfahrungen" element={<ErfahrungenPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/gruendung" element={<GruendungPage />} />
            <Route path="/impressum" element={<ImpressumPage />} />

            {/* Körperarbeit Section */}
            <Route path="/koerperarbeit" element={<KoerperarbeitPage />} />
            <Route path="/koerperarbeit/ablauf" element={<KoerperarbeitAblaufPage />} />
            <Route path="/koerperarbeit/anfahrt" element={<KoerperarbeitAnfahrtPage />} />
            <Route path="/koerperarbeit/bestaetigung" element={<KoerperarbeitBestaetigungPage />} />
            <Route path="/koerperarbeit/bewertungen" element={<KoerperarbeitBewertungenPage />} />
            <Route path="/koerperarbeit/buchen" element={<KoerperarbeitBuchenPage />} />
            <Route path="/koerperarbeit/fuer-wen" element={<KoerperarbeitFuerWenPage />} />
            <Route path="/koerperarbeit/kontakt" element={<KoerperarbeitKontaktPage />} />
            <Route path="/koerperarbeit/methode" element={<KoerperarbeitMethodePage />} />
            <Route path="/koerperarbeit/preise" element={<KoerperarbeitPreisePage />} />
            <Route path="/koerperarbeit/ueber" element={<KoerperarbeitUeberPage />} />

            {/* Konzept Section */}
            <Route path="/konzept" element={<KonzeptPage />} />
            <Route path="/konzept/gemeinschaft" element={<KonzeptGemeinschaftPage />} />
            <Route path="/konzept/international" element={<KonzeptInternationalPage />} />
            <Route path="/konzept/nachhaltigkeit" element={<KonzeptNachhaltigkeitPage />} />
            <Route path="/konzept/wirtschaft" element={<KonzeptWirtschaftPage />} />

            {/* Other pages */}
            <Route path="/mitmachen" element={<MitmachenPage />} />
            <Route path="/nachhaltigkeit" element={<NachhaltigkeitPage />} />
            <Route path="/presse" element={<PressePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}
