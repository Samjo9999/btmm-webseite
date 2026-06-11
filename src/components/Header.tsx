
import { Link as RouterLink } from 'react-router-dom'
// import Image (use <img>) 
import { useTranslation} from 'react-i18next'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, X, Globe, ExternalLink } from 'lucide-react'
import { locales, type Locale } from '@/i18n/config'

export function Header({ locale = 'de' }: { locale?: Locale } = {}) {
  const { t, i18n } = useTranslation('common')
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const pathname = useLocation().pathname
  const currentLocale = (i18n.language || locale) as Locale

  const navItems = [
    { href: '/konzept', label: t('nav.konzept') },
    { href: '/nachhaltigkeit', label: t('nav.nachhaltigkeit') },
    { href: '/angebote', label: t('nav.angebote') },
    { href: '/mitmachen', label: t('nav.mitmachen') },
    { href: '/spenden', label: t('nav.spenden') },
    { href: '/dokumente', label: t('nav.dokumente') },
    { href: '/app', label: t('nav.app') },
    { href: '/zellen', label: t('nav.zellen') },
    { href: '/presse', label: t('nav.presse') },
    { href: '/faq', label: t('nav.faq') },
  ]

  const getLocalizedHref = (targetLocale: string) => {
    // Strip current locale prefix from pathname to get the bare path
    let barePath = pathname
    for (const loc of locales) {
      if (barePath.startsWith(`/${loc}/`)) {
        barePath = barePath.slice(loc.length + 1)
        break
      }
      if (barePath === `/${loc}`) {
        barePath = '/'
        break
      }
    }
    return `/${targetLocale}${barePath}`
  }

  return (
    <header style={{
      background: 'var(--btb-weiss)',
      borderBottom: '2px solid var(--btb-creme)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(26,21,5,0.06)',
    }}>
      <div className="container-btb" style={{ display: 'flex', alignItems: 'center', height: 64, gap: '1.5rem' }}>
        {/* Logo */}
        <RouterLink  to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flexShrink: 0 }}>
          <img 
            src="/logo.png"
            alt="Back to Meaning Maximization Logo"
            width={44}
            height={44}
            style={{ objectFit: 'contain' }}
          />
          <span style={{
            fontFamily: 'var(--font-garamond)',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: 'var(--btb-dunkel)',
            display: 'none',
          }} className="hidden md:block">
            Back to Meaning Maximization
          </span>
        </RouterLink>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {navItems.map((item) => (
            <RouterLink 
              key={item.href}
              to={item.href}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 6,
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--btb-dunkel)',
                textDecoration: 'none',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              className="hover:bg-btb-creme hover:text-btb-rot"
            >
              {item.label}
            </RouterLink>
          ))}
        </nav>

        {/* Right side: Language + Login */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
          {/* Language Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.4rem 0.6rem', borderRadius: 6,
                border: '1px solid var(--btb-creme)',
                background: 'transparent', cursor: 'pointer',
                fontSize: '0.85rem', color: 'var(--btb-dunkel)',
                fontFamily: 'var(--font-garamond)',
              }}
              aria-label="Sprache wählen"
            >
              <Globe size={16} />
              <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{currentLocale}</span>
            </button>

            {langOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4,
                background: 'var(--btb-weiss)',
                border: '1px solid var(--btb-creme)',
                borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                minWidth: 160,
                zIndex: 200,
                padding: '0.5rem',
              }}>
                {locales.map((loc) => (
                  <RouterLink
                    key={loc}
                    to={getLocalizedHref(loc)}
                    onClick={() => setLangOpen(false)}
                    style={{
                      display: 'block',
                      padding: '0.4rem 0.75rem',
                      borderRadius: 4,
                      fontSize: '0.875rem',
                      color: loc === currentLocale ? 'var(--btb-rot)' : 'var(--btb-dunkel)',
                      fontWeight: loc === currentLocale ? 600 : 400,
                      textDecoration: 'none',
                    }}
                    className="hover:bg-btb-creme"
                  >
                    {t(`language.${loc}`)}
                  </RouterLink>
                ))}
              </div>
            )}
          </div>

          {/* Login Button */}
          <RouterLink to="https://app.backtobalance.online"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ fontSize: '0.875rem', padding: '0.5rem 1.1rem' }}
          >
            {t('nav.login')}
            <ExternalLink size={14} />
          </RouterLink>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex items-center p-1 bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--btb-dunkel)' }}
            aria-label="Menü öffnen"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="lg:hidden"
          style={{
            background: 'var(--btb-weiss)',
            borderTop: '1px solid var(--btb-creme)',
            padding: '1rem 1.5rem',
          }}
        >
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <RouterLink 
                key={item.href}
                to={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: 6,
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: 'var(--btb-dunkel)',
                  textDecoration: 'none',
                }}
                className="hover:bg-btb-creme"
              >
                {item.label}
              </RouterLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
