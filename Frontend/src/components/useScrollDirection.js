import { useEffect, useRef } from 'react'

export default function useScrollDirection() {
  const directionRef = useRef('down')
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    lastScrollYRef.current = window.scrollY

    const updateDirection = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollYRef.current) {
        if (directionRef.current !== 'down') {
          directionRef.current = 'down'
          console.log(directionRef.current)
        }
      } else if (currentScrollY < lastScrollYRef.current) {
        if (directionRef.current !== 'up') {
          directionRef.current = 'up'
          console.log(directionRef.current)
        }
      }

      lastScrollYRef.current = currentScrollY
    }

    window.addEventListener('scroll', updateDirection, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateDirection)
    }
  }, [])

  return directionRef
}
