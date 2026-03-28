import { useEffect } from 'react'
import './ScrollReveal.css'
import useScrollDirection from './useScrollDirection'

const REVEAL_SELECTOR = '.reveal'
const REVEAL_THRESHOLD = 0.18
const HIDDEN_CLASS_BY_DIRECTION = {
  down: 'reveal-down',
  up: 'reveal-up',
}

export default function ScrollReveal() {
  const scrollDirectionRef = useScrollDirection()

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const frameMap = new WeakMap()

    const clearRevealFrame = (element) => {
      const frameId = frameMap.get(element)
      if (!frameId) {
        return
      }

      window.cancelAnimationFrame(frameId)
      frameMap.delete(element)
    }

    const applyHiddenDirection = (element) => {
      const direction = scrollDirectionRef.current === 'up' ? 'up' : 'down'
      element.classList.remove('reveal-up', 'reveal-down')
      element.classList.add(HIDDEN_CLASS_BY_DIRECTION[direction])
    }

    const activateElement = (element, observer) => {
      if (element.dataset.revealDone === 'true') {
        observer.unobserve(element)
        return
      }

      clearRevealFrame(element)
      applyHiddenDirection(element)
      element.classList.remove('active')

      const frameId = window.requestAnimationFrame(() => {
        const nestedFrameId = window.requestAnimationFrame(() => {
          element.classList.add('active')
          element.dataset.revealDone = 'true'
          element.dataset.revealObserved = 'true'
          observer.unobserve(element)
          frameMap.delete(element)
        })

        frameMap.set(element, nestedFrameId)
      })

      frameMap.set(element, frameId)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          activateElement(entry.target, observer)
        })
      },
      {
        root: null,
        threshold: REVEAL_THRESHOLD,
        rootMargin: '0px 0px -6% 0px',
      },
    )

    const observeRevealElements = () => {
      const elements = document.querySelectorAll(REVEAL_SELECTOR)

      elements.forEach((element) => {
        if (element.dataset.revealObserved === 'true' || element.dataset.revealDone === 'true') {
          return
        }

        if (element.closest('#hero')) {
          return
        }

        element.classList.remove('reveal-up', 'reveal-down', 'active')
        element.dataset.revealObserved = 'true'
        observer.observe(element)
      })
    }

    observeRevealElements()

    const mutationObserver = new MutationObserver(() => {
      observeRevealElements()
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      mutationObserver.disconnect()
      observer.disconnect()

      document.querySelectorAll(REVEAL_SELECTOR).forEach((element) => {
        clearRevealFrame(element)
        element.classList.remove('reveal-up', 'reveal-down', 'active')
        delete element.dataset.revealObserved
        delete element.dataset.revealDone
      })
    }
  }, [scrollDirectionRef])

  return null
}
