import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { App as CapacitorApp } from '@capacitor/app'
// import { SplashScreen } from '@capacitor/splash-screen'
// import { StatusBar, Style } from '@capacitor/status-bar'

// Components
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

// Pages - Add your pages here
// import HomePage from '@/pages/HomePage'
// import BookingPage from '@/pages/BookingPage'

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
            {/* Add your routes here */}
            {/* <Route path="/" element={<HomePage />} />
            <Route path="/buchen" element={<BookingPage />} /> */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}
