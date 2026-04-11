import { useEffect, useState } from 'react'

const STORAGE_KEY = 'sogc-event-registration-links'
const UPDATE_EVENT = 'sogc:event-registration-links-updated'
const WINDOW_KEY = '__SOGC_EVENT_REGISTRATION_LINKS__'

function isValidRegistrationUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim())
}

function readRegistrationOverrides() {
  if (typeof window === 'undefined') {
    return {}
  }

  const windowOverrides = window[WINDOW_KEY]

  if (windowOverrides && typeof windowOverrides === 'object') {
    return windowOverrides
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (!storedValue) {
      return {}
    }

    const parsedValue = JSON.parse(storedValue)
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {}
  } catch {
    return {}
  }
}

function getResolvedRegistrationLink(event) {
  const overrides = readRegistrationOverrides()
  const overrideUrl = overrides?.[event.slug]

  if (isValidRegistrationUrl(overrideUrl)) {
    return overrideUrl.trim()
  }

  if (isValidRegistrationUrl(event.registrationUrl)) {
    return event.registrationUrl.trim()
  }

  return ''
}

export function useEventRegistrationLink(event) {
  const [registrationLink, setRegistrationLink] = useState(() => getResolvedRegistrationLink(event))

  useEffect(() => {
    const refreshLink = () => {
      setRegistrationLink(getResolvedRegistrationLink(event))
    }

    refreshLink()
    window.addEventListener('storage', refreshLink)
    window.addEventListener(UPDATE_EVENT, refreshLink)

    return () => {
      window.removeEventListener('storage', refreshLink)
      window.removeEventListener(UPDATE_EVENT, refreshLink)
    }
  }, [event])

  return registrationLink
}

export { STORAGE_KEY as EVENT_REGISTRATION_STORAGE_KEY, UPDATE_EVENT as EVENT_REGISTRATION_UPDATE_EVENT }
