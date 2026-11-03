export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '3px solid var(--btb-creme, #f0e9b6)',
          borderTopColor: 'var(--btb-oliv, #8fa942)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{
          fontFamily: 'var(--font-garamond)',
          color: 'var(--btb-dunkel)',
          opacity: 0.6,
          fontSize: '1rem',
        }}>
          Wird geladen...
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
