
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export function ScrollToTop() {
  const pathname = useLocation().pathname

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
