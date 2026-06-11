
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CalendarDays, Clock, ChevronLeft, ChevronRight, Check, Loader2, X, Ticket } from 'lucide-react'

const SUPABASE_URL = 'https://xcngmshjuqoucdlgikao.supabase.co'
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/public-booking`

interface BookingWidgetProps {
  companyId: string
  serviceId?: string
  locationId?: string
  accentColor?: string
}

interface Slot {
  start_ts: string
  end_ts: string
  start_time: string
  end_time: string
  recommended?: boolean
}

interface ServiceBundle {
  id: string
  size: number
  price: number
  label?: string
  description?: string
}

interface Practitioner {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
  duration_min: number
  price?: number
  first_session_price?: number
  first_session_discount_percent?: number
  bundle_size?: number
  bundle_price?: number
  bundle_label?: string
  bundles?: ServiceBundle[]
  cancellation_days?: number
  late_cancel_fee_percent?: number
  allow_practitioner_selection?: boolean
  practitioners?: Practitioner[]
}

type Step = 'service' | 'date' | 'time' | 'details' | 'confirm' | 'payment' | 'success'

export function BookingWidget(props: BookingWidgetProps) {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Lade Buchungswidget...</div>}>
      <BookingWidgetInner {...props} />
    </Suspense>
  )
}

function BookingWidgetInner({ companyId, serviceId, locationId, accentColor = 'var(--btb-blau)' }: BookingWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null)

  // Check URL params for quick-book (from "Termin sichern")
  const searchParams = useSearchParams()
  const quickDate = searchParams?.get('date') || ''
  const quickTime = searchParams?.get('time') || ''
  const quickEnd = searchParams?.get('end') || ''
  const quickServiceId = searchParams?.get('service') || ''
  const isQuickBook = searchParams?.get('quick') === '1' && !!quickDate && !!quickTime
  const returnStep = searchParams?.get('step') as Step | null

  const [step, setStepRaw] = useState<Step>(returnStep || (isQuickBook ? 'details' : (quickServiceId || serviceId) ? 'date' : 'service'))
  const setStep = useCallback((s: Step) => {
    setStepRaw(s)
    // Scroll zum Widget-Anfang bei Step-Wechsel
    setTimeout(() => widgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }, [])
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string | null>(quickServiceId || (serviceId ?? null))
  const [selectedDate, setSelectedDate] = useState<string>(quickDate)
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (quickDate) return quickDate.substring(0, 7)
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(isQuickBook ? {
    start_ts: `${quickDate}T${quickTime}:00`,
    end_ts: `${quickDate}T${quickEnd}:00`,
    start_time: quickTime,
    end_time: quickEnd,
  } : null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set())
  const [loadingDates, setLoadingDates] = useState(false)
  const [suggestedFollowup, setSuggestedFollowup] = useState<{ date: string; start_time: string; end_time: string; start_ts: string; discount_percent?: number } | null>(null)
  const [showRedeemInput, setShowRedeemInput] = useState(false)
  const [redeemCode, setRedeemCode] = useState('')
  const [redeemMode, setRedeemMode] = useState(false)
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null)
  const [bundleCodes, setBundleCodes] = useState<string[] | null>(null)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)
  const [firstSessionBlocked, setFirstSessionBlocked] = useState(false)
  const [bookedPrice, setBookedPrice] = useState<number | null>(null)
  const [isFirstSession, setIsFirstSession] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState<string | null>(null)
  const [showDiscountInput, setShowDiscountInput] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [discountValid, setDiscountValid] = useState<{ type: string; value: number; code: string } | null>(null)
  const [discountError, setDiscountError] = useState('')
  const [discountLoading, setDiscountLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'bar' | 'stripe' | null>(null)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [vatEnabled, setVatEnabled] = useState(false)
  const [vatRate, setVatRate] = useState(19)
  const [selectedBundle, setSelectedBundle] = useState<ServiceBundle | null>(null)
  const [showReferralInput, setShowReferralInput] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [referralValid, setReferralValid] = useState<{ referrer_name: string; code: string } | null>(null)
  const [referralError, setReferralError] = useState('')
  const [referralLoading, setReferralLoading] = useState(false)
  const [selectedPractitioner, setSelectedPractitioner] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  // Quick-book: jump to details when URL params change
  useEffect(() => {
    if (isQuickBook) {
      setSelectedDate(quickDate)
      setSelectedSlot({
        start_ts: `${quickDate}T${quickTime}:00`,
        end_ts: `${quickDate}T${quickEnd}:00`,
        start_time: quickTime,
        end_time: quickEnd,
      })
      if (quickServiceId) setSelectedService(quickServiceId)
      setStep('details')
    }
  }, [isQuickBook, quickDate, quickTime, quickEnd, quickServiceId, setStep])

  // Services laden
  useEffect(() => {
    fetch(`${FUNCTION_URL}/services?company_id=${companyId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!serviceId) {
          setServices(d.services ?? [])
          // Quick-Book: auto-select first service
          if (isQuickBook && !selectedService && d.services?.length > 0) {
            setSelectedService(d.services[0].id)
          }
        }
        if (d.company_logo) setCompanyLogo(d.company_logo)
        if (d.vat_enabled !== undefined) setVatEnabled(d.vat_enabled)
        if (d.vat_rate !== undefined) setVatRate(d.vat_rate)
      })
      .catch(() => {})
  }, [companyId, serviceId])

  // Reset selectedPractitioner when service changes
  useEffect(() => {
    setSelectedPractitioner(null)
  }, [selectedService])

  // Verfügbare Tage für den aktuellen Monat laden
  const loadAvailableDates = useCallback(async (monthStr: string) => {
    setLoadingDates(true)
    const [year, month] = monthStr.split('-').map(Number)
    const lastDay = new Date(year, month, 0).getDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dates = new Set<string>()

    // Prüfe jeden Tag des Monats parallel (max 31 Requests)
    const promises = []
    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(year, month - 1, d)
      if (date < today) continue
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`

      const params = new URLSearchParams({ company_id: companyId, date: dateStr, step: '15' })
      if (selectedService) params.set('service_id', selectedService)
      if (locationId) params.set('location_id', locationId)

      promises.push(
        fetch(`${FUNCTION_URL}/slots?${params}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.slots && data.slots.length > 0) {
              dates.add(dateStr)
            }
          })
          .catch(() => {})
      )
    }

    await Promise.all(promises)
    setAvailableDates(dates)
    setLoadingDates(false)
  }, [companyId, selectedService, locationId])

  // Verfügbare Tage laden wenn Monat oder Service wechselt
  useEffect(() => {
    if (step === 'date' || step === 'service') {
      loadAvailableDates(currentMonth)
    }
  }, [currentMonth, step, loadAvailableDates])

  // Slots laden wenn Datum gewählt — 15-Min-Schritte
  const loadSlots = useCallback(async (date: string) => {
    setLoading(true)
    setError('')
    setSlots([])
    try {
      const params = new URLSearchParams({ company_id: companyId, date, step: '15' })
      if (selectedService) params.set('service_id', selectedService)
      if (locationId) params.set('location_id', locationId)

      const res = await fetch(`${FUNCTION_URL}/slots?${params}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSlots(data.slots ?? [])
    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden der Zeiten')
    } finally {
      setLoading(false)
    }
  }, [companyId, selectedService, locationId])

  useEffect(() => {
    if (selectedDate) loadSlots(selectedDate)
  }, [selectedDate, loadSlots])

  // Redirect to Stripe checkout — booking is created AFTER payment succeeds
  async function handleBookThenStripe() {
    if (!selectedSlot || !form.name || !form.email) return
    setLoading(true)
    setError('')
    try {
      const svc = services.find(s => s.id === selectedService) as any
      let basePrice = svc?.price ?? 0

      // Calculate price with discounts (same logic as confirm step display)
      if (svc?.first_session_price) {
        basePrice = svc.first_session_price
      } else if (svc?.first_session_discount_percent) {
        basePrice = Math.round(svc.price * (100 - svc.first_session_discount_percent)) / 100
      }
      if (discountValid) {
        if (discountValid.type === 'percent') {
          basePrice = Math.round(basePrice * (100 - discountValid.value) * 100) / 10000
        } else {
          basePrice = Math.max(0, basePrice - discountValid.value)
        }
        basePrice = Math.round(basePrice * 100) / 100
      }

      if (basePrice <= 0) {
        // Free — book directly without payment
        handleBook()
        return
      }

      // Calculate Stripe price with VAT
      const stripePrice = vatEnabled
        ? Math.round(basePrice * (1 + vatRate / 100) * 100) / 100
        : basePrice

      // Create Stripe checkout — pass booking details in metadata (NO /book call yet)
      const stripeRes = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: stripePrice,
          service_name: svc?.name || 'Körperarbeit',
          customer_email: form.email,
          customer_name: form.name,
          logo_url: companyLogo || undefined,
          stripe_description: svc?.stripe_description || undefined,
          vat_enabled: vatEnabled,
          vat_rate: vatRate,
          netto_price: basePrice,
          service_id: selectedService,
          // Deferred booking: details stored in Stripe metadata
          booking_details: {
            company_id: companyId,
            service_id: selectedService,
            location_id: locationId,
            start_ts: selectedSlot.start_ts,
            practitioner_id: selectedPractitioner || '',
            customer_name: form.name,
            customer_email: form.email,
            customer_phone: form.phone || '',
            customer_notes: form.notes || '',
            discount_code: discountValid?.code || '',
            bundle_id: selectedBundle?.id || '',
            bundle_price: selectedBundle?.price || '',
          },
        }),
      })
      const stripeData = await stripeRes.json()

      if (stripeData.url) {
        window.location.href = stripeData.url
      } else {
        // Stripe not configured — book directly
        handleBook()
      }
    } catch (e: any) {
      setError(e.message || 'Buchung fehlgeschlagen')
      setLoading(false)
    }
  }

  // Termin buchen
  async function handleBook() {
    if (!selectedSlot || !form.name || !form.email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${FUNCTION_URL}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          service_id: selectedService,
          location_id: locationId,
          start_ts: selectedSlot.start_ts,
          practitioner_id: selectedPractitioner || undefined,
          discount_code: discountValid?.code || undefined,
          referral_code: referralValid?.code || undefined,
          payment_method: paymentMethod || undefined,
          bundle_id: selectedBundle?.id || undefined,
          bundle_price: selectedBundle?.price || undefined,
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone || undefined,
            notes: form.notes || undefined,
          },
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setBookingId(data.booking_id)
      setSuggestedFollowup(data.suggested_followup ?? null)
      setBundleCodes(data.bundle_codes ?? null)
      setBookedPrice(data.price ?? null)
      setIsFirstSession(data.is_first_session ?? false)
      setAppliedDiscount(data.applied_discount ?? null)
      setStep('success')
    } catch (e: any) {
      setError(e.message || 'Buchung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  // Redeem a bundle code
  async function handleRedeem() {
    if (!selectedSlot || !form.name || !form.email || !redeemCode) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${FUNCTION_URL}/redeem-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'redeem-code',
          code: redeemCode.toUpperCase().trim(),
          start_ts: selectedSlot.start_ts,
          service_id: selectedService || undefined,
          practitioner_id: selectedPractitioner || undefined,
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone || undefined,
          },
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setBookingId(data.booking_id)
      setRedeemedCode(data.redeemed_code ?? redeemCode)
      setStep('success')
    } catch (e: any) {
      setError(e.message || 'Code-Einlösung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  // Validate redeem code and enter redeem flow
  async function handleStartRedeem() {
    if (!redeemCode.trim()) return
    setRedeemMode(true)
    setShowRedeemInput(false)
    // In redeem mode, user still picks date/time/details but payment is skipped
    setStep('date')
  }

  // Validate discount code
  async function handleValidateDiscount() {
    if (!discountCode.trim()) return
    setDiscountLoading(true)
    setDiscountError('')
    setDiscountValid(null)
    try {
      const res = await fetch(`${FUNCTION_URL}/validate-discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode.toUpperCase().trim(),
          company_id: companyId,
          service_id: selectedService || undefined,
        }),
      })
      const data = await res.json()
      if (data.valid) {
        setDiscountValid({ type: data.discount_type, value: data.discount_value, code: data.code })
        setDiscountError('')
      } else {
        setDiscountError(data.error || 'Ungueltiger Code')
        setDiscountValid(null)
      }
    } catch {
      setDiscountError('Fehler bei der Pruefung')
    } finally {
      setDiscountLoading(false)
    }
  }

  // Validate referral code
  async function handleValidateReferral() {
    if (!referralCode.trim()) return
    setReferralLoading(true)
    setReferralError('')
    setReferralValid(null)
    try {
      // For now, validate by checking if the code matches the referral_code pattern and exists
      // This will be done server-side during booking, but we can do a quick check here
      const res = await fetch(`${FUNCTION_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate-referral-code',
          code: referralCode.toUpperCase().trim(),
          company_id: companyId,
        }),
      })
      const data = await res.json()
      if (data.valid) {
        setReferralValid({ referrer_name: data.referrer_name, code: referralCode.toUpperCase().trim() })
        setReferralError('')
      } else {
        setReferralError(data.error || 'Ungültiger Referral-Code')
        setReferralValid(null)
      }
    } catch {
      setReferralError('Fehler bei der Prüfung')
    } finally {
      setReferralLoading(false)
    }
  }

  // Kalender-Monat generieren
  function getMonthDays(monthStr: string) {
    const [year, month] = monthStr.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days: Array<{ date: string; day: number; disabled: boolean; isToday: boolean; hasSlots: boolean; isPadding: boolean }> = []
    const startPad = (firstDay.getDay() + 6) % 7

    // Padding-Tage vom Vormonat
    const prevMonth = new Date(year, month - 2, 1)
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
    for (let i = startPad - 1; i >= 0; i--) {
      days.push({ date: '', day: prevMonthLastDay - i, disabled: true, isToday: false, hasSlots: false, isPadding: true })
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month - 1, d)
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const isPast = date < today
      const hasSlots = availableDates.has(dateStr)
      days.push({
        date: dateStr,
        day: d,
        disabled: isPast || !hasSlots,
        isToday: date.getTime() === today.getTime(),
        hasSlots,
        isPadding: false,
      })
    }
    return days
  }

  function changeMonth(delta: number) {
    const [y, m] = currentMonth.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const monthLabel = (() => {
    const [y, m] = currentMonth.split('-').map(Number)
    return new Date(y, m - 1).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
  })()

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  return (
    <div ref={widgetRef} style={{
      background: 'var(--btb-weiss, #fff)',
      borderRadius: 16,
      border: '1px solid rgba(42,124,171,0.2)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: accentColor,
        color: 'white',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        {companyLogo ? (
          <img src={companyLogo} alt="" style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
        ) : (
          <CalendarDays size={24} />
        )}
        <span style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.3rem', fontWeight: 600 }}>
          Termin online buchen
        </span>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* Fortschrittsleiste */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem' }}>
          {(['service', 'date', 'time', 'details', 'payment'] as Step[])
            .filter((s) => s !== 'service' || !serviceId)
            .map((s, i) => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: getStepIndex(step, !!serviceId) >= i ? 'var(--btb-oliv, #8fa942)' : '#e0e0e0',
                transition: 'background 0.3s',
              }} />
            ))}
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', color: '#b91c1c', padding: '0.75rem 1rem',
            borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <X size={16} /> {error}
          </div>
        )}

        {/* STEP: Service wählen */}
        {step === 'service' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--btb-dunkel)' }}>
              Was möchtest du buchen?
            </h3>
            {services.length === 0 ? (
              <p style={{ opacity: 0.6 }}>Lade Angebote...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {services.map((s) => {
                  const serviceBundles = s.bundles && s.bundles.length > 0 ? s.bundles : (
                    s.bundle_size && s.bundle_size > 1 && s.bundle_price
                      ? [{ id: `legacy-${s.id}`, size: s.bundle_size, price: s.bundle_price, label: s.bundle_label || `${s.bundle_size}er-Paket` }]
                      : []
                  );
                  return (
                    <div key={s.id}>
                      <button
                        onClick={() => { setSelectedService(s.id); setSelectedBundle(null); setRedeemMode(false); setStep('date') }}
                        style={{
                          background: 'var(--btb-creme, #f0e9b6)',
                          border: '2px solid transparent',
                          borderRadius: serviceBundles.length > 0 ? '10px 10px 0 0' : 10,
                          padding: '1rem 1.25rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s',
                          fontFamily: 'inherit',
                          width: '100%',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.borderColor = accentColor)}
                        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--btb-dunkel)' }}>
                          {s.name}
                          {s.price ? <span style={{ fontWeight: 400, marginLeft: '0.5rem', fontSize: '0.9rem' }}>{s.price} €</span> : ''}
                        </div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.25rem' }}>
                          <Clock size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> {s.duration_min} Min.
                        </div>
                      </button>
                      {serviceBundles.length > 0 && (
                        <div style={{
                          background: 'rgba(143,169,66,0.08)',
                          borderRadius: '0 0 10px 10px',
                          padding: '0.5rem 1.25rem',
                          borderTop: '1px solid rgba(143,169,66,0.2)',
                        }}>
                          {serviceBundles.map((bundle) => (
                            <button
                              key={bundle.id}
                              onClick={() => { setSelectedService(s.id); setSelectedBundle(bundle); setRedeemMode(false); setStep('date') }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                padding: '0.4rem 0',
                                fontSize: '0.85rem',
                                color: 'var(--btb-oliv, #8fa942)',
                                fontWeight: 600,
                              }}
                              onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                              onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                            >
                              <span style={{ marginRight: '0.4rem', opacity: 0.5 }}>└</span>
                              {bundle.label || `${bundle.size}er-Paket`}: {bundle.price} €
                              {s.price ? <span style={{ fontWeight: 400, opacity: 0.7, marginLeft: '0.5rem' }}>({(bundle.price / bundle.size).toFixed(2)} €/Sitzung)</span> : ''}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Redeem code section */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
              {!showRedeemInput ? (
                <button
                  onClick={() => setShowRedeemInput(true)}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid var(--btb-oliv, #8fa942)',
                    color: 'var(--btb-oliv, #8fa942)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontFamily: 'inherit',
                    padding: '0.5rem 1rem',
                    borderRadius: 8,
                    fontWeight: 600,
                    width: '100%',
                    justifyContent: 'center',
                  }}
                >
                  <Ticket size={16} /> Buchungscode einl&ouml;sen
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="BTB-XXXX-XXXX"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    style={{
                      ...inputStyle,
                      flex: 1,
                      fontFamily: 'monospace',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}
                  />
                  <button
                    onClick={handleStartRedeem}
                    disabled={!redeemCode.trim()}
                    style={{
                      background: redeemCode.trim() ? 'var(--btb-oliv, #8fa942)' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: 10,
                      padding: '0.75rem 1.25rem',
                      fontWeight: 600,
                      cursor: redeemCode.trim() ? 'pointer' : 'default',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Einl&ouml;sen
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP: Datum wählen */}
        {step === 'date' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--btb-dunkel)' }}>
              Wähle einen Tag
            </h3>
            {loadingDates && (
              <div style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', display: 'inline', verticalAlign: '-3px', marginRight: 6 }} />
                Verfügbarkeiten werden geladen...
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <button onClick={() => changeMonth(-1)} style={navBtnStyle}><ChevronLeft size={18} /></button>
              <span style={{ fontWeight: 600, fontSize: '1rem' }}>{monthLabel}</span>
              <button onClick={() => changeMonth(1)} style={navBtnStyle}><ChevronRight size={18} /></button>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center',
            }}>
              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
                <div key={d} style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.5, padding: '0.25rem' }}>{d}</div>
              ))}
              {getMonthDays(currentMonth).map((d, i) => {
                const isSelected = d.date === selectedDate
                const isPast = d.disabled && !d.isPadding && d.date !== ''
                const noSlots = !d.isPadding && !d.disabled && false // disabled already handles this
                const unavailable = !d.isPadding && d.date !== '' && !d.hasSlots && !isPast

                return (
                  <button
                    key={i}
                    disabled={d.disabled || !d.date}
                    onClick={() => { setSelectedDate(d.date); setStep('time') }}
                    style={{
                      background: isSelected ? accentColor : d.hasSlots ? 'rgba(143,169,66,0.15)' : d.isPadding ? 'transparent' : d.isToday ? 'var(--btb-creme, #f0e9b6)' : 'transparent',
                      color: isSelected ? 'white' : d.isPadding ? '#ddd' : isPast ? '#ccc' : unavailable ? '#bbb' : d.hasSlots ? 'var(--btb-oliv, #8fa942)' : 'var(--btb-dunkel)',
                      border: d.hasSlots && !isSelected ? '1px solid var(--btb-oliv, #8fa942)' : 'none',
                      borderRadius: 8,
                      padding: '0.5rem',
                      cursor: d.disabled || !d.date ? 'default' : 'pointer',
                      fontWeight: d.isToday ? 700 : d.hasSlots ? 700 : 400,
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      textDecoration: (unavailable || isPast) ? 'line-through' : 'none',
                      position: 'relative',
                    }}
                  >
                    {d.day || ''}
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#999', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: 'rgba(143,169,66,0.15)', border: '1px solid var(--btb-oliv, #8fa942)', verticalAlign: 'middle', marginRight: 4 }} />Verfügbar</span>
              <span style={{ textDecoration: 'line-through' }}>Nicht verfügbar</span>
            </div>
          </div>
        )}

        {/* STEP: Uhrzeit wählen — 15-Min-Schritte */}
        {step === 'time' && (
          <div>
            <button onClick={() => setStep('date')} style={backBtnStyle}>
              <ChevronLeft size={16} /> Zurück
            </button>
            <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--btb-dunkel)' }}>
              {selectedDateLabel}
            </h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.75rem' }}>
              Verfügbare Zeiten in 15-Minuten-Schritten
            </p>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: accentColor }} />
              </div>
            ) : slots.length === 0 ? (
              <p style={{ opacity: 0.6, padding: '1rem 0' }}>
                Keine freien Zeiten an diesem Tag. Bitte wähle einen anderen Tag.
              </p>
            ) : (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.4rem',
                marginTop: '0.5rem',
              }}>
                {slots.map((s) => (
                  <button
                    key={s.start_ts}
                    onClick={() => { setSelectedSlot(s); setStep('details') }}
                    style={{
                      background: selectedSlot?.start_ts === s.start_ts ? accentColor : s.recommended ? 'rgba(143,169,66,0.18)' : 'var(--btb-creme, #f0e9b6)',
                      color: selectedSlot?.start_ts === s.start_ts ? 'white' : 'var(--btb-dunkel)',
                      border: s.recommended && selectedSlot?.start_ts !== s.start_ts ? '2px solid var(--btb-oliv, #8fa942)' : '2px solid transparent',
                      borderRadius: 8,
                      padding: '0.6rem 0.4rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      if (selectedSlot?.start_ts !== s.start_ts) e.currentTarget.style.borderColor = accentColor
                    }}
                    onMouseOut={(e) => {
                      if (s.recommended && selectedSlot?.start_ts !== s.start_ts) {
                        e.currentTarget.style.borderColor = 'var(--btb-oliv, #8fa942)'
                      } else {
                        e.currentTarget.style.borderColor = 'transparent'
                      }
                    }}
                  >
                    {s.start_time}
                    {s.recommended && (
                      <span style={{ fontSize: '0.65rem', color: selectedSlot?.start_ts === s.start_ts ? 'rgba(255,255,255,0.85)' : 'var(--btb-oliv, #8fa942)', display: 'block', marginTop: '0.1rem' }}>
                        Empfohlen
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP: Kontaktdaten */}
        {step === 'details' && (
          <div>
            <button onClick={() => setStep('time')} style={backBtnStyle}>
              <ChevronLeft size={16} /> Zurück
            </button>
            <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.2rem', marginBottom: '0.25rem', color: 'var(--btb-dunkel)' }}>
              Deine Kontaktdaten
            </h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1rem' }}>
              {selectedDateLabel}, {selectedSlot?.start_time} – {selectedSlot?.end_time} Uhr
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="text" placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
              <input type="email" placeholder="E-Mail *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
              <input type="tel" placeholder="Telefon (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />

              {/* Practitioner selection */}
              {services.find(s => s.id === selectedService)?.allow_practitioner_selection &&
               services.find(s => s.id === selectedService)?.practitioners &&
               services.find(s => s.id === selectedService)!.practitioners!.length > 0 && (
                <>
                  <label style={{ fontSize: '0.9rem', fontWeight: 500, display: 'block', marginBottom: '0.3rem', marginTop: '0.25rem' }}>
                    Mitarbeiter *
                  </label>
                  <select
                    value={selectedPractitioner || ''}
                    onChange={(e) => setSelectedPractitioner(e.target.value || null)}
                    required
                    style={inputStyle}
                  >
                    <option value="">-- Mitarbeiter wählen --</option>
                    {services.find(s => s.id === selectedService)?.practitioners?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </>
              )}

              <textarea placeholder="Anmerkungen (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

              {/* Bundle code in details step (for quick-book users who skipped service step) */}
              {!redeemMode && !showRedeemInput && (
                <button
                  type="button"
                  onClick={() => setShowRedeemInput(true)}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid var(--btb-oliv, #8fa942)',
                    color: 'var(--btb-oliv, #8fa942)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontFamily: 'inherit',
                    padding: '0.4rem 1rem',
                    borderRadius: 8,
                    fontWeight: 600,
                    justifyContent: 'center',
                  }}
                >
                  <Ticket size={14} /> Buchungscode einlösen
                </button>
              )}
              {showRedeemInput && !redeemMode && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="BTB-XXXX-XXXX"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', letterSpacing: '1px', textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={() => { setRedeemMode(true); setShowRedeemInput(false) }}
                    disabled={!redeemCode.trim()}
                    style={{
                      background: redeemCode.trim() ? 'var(--btb-oliv, #8fa942)' : '#ccc',
                      color: 'white', border: 'none', borderRadius: 8,
                      padding: '0.7rem 1rem', fontWeight: 600, fontSize: '0.9rem',
                      cursor: redeemCode.trim() ? 'pointer' : 'default', fontFamily: 'inherit',
                    }}
                  >
                    OK
                  </button>
                </div>
              )}
              {redeemMode && (
                <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(143,169,66,0.1)', border: '1px solid var(--btb-oliv, #8fa942)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--btb-oliv)' }}>
                  <Ticket size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                  Buchungscode: <strong>{redeemCode}</strong> — Preis entfällt
                </div>
              )}

              {/* Referral code input */}
              {!referralValid && !showReferralInput && (
                <button
                  type="button"
                  onClick={() => setShowReferralInput(true)}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid var(--btb-oliv, #8fa942)',
                    color: 'var(--btb-oliv, #8fa942)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontFamily: 'inherit',
                    padding: '0.4rem 1rem',
                    borderRadius: 8,
                    fontWeight: 600,
                    justifyContent: 'center',
                  }}
                >
                  ✨ Mit Referral-Code buchen
                </button>
              )}
              {showReferralInput && !referralValid && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                    <input
                      type="text"
                      placeholder="BTB-XXXX-XXXX"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      disabled={referralLoading}
                      style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', letterSpacing: '1px', textTransform: 'uppercase' }}
                    />
                    <button
                      type="button"
                      onClick={handleValidateReferral}
                      disabled={!referralCode.trim() || referralLoading}
                      style={{
                        background: (referralCode.trim() && !referralLoading) ? 'var(--btb-oliv, #8fa942)' : '#ccc',
                        color: 'white', border: 'none', borderRadius: 8,
                        padding: '0.7rem 1rem', fontWeight: 600, fontSize: '0.9rem',
                        cursor: (referralCode.trim() && !referralLoading) ? 'pointer' : 'default', fontFamily: 'inherit',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {referralLoading ? 'Prüfe...' : 'OK'}
                    </button>
                  </div>
                  {referralError && (
                    <div style={{ fontSize: '0.8rem', color: '#b61818', background: 'rgba(182,24,24,0.08)', padding: '0.4rem 0.6rem', borderRadius: 6, width: '100%' }}>
                      {referralError}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setShowReferralInput(false); setReferralCode(''); setReferralError('') }}
                    style={{ background: 'none', border: 'none', color: 'var(--btb-oliv, #8fa942)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                  >
                    Abbrechen
                  </button>
                </div>
              )}
              {referralValid && (
                <div style={{ padding: '0.75rem', background: 'rgba(143,169,66,0.15)', border: '1px solid var(--btb-oliv, #8fa942)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--btb-oliv)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>✨ Empfohlen von {referralValid.referrer_name}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Code: <strong>{referralValid.code}</strong> — 70€ Neukunden-Preis für beide</div>
                  <button
                    type="button"
                    onClick={() => { setReferralValid(null); setReferralCode(''); setReferralError(''); setShowReferralInput(false) }}
                    style={{ background: 'none', border: 'none', color: 'var(--btb-oliv, #8fa942)', cursor: 'pointer', fontSize: '0.75rem', padding: '0.25rem 0', marginTop: '0.25rem' }}
                  >
                    Code entfernen
                  </button>
                </div>
              )}

              {firstSessionBlocked && (
                <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(182,24,24,0.08)', border: '1px solid rgba(182,24,24,0.2)', borderRadius: 8, fontSize: '0.85rem', color: '#b61818' }}>
                  <strong>Hinweis:</strong> Du warst bereits Kunde. Der Kennenlernpreis gilt nur für Neukunden. Bitte wähle die reguläre Einzelsitzung.
                </div>
              )}
              <button
                onClick={async () => {
                  // Check practitioner selection if required
                  const svc = services.find(s => s.id === selectedService) as any
                  if (svc?.allow_practitioner_selection && svc?.practitioners && svc.practitioners.length > 0) {
                    if (!selectedPractitioner) {
                      setError('Bitte wähle einen Mitarbeiter')
                      return
                    }
                  }

                  // Check first-session eligibility if service has first_session_price
                  if (svc?.first_session_price && form.email) {
                    try {
                      const res = await fetch(`${FUNCTION_URL}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'check-first-session', company_id: companyId, email: form.email }),
                      })
                      const data = await res.json()
                      if (!data.is_first) {
                        setFirstSessionBlocked(true)
                        return
                      }
                    } catch { /* proceed on error */ }
                  }
                  setFirstSessionBlocked(false)
                  setError('')
                  setStep('confirm')
                }}
                disabled={!form.name || !form.email || firstSessionBlocked}
                style={{
                  background: (form.name && form.email && !firstSessionBlocked) ? 'var(--btb-oliv, #8fa942)' : '#ccc',
                  color: 'white', border: 'none', borderRadius: 10,
                  padding: '0.9rem', fontWeight: 600, fontSize: '1rem',
                  cursor: (form.name && form.email && !firstSessionBlocked) ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                }}
              >
                Weiter zur Bestätigung
              </button>
            </div>
          </div>
        )}

        {/* STEP: Bestätigung */}
        {step === 'confirm' && (
          <div>
            <button onClick={() => setStep('details')} style={backBtnStyle}>
              <ChevronLeft size={16} /> Zurück
            </button>
            <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--btb-dunkel)' }}>
              Termin bestätigen
            </h3>
            <div style={{
              background: 'var(--btb-creme, #f0e9b6)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem',
            }}>
              {(() => {
                const svc = services.find(s => s.id === selectedService)
                return svc ? (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Service:</strong> {svc.name} ({svc.duration_min} Min.)
                    {selectedBundle && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--btb-oliv, #8fa942)', fontWeight: 600, marginTop: '0.25rem' }}>
                        {selectedBundle.label || `${selectedBundle.size}er-Paket`} — {selectedBundle.price} €
                        {svc.price ? ` (${(selectedBundle.price / selectedBundle.size).toFixed(2)} €/Sitzung)` : ''}
                      </div>
                    )}
                  </div>
                ) : null
              })()}
              <div style={{ marginBottom: '0.5rem' }}><strong>Datum:</strong> {selectedDateLabel}</div>
              <div style={{ marginBottom: '0.5rem' }}><strong>Uhrzeit:</strong> {selectedSlot?.start_time} – {selectedSlot?.end_time} Uhr</div>
              {(() => {
                const svc = services.find(s => s.id === selectedService) as any
                if (redeemMode) {
                  return (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--btb-oliv, #8fa942)' }}>
                        <strong>Preis:</strong> 0 &euro;
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--btb-oliv, #8fa942)', fontWeight: 600, marginTop: '0.25rem' }}>
                        Buchungscode eingeloest
                      </p>
                    </div>
                  )
                }
                if (!svc?.price) return null
                const hasFirstDiscount = svc.first_session_price || (svc.first_session_discount_percent && svc.first_session_discount_percent > 0)
                let basePrice = svc.price
                let displayPrice = basePrice
                let priceNote = ''

                if (hasFirstDiscount) {
                  displayPrice = svc.first_session_price
                    ? svc.first_session_price
                    : Math.round(svc.price * (100 - svc.first_session_discount_percent)) / 100
                  priceNote = 'Erstsitzungs-Vorteil — dein erster Termin zum Sonderpreis'
                }

                // Apply discount code on top
                let finalPrice = displayPrice
                if (discountValid) {
                  const priceBeforeDiscount = displayPrice
                  if (discountValid.type === 'percent') {
                    finalPrice = Math.round(priceBeforeDiscount * (100 - discountValid.value) * 100) / 10000
                  } else {
                    finalPrice = Math.max(0, priceBeforeDiscount - discountValid.value)
                  }
                  finalPrice = Math.round(finalPrice * 100) / 100
                }

                const hasAnyDiscount = hasFirstDiscount || discountValid
                const shownPrice = discountValid ? finalPrice : (hasFirstDiscount ? displayPrice : svc.price)
                const vatAmount = vatEnabled ? Math.round(shownPrice * vatRate) / 100 : 0
                const bruttoPrice = vatEnabled ? Math.round((shownPrice + vatAmount) * 100) / 100 : shownPrice
                return (
                  <div style={{ marginBottom: '0.5rem' }}>
                    {vatEnabled ? (
                      <div>
                        <div style={{ fontSize: '0.95rem', color: 'var(--btb-dunkel)' }}>
                          <strong>Netto:</strong>{' '}
                          {hasAnyDiscount ? (
                            <>
                              <span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: '0.5rem' }}>{svc.price.toFixed(2).replace('.', ',')} &euro;</span>
                              <span style={{ color: 'var(--btb-oliv, #8fa942)' }}>{shownPrice.toFixed(2).replace('.', ',')} &euro;</span>
                            </>
                          ) : (
                            <>{shownPrice.toFixed(2).replace('.', ',')} &euro;</>
                          )}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--btb-dunkel)', opacity: 0.7 }}>
                          <strong>zzgl. {vatRate}% MwSt:</strong> {vatAmount.toFixed(2).replace('.', ',')} &euro;
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--btb-dunkel)' }}>
                          <strong>Gesamt:</strong> {bruttoPrice.toFixed(2).replace('.', ',')} &euro;
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--btb-dunkel)' }}>
                        <strong>Preis:</strong>{' '}
                        {hasAnyDiscount ? (
                          <>
                            <span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: '0.5rem' }}>{svc.price} &euro;</span>
                            <span style={{ color: 'var(--btb-oliv, #8fa942)' }}>{discountValid ? finalPrice : displayPrice} &euro;</span>
                          </>
                        ) : (
                          <>{svc.price} &euro;</>
                        )}
                      </div>
                    )}
                    {!vatEnabled && (
                      <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.25rem' }}>
                        Gem&auml;&szlig; &sect; 19 UStG wird keine MwSt erhoben
                      </p>
                    )}
                    {hasFirstDiscount && !discountValid && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--btb-oliv, #8fa942)', fontWeight: 600, marginTop: '0.25rem' }}>
                        {priceNote}
                      </p>
                    )}
                    {discountValid && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--btb-oliv, #8fa942)', fontWeight: 600, marginTop: '0.25rem' }}>
                        Rabattcode {discountValid.code} angewendet — {discountValid.type === 'percent' ? `${discountValid.value}%` : `${discountValid.value} \u20AC`} Rabatt
                      </p>
                    )}
                  </div>
                )
              })()}
              <div style={{ marginBottom: '0.5rem' }}><strong>Name:</strong> {form.name}</div>
              <div><strong>E-Mail:</strong> {form.email}</div>
              {form.phone && <div style={{ marginTop: '0.5rem' }}><strong>Telefon:</strong> {form.phone}</div>}
              {form.notes && <div style={{ marginTop: '0.5rem' }}><strong>Hinweis:</strong> {form.notes}</div>}
              {redeemMode && (
                <div style={{ marginTop: '0.5rem', color: 'var(--btb-oliv, #8fa942)', fontWeight: 600 }}>
                  <Ticket size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                  Buchungscode: {redeemCode}
                </div>
              )}
              {(() => {
                const svc = services.find(s => s.id === selectedService) as any
                if (!svc) return null
                if (svc.cancellation_days === 0) {
                  return (
                    <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(182,24,24,0.08)', border: '1px solid rgba(182,24,24,0.2)', borderRadius: 8, fontSize: '0.8rem', color: '#b61818' }}>
                      <strong>Hinweis:</strong> Für diesen Service ist keine Stornierung möglich. Mit der Buchung akzeptierst du, dass der volle Preis fällig wird.
                    </div>
                  )
                }
                if (svc.cancellation_days) {
                  return (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', opacity: 0.6 }}>
                      Kostenfreie Stornierung bis {svc.cancellation_days} Tage vor dem Termin.
                      {svc.late_cancel_fee_percent > 0 && ` Danach fällt eine Gebühr von ${svc.late_cancel_fee_percent}% an.`}
                    </div>
                  )
                }
                return null
              })()}
            </div>

            {/* Discount code section — only show when not in redeem mode */}
            {!redeemMode && (
              <div style={{ marginBottom: '1rem' }}>
                {!showDiscountInput ? (
                  <button
                    onClick={() => setShowDiscountInput(true)}
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--btb-blau, #2a7cab)',
                      color: 'var(--btb-blau, #2a7cab)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      padding: '0.4rem 1rem',
                      fontFamily: 'inherit',
                      borderRadius: 8,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Ticket size={14} /> Rabattcode einlösen
                  </button>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Code eingeben"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        style={{
                          ...inputStyle,
                          flex: 1,
                          fontFamily: 'monospace',
                          textTransform: 'uppercase',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.9rem',
                        }}
                      />
                      <button
                        onClick={handleValidateDiscount}
                        disabled={!discountCode.trim() || discountLoading}
                        style={{
                          background: discountCode.trim() ? 'var(--btb-blau)' : '#ccc',
                          color: 'white', border: 'none', borderRadius: 8,
                          padding: '0.5rem 1rem', fontWeight: 600, fontSize: '0.85rem',
                          cursor: discountCode.trim() && !discountLoading ? 'pointer' : 'default',
                          fontFamily: 'inherit', whiteSpace: 'nowrap',
                        }}
                      >
                        {discountLoading ? '...' : 'Einloesen'}
                      </button>
                    </div>
                    {discountError && (
                      <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '0.4rem' }}>{discountError}</p>
                    )}
                    {discountValid && (
                      <p style={{ color: 'var(--btb-oliv, #8fa942)', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 600 }}>
                        <Check size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                        {discountValid.type === 'percent' ? `${discountValid.value}% Rabatt` : `${discountValid.value} \u20AC Rabatt`} mit Code {discountValid.code}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '0.5rem' }}>
                <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)}
                  style={{ marginTop: '0.2rem', accentColor: 'var(--btb-blau)' }} />
                <span>Ich akzeptiere die <a href="/buchungsbedingungen" target="_blank" style={{ color: 'var(--btb-blau)', textDecoration: 'underline' }}>Buchungsbedingungen</a> *</span>
              </label>
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)}
                  style={{ marginTop: '0.2rem', accentColor: 'var(--btb-blau)' }} />
                <span>Ich akzeptiere die <a href="/impressum#datenschutz" target="_blank" style={{ color: 'var(--btb-blau)', textDecoration: 'underline' }}>Datenschutzhinweise</a> *</span>
              </label>
            </div>
            <button
              onClick={redeemMode ? handleRedeem : () => setStep('payment')}
              disabled={loading || !acceptTerms || !acceptPrivacy}
              style={{
                background: (!acceptTerms || !acceptPrivacy) ? '#ccc' : 'var(--btb-oliv, #8fa942)', color: 'white', border: 'none', borderRadius: 10,
                padding: '0.9rem', fontWeight: 600, fontSize: '1rem',
                cursor: (loading || !acceptTerms || !acceptPrivacy) ? 'default' : 'pointer', width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontFamily: 'inherit',
              }}
            >
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={18} />}
              {loading ? 'Wird gebucht...' : redeemMode ? 'Code einlösen und buchen' : 'Jetzt verbindlich buchen'}
            </button>
          </div>
        )}

        {/* STEP: Zahlungsart */}
        {step === 'payment' && (
          <div>
            <button onClick={() => setStep('confirm')} style={backBtnStyle}>
              <ChevronLeft size={16} /> Zurück
            </button>
            <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--btb-dunkel)' }}>
              Wie möchtest du bezahlen?
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {/* Bar option */}
              <button
                onClick={() => setPaymentMethod('bar')}
                style={{
                  background: paymentMethod === 'bar' ? 'rgba(143,169,66,0.15)' : 'var(--btb-creme)',
                  border: paymentMethod === 'bar' ? '2px solid var(--btb-oliv)' : '2px solid transparent',
                  borderRadius: 10,
                  padding: '1rem 1.25rem',
                  textAlign: 'left' as const,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--btb-dunkel)', marginBottom: '0.25rem' }}>
                  Vor Ort bar bezahlen
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                  Zahlung bei deinem Termin in bar oder per EC-Karte
                </div>
              </button>

              {/* Online payment option */}
              <button
                onClick={() => setPaymentMethod('stripe')}
                style={{
                  background: paymentMethod === 'stripe' ? 'rgba(42,124,171,0.1)' : 'var(--btb-creme)',
                  border: paymentMethod === 'stripe' ? '2px solid var(--btb-blau)' : '2px solid transparent',
                  borderRadius: 10,
                  padding: '1rem 1.25rem',
                  textAlign: 'left' as const,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--btb-dunkel)', marginBottom: '0.25rem' }}>
                  Online bezahlen
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                  Karte, SEPA-Lastschrift, Google Pay, PayPal u.a.
                </div>
              </button>
            </div>

            <button
              onClick={() => {
                if (paymentMethod === 'stripe') {
                  handleBookThenStripe()
                } else {
                  handleBook()
                }
              }}
              disabled={!paymentMethod || loading}
              style={{
                background: paymentMethod ? 'var(--btb-oliv)' : '#ccc',
                color: 'white', border: 'none', borderRadius: 10,
                padding: '0.9rem', fontWeight: 600, fontSize: '1rem',
                cursor: paymentMethod && !loading ? 'pointer' : 'default',
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontFamily: 'inherit',
              }}
            >
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={18} />}
              {loading ? 'Wird gebucht...' : paymentMethod === 'stripe' ? 'Jetzt bezahlen & buchen' : 'Termin buchen — Zahlung vor Ort'}
            </button>
          </div>
        )}

        {/* STEP: Erfolg */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'var(--btb-oliv, #8fa942)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <Check size={32} color="white" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.4rem', color: 'var(--btb-dunkel)', marginBottom: '0.5rem' }}>
              {redeemedCode ? 'Buchungscode eingelöst!' : 'Termin gebucht!'}
            </h3>
            {isFirstSession && (
              <p style={{ color: 'var(--btb-oliv, #8fa942)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
                Willkommen! Dein Erstsitzungs-Vorteil wurde angewendet.
              </p>
            )}
            {bookedPrice !== null && (
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--btb-dunkel)', marginBottom: '0.5rem' }}>
                {appliedDiscount ? (
                  <><span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: '0.5rem' }}>{(() => { const svc = services.find(s => s.id === selectedService) as any; return svc?.price ? `${svc.price} €` : ''; })()}</span>{bookedPrice} €</>
                ) : (
                  <>{bookedPrice} €</>
                )}
              </p>
            )}
            <p style={{ opacity: 0.7, lineHeight: 1.7, marginBottom: '0.5rem' }}>
              Du erhältst eine Bestätigung an <strong>{form.email}</strong>.
            </p>
            {paymentMethod === 'bar' && bookedPrice !== null && bookedPrice > 0 && (
              <p style={{ fontSize: '0.9rem', color: 'var(--btb-dunkel)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Bitte bezahle den Betrag von {bookedPrice} &euro; bei deinem Termin vor Ort.
              </p>
            )}
            {paymentMethod === 'stripe' && (
              <p style={{ fontSize: '0.9rem', color: 'var(--btb-blau, #2a7cab)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Die Zahlung wird über Stripe abgewickelt.
              </p>
            )}
            {redeemedCode && (
              <p style={{ fontSize: '0.9rem', color: 'var(--btb-oliv, #8fa942)', fontWeight: 600, marginBottom: '0.5rem' }}>
                <Ticket size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                Code {redeemedCode} erfolgreich eingelöst
              </p>
            )}
            {discountValid && !redeemedCode && (
              <p style={{ fontSize: '0.9rem', color: 'var(--btb-oliv, #8fa942)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Rabattcode {discountValid.code} angewendet — {discountValid.type === 'percent' ? `${discountValid.value}%` : `${discountValid.value} \u20AC`} Rabatt
              </p>
            )}
            {bookingId && (
              <p style={{ fontSize: '0.85rem', opacity: 0.5 }}>Buchungs-ID: {bookingId}</p>
            )}
            {bundleCodes && bundleCodes.length > 0 && (
              <div style={{
                marginTop: '1rem',
                background: 'rgba(143,169,66,0.1)',
                border: '1px solid var(--btb-oliv, #8fa942)',
                borderRadius: 12,
                padding: '1rem 1.25rem',
                textAlign: 'left',
              }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--btb-oliv, #8fa942)', marginBottom: '0.5rem' }}>
                  <Ticket size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                  Deine Buchungscodes ({bundleCodes.length})
                </p>
                <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.75rem' }}>
                  Du erhältst diese Codes auch per E-Mail. Löse sie für deine weiteren Sitzungen ein.
                </p>
                {bundleCodes.map((c) => (
                  <div key={c} style={{
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    background: 'var(--btb-creme, #f0e9b6)',
                    borderRadius: 6,
                    padding: '0.5rem 1rem',
                    marginBottom: '0.35rem',
                    textAlign: 'center',
                  }}>
                    {c}
                  </div>
                ))}
              </div>
            )}

            {/* Follow-up suggestion */}
            {suggestedFollowup && (
              <div style={{
                marginTop: '1.25rem',
                background: 'rgba(143,169,66,0.1)',
                border: '1px solid var(--btb-oliv, #8fa942)',
                borderRadius: 12,
                padding: '1rem 1.25rem',
                textAlign: 'left',
              }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--btb-oliv, #8fa942)', marginBottom: '0.5rem' }}>
                  Nächste Verfügbarkeit
                </p>
                <p style={{ fontSize: '1rem', color: 'var(--btb-dunkel)', marginBottom: '0.5rem' }}>
                  {new Date(suggestedFollowup.date + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })} um {suggestedFollowup.start_time} Uhr
                </p>
                {suggestedFollowup.discount_percent && suggestedFollowup.discount_percent > 0 && (
                  <p style={{ fontSize: '0.95rem', color: 'var(--btb-oliv, #8fa942)', fontWeight: 700, marginBottom: '0.75rem' }}>
                    {suggestedFollowup.discount_percent}% Rabatt bei Folgetermin-Buchung
                  </p>
                )}
                <button
                  onClick={async () => {
                    if (!suggestedFollowup || !form.name || !form.email) return
                    setLoading(true)
                    setError('')
                    try {
                      const res = await fetch(`${FUNCTION_URL}/book`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          company_id: companyId,
                          service_id: selectedService,
                          start_ts: suggestedFollowup.start_ts,
                          practitioner_id: selectedPractitioner || undefined,
                          customer: {
                            name: form.name,
                            email: form.email,
                            phone: form.phone || undefined,
                          },
                        }),
                      })
                      const data = await res.json()
                      if (data.error) throw new Error(data.error)
                      setBookingId(data.booking_id)
                      setSuggestedFollowup(data.suggested_followup ?? null)
                    } catch (e: any) {
                      setError(e.message || 'Buchung fehlgeschlagen')
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                  style={{
                    background: 'var(--btb-oliv, #8fa942)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.6rem 1.25rem',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: loading ? 'wait' : 'pointer',
                    fontFamily: 'inherit',
                    width: '100%',
                  }}
                >
                  {loading ? 'Wird gebucht...' : 'Termin sichern'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function getStepIndex(step: Step, hasService: boolean): number {
  const steps: Step[] = hasService
    ? ['date', 'time', 'details', 'confirm', 'payment', 'success']
    : ['service', 'date', 'time', 'details', 'confirm', 'payment', 'success']
  return steps.indexOf(step)
}

const navBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #ddd',
  borderRadius: 8,
  padding: '0.4rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
}

const backBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--btb-blau)',
  cursor: 'pointer',
  fontSize: '0.9rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  marginBottom: '0.75rem',
  padding: 0,
  fontFamily: 'inherit',
}

const inputStyle: React.CSSProperties = {
  background: 'var(--btb-creme, #f0e9b6)',
  border: '2px solid transparent',
  borderRadius: 10,
  padding: '0.75rem 1rem',
  fontSize: '1rem',
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
}
