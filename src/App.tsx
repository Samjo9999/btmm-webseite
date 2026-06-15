import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { App as CapacitorApp } from '@capacitor/app'
// import { SplashScreen } from '@capacitor/splash-screen'
// import { StatusBar, Style } from '@capacitor/status-bar'

// Components (in the app shell — loaded eagerly)
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

// Pages - lazy-loaded so each route ships as its own chunk
const HomePage = lazy(() => import('@/pages/Page'))
const AngebotePage = lazy(() => import('@/pages/angebote/Page'))
const AppPage = lazy(() => import('@/pages/app/Page'))
const BuchungsbedingungenPage = lazy(() => import('@/pages/buchungsbedingungen/Page'))
const ChronikPage = lazy(() => import('@/pages/chronik/Page'))
const DokumentePage = lazy(() => import('@/pages/dokumente/Page'))
const ErfahrungenPage = lazy(() => import('@/pages/erfahrungen/Page'))
const FaqPage = lazy(() => import('@/pages/faq/Page'))
const GruendungPage = lazy(() => import('@/pages/gruendung/Page'))
const ImpressumPage = lazy(() => import('@/pages/impressum/Page'))
const KoerperarbeitPage = lazy(() => import('@/pages/koerperarbeit/Page'))
const KoerperarbeitAblaufPage = lazy(() => import('@/pages/koerperarbeit/ablauf/Page'))
const KoerperarbeitAnfahrtPage = lazy(() => import('@/pages/koerperarbeit/anfahrt/Page'))
const KoerperarbeitBestaetigungPage = lazy(() => import('@/pages/koerperarbeit/bestaetigung/Page'))
const KoerperarbeitBewertungenPage = lazy(() => import('@/pages/koerperarbeit/bewertungen/Page'))
const KoerperarbeitBuchenPage = lazy(() => import('@/pages/koerperarbeit/buchen/Page'))
const KoerperarbeitFuerWenPage = lazy(() => import('@/pages/koerperarbeit/fuer-wen/Page'))
const KoerperarbeitKontaktPage = lazy(() => import('@/pages/koerperarbeit/kontakt/Page'))
const KoerperarbeitMethodePage = lazy(() => import('@/pages/koerperarbeit/methode/Page'))
const KoerperarbeitPreisePage = lazy(() => import('@/pages/koerperarbeit/preise/Page'))
const KoerperarbeitUeberPage = lazy(() => import('@/pages/koerperarbeit/ueber/Page'))
const KonzeptPage = lazy(() => import('@/pages/konzept/Page'))
const KonzeptGemeinschaftPage = lazy(() => import('@/pages/konzept/gemeinschaft/Page'))
const KonzeptInternationalPage = lazy(() => import('@/pages/konzept/international/Page'))
const KonzeptNachhaltigkeitPage = lazy(() => import('@/pages/konzept/nachhaltigkeit/Page'))
const KonzeptWirtschaftPage = lazy(() => import('@/pages/konzept/wirtschaft/Page'))
const MitmachenPage = lazy(() => import('@/pages/mitmachen/Page'))
const NachhaltigkeitPage = lazy(() => import('@/pages/nachhaltigkeit/Page'))
const PressePage = lazy(() => import('@/pages/presse/Page'))

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
          <Suspense fallback={<div style={{ flex: 1 }} aria-busy="true" />}>
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
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  )
}
