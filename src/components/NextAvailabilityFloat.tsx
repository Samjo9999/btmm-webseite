
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'

const FUNCTION_URL = 'https://xcngmshjuqoucdlgikao.supabase.co/functions/v1/public-booking'

export function NextAvailabilityFloat({ companyId }: { companyId: string }) {
  const [dateLabel, setDateLabel] = useState('')
  const [time, setTime] = useState('')
  const [slotDate, setSlotDate] = useState('')
  const [slotEndTime, setSlotEndTime] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [serviceName, setServiceName] = useState('')

  useEffect(() => {
    async function findNext() {
      // First load services to get the first active one
      let svcId = ''
      try {
        const svcRes = await fetch(`${FUNCTION_URL}/services?company_id=${companyId}`)
        const svcData = await svcRes.json()
        if (svcData.services?.length > 0) {
          svcId = svcData.services[0].id
          setServiceId(svcId)
          setServiceName(svcData.services[0].name)
        }
      } catch { /* ignore */ }

      // Find first available slot with service duration
      const today = new Date()
      for (let d = 0; d <= 14; d++) {
        const check = new Date(today)
        check.setDate(today.getDate() + d)
        const dateStr = check.toISOString().split('T')[0]
        try {
          const params = new URLSearchParams({ company_id: companyId, date: dateStr, step: '15' })
          if (svcId) params.set('service_id', svcId)
          const res = await fetch(`${FUNCTION_URL}/slots?${params}`)
          const data = await res.json()
          if (data.slots && data.slots.length > 0) {
            setDateLabel(new Date(dateStr + 'T12:00:00').toLocaleDateString('de-DE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }))
            setTime(data.slots[0].start_time)
            setSlotDate(dateStr)
            setSlotEndTime(data.slots[0].end_time)
            return
          }
        } catch { /* ignore */ }
      }
    }
    findNext()
  }, [companyId])

  // Hide when near footer (IntersectionObserver)
  const [hideFloat, setHideFloat] = useState(false)
  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return
    const observer = new IntersectionObserver(([entry]) => {
      setHideFloat(entry.isIntersecting)
    }, { threshold: 0 })
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  if (!dateLabel || hideFloat) return null

  const href = `/koerperarbeit/buchen?date=${slotDate}&time=${time}&end=${slotEndTime}&service=${serviceId}&quick=1`

  return (
    <div style={{
      position: 'fixed',
      bottom: 160,
      right: 24,
      zIndex: 900,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(6px)',
      border: '1.5px solid var(--btb-blau, #2a7cab)',
      borderRadius: 10,
      padding: '0.6rem 1rem',
      color: 'var(--btb-blau, #2a7cab)',
      fontSize: '0.85rem',
      lineHeight: 1.5,
      maxWidth: '250px',
      textAlign: 'center',
    }}>
      <strong>Nächste Verfügbarkeit</strong>
      <br />
      <span style={{ color: 'var(--btb-dunkel, #1a1a1a)' }}>
        {dateLabel}, {time} Uhr
      </span>
      {serviceName && (
        <><br /><span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{serviceName}</span></>
      )}
      <br />
      <RouterLink 
        href={href}
        style={{
          display: 'inline-block',
          marginTop: '0.4rem',
          border: '1.5px solid var(--btb-blau, #2a7cab)',
          borderRadius: 6,
          padding: '0.3rem 0.75rem',
          color: 'var(--btb-blau, #2a7cab)',
          background: 'transparent',
          fontWeight: 600,
          fontSize: '0.8rem',
          textDecoration: 'none',
        }}
      >
        Termin sichern
      </RouterLink>
    </div>
  )
}
