import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, ExternalLink } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation('common')

  return (
    <footer style={{
      background: 'var(--btb-dunkel)',
      color: 'var(--btb-creme)',
      padding: '3rem 0 1.5rem',
      marginTop: '4rem',
    }}>
      <div className="container-btb">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          {/* Brand */}
          <div>
            <div style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--btb-creme)',
              marginBottom: '0.75rem',
            }}>
              Back to Meaning Maximization
            </div>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, lineHeight: 1.6, marginBottom: '1rem' }}>
              {t('footer.tagline')}
            </p>
            <RouterLink to="mailto:office@b-t-m-m.com"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                color: 'var(--btb-oliv)', fontSize: '0.875rem', textDecoration: 'none',
              }}
            >
              <Mail size={15} />
              office@b-t-m-m.com
            </RouterLink>
          </div>

          {/* Konzept */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '1rem',
              color: 'var(--btb-oliv)',
              marginBottom: '0.75rem',
            }}>
              {t('nav.konzept')}
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { href: '/konzept', label: 'Überblick' },
                { href: '/konzept/wirtschaft', label: 'Wirtschaft' },
                { href: '/konzept/gemeinschaft', label: 'Gemeinschaft' },
                { href: '/konzept/international', label: 'International' },
              ].map((item) => (
                <RouterLink 
                  key={item.href}
                  to={item.href}
                  style={{ color: 'var(--btb-creme)', fontSize: '0.875rem', opacity: 0.75, textDecoration: 'none' }}
                  className="hover:opacity-100"
                >
                  {item.label}
                </RouterLink>
              ))}
            </nav>
          </div>

          {/* Angebote */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '1rem',
              color: 'var(--btb-oliv)',
              marginBottom: '0.75rem',
            }}>
              {t('nav.angebote')}
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { href: '/angebote', label: 'Überblick' },
                { href: '/koerperarbeit', label: 'Körperarbeit' },
                { href: '/koerperarbeit/methode', label: 'Methode' },
                { href: '/koerperarbeit/preise', label: 'Preise & Buchen' },
              ].map((item) => (
                <RouterLink 
                  key={item.href}
                  to={item.href}
                  style={{ color: 'var(--btb-creme)', fontSize: '0.875rem', opacity: 0.75, textDecoration: 'none' }}
                  className="hover:opacity-100"
                >
                  {item.label}
                </RouterLink>
              ))}
            </nav>
          </div>

          {/* Mitmachen & Links */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '1rem',
              color: 'var(--btb-oliv)',
              marginBottom: '0.75rem',
            }}>
              Mitmachen
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { href: '/mitmachen', label: 'Mitglied werden' },
                { href: '/erfahrungen', label: 'Erfahrungen' },
                { href: '/gruendung', label: 'Gründung' },
                { href: '/spenden', label: 'Spenden' },
                { href: '/zellen', label: 'Zellen' },
                { href: '/faq', label: 'FAQ' },
                { href: '/dokumente', label: 'Dokumente' },
              ].map((item) => (
                <RouterLink 
                  key={item.href}
                  to={item.href}
                  style={{ color: 'var(--btb-creme)', fontSize: '0.875rem', opacity: 0.75, textDecoration: 'none' }}
                  className="hover:opacity-100"
                >
                  {item.label}
                </RouterLink>
              ))}
            </nav>
          </div>

          {/* App */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '1rem',
              color: 'var(--btb-oliv)',
              marginBottom: '0.75rem',
            }}>
              App
            </h4>
            <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '0.75rem', lineHeight: 1.5 }}>
              Die BtMM-App für Mitglieder
            </p>
            <RouterLink to="https://app.b-t-m-m.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                color: 'var(--btb-oliv)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600,
              }}
            >
              app.b-t-m-m.com
              <ExternalLink size={13} />
            </RouterLink>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(240,233,182,0.15)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>
            {t('footer.copyright')}
          </p>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <RouterLink  to="/impressum" style={{ color: 'var(--btb-creme)', fontSize: '0.8rem', opacity: 0.6, textDecoration: 'none' }}
              className="hover:opacity-100">
              {t('footer.impressum')}
            </RouterLink>
            <RouterLink  to="/impressum#datenschutz" style={{ color: 'var(--btb-creme)', fontSize: '0.8rem', opacity: 0.6, textDecoration: 'none' }}
              className="hover:opacity-100">
              {t('footer.datenschutz')}
            </RouterLink>
            <RouterLink  to="/buchungsbedingungen" style={{ color: 'var(--btb-creme)', fontSize: '0.8rem', opacity: 0.6, textDecoration: 'none' }}
              className="hover:opacity-100">
              Buchungsbedingungen
            </RouterLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
