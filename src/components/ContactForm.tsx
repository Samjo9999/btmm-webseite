
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  email: z.string().email('Bitte gültige E-Mail-Adresse eingeben'),
  nachricht: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen haben'),
  telefon: z.string().optional(),
  betreff: z.string().optional(),
})

type FormData = z.infer<typeof schema>

type Props = {
  typ?: 'kontakt' | 'mitmachen' | 'gruendung' | 'koerperarbeit'
  betreff?: string
  placeholder?: string
}

export function ContactForm({ typ = 'kontakt', betreff, placeholder }: Props) {
  const t = useTranslations('common')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { betreff: betreff || '' },
  })

  const onSubmit = async (data: FormData) => {
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, typ }),
      })
      if (res.ok) {
        setStatus('success')
        reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1.5px solid var(--btb-creme)',
    borderRadius: 8,
    fontFamily: 'var(--font-garamond)',
    fontSize: '1rem',
    color: 'var(--btb-dunkel)',
    background: 'var(--btb-weiss)',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: 500,
    marginBottom: '0.4rem',
    fontSize: '0.9rem',
    color: 'var(--btb-dunkel)',
  }

  const errorStyle: React.CSSProperties = {
    color: 'var(--btb-rot)',
    fontSize: '0.8rem',
    marginTop: '0.25rem',
  }

  if (status === 'success') {
    return (
      <div style={{
        padding: '2rem',
        background: 'rgba(143, 169, 66, 0.1)',
        borderRadius: 12,
        border: '1.5px solid var(--btb-oliv)',
        display: 'flex', alignItems: 'flex-start', gap: '1rem',
      }}>
        <CheckCircle style={{ color: 'var(--btb-oliv)', flexShrink: 0 }} size={24} />
        <div>
          <p style={{ fontWeight: 600, color: 'var(--btb-dunkel)', marginBottom: '0.25rem' }}>
            Nachricht gesendet!
          </p>
          <p style={{ color: 'var(--btb-dunkel)', opacity: 0.75, fontSize: '0.9rem' }}>
            {t('form.erfolg')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div>
          <label htmlFor="name" style={labelStyle}>{t('form.name')} *</label>
          <input
            id="name"
            type="text"
            {...register('name')}
            style={inputStyle}
            autoComplete="name"
          />
          {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" style={labelStyle}>{t('form.email')} *</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            style={inputStyle}
            autoComplete="email"
          />
          {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="telefon" style={labelStyle}>{t('form.telefon')}</label>
        <input
          id="telefon"
          type="tel"
          {...register('telefon')}
          style={inputStyle}
          autoComplete="tel"
        />
      </div>

      {!betreff && (
        <div>
          <label htmlFor="betreff" style={labelStyle}>{t('form.betreff')}</label>
          <input
            id="betreff"
            type="text"
            {...register('betreff')}
            style={inputStyle}
          />
        </div>
      )}

      <div>
        <label htmlFor="nachricht" style={labelStyle}>{t('form.nachricht')} *</label>
        <textarea
          id="nachricht"
          rows={5}
          {...register('nachricht')}
          placeholder={placeholder}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
        />
        {errors.nachricht && <p style={errorStyle}>{errors.nachricht.message}</p>}
      </div>

      {status === 'error' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--btb-rot)', fontSize: '0.9rem',
        }}>
          <AlertCircle size={18} />
          {t('form.fehler')}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary"
        style={{ alignSelf: 'flex-start', opacity: status === 'loading' ? 0.7 : 1 }}
      >
        {status === 'loading' ? (
          t('actions.laden')
        ) : (
          <>
            <Send size={16} />
            {t('form.senden')}
          </>
        )}
      </button>
    </form>
  )
}
