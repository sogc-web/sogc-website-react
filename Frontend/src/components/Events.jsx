import { useEffect, useRef, useState } from 'react'
import './Events.css'
import SectionHeader from './SectionHeader'
import { eventPageCopy } from '../data/eventDetails'
import { useEventRegistrationLink } from '../lib/eventRegistration'

const eventImageModules = import.meta.glob('../assets/SOGC-Media/events/*', { eager: true, import: 'default' })

const eventListingImages = {
  'char-dwar-cycle-yatra': eventImageModules['../assets/SOGC-Media/events/chardwar_event.png'],
  'cyclodaya-vichar-vimarsh': eventImageModules['../assets/SOGC-Media/events/cycloday_event.JPG'],
  'ride-for-nation': eventImageModules['../assets/SOGC-Media/events/rideForNation_event.JPG'],
  'cycle-gair': eventImageModules['../assets/SOGC-Media/events/cycleGair_event.JPG'],
  'sunday-cycle-ride': eventImageModules['../assets/SOGC-Media/events/sundayCycleRide_event.JPG'],
}

function Events({ t, events, lang }) {
  const copy = eventPageCopy[lang] ?? eventPageCopy.en
  const listRef = useRef(null)
  const autoSlideRef = useRef(null)
  const resumeTimeoutRef = useRef(null)
  const pauseUntilRef = useRef(0)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const listElement = listRef.current
    if (!listElement || events.length <= 1) {
      return undefined
    }

    const getItems = () => Array.from(listElement.querySelectorAll('.list-item'))

    const syncCurrentSlide = () => {
      const items = getItems()
      if (!items.length) {
        return
      }

      let nearestIndex = 0
      let nearestDistance = Number.POSITIVE_INFINITY
      const containerLeft = listElement.getBoundingClientRect().left

      items.forEach((item, index) => {
        const distance = Math.abs(item.getBoundingClientRect().left - containerLeft)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = index
        }
      })

      setCurrentSlide(nearestIndex)
    }

    const pauseAutoSlide = () => {
      pauseUntilRef.current = Date.now() + 5000
      window.clearTimeout(resumeTimeoutRef.current)
      resumeTimeoutRef.current = window.setTimeout(() => {
        pauseUntilRef.current = 0
      }, 5000)
    }

    const scrollToSlide = (index, behavior = 'smooth') => {
      const items = getItems()
      const nextItem = items[index]
      if (!nextItem) {
        return
      }

      listElement.scrollTo({
        left: nextItem.offsetLeft,
        behavior,
      })
    }

    const handleScroll = () => {
      syncCurrentSlide()
    }

    listElement.addEventListener('scroll', handleScroll, { passive: true })
    listElement.addEventListener('wheel', pauseAutoSlide, { passive: true })
    listElement.addEventListener('pointerdown', pauseAutoSlide, { passive: true })
    listElement.addEventListener('touchstart', pauseAutoSlide, { passive: true })
    listElement.addEventListener('scroll', pauseAutoSlide, { passive: true })

    const startAutoSlide = () => {
      window.clearInterval(autoSlideRef.current)

      autoSlideRef.current = window.setInterval(() => {
        if (Date.now() < pauseUntilRef.current) {
          return
        }

        setCurrentSlide((previousSlide) => {
          const nextSlide = (previousSlide + 1) % events.length
          scrollToSlide(nextSlide)
          return nextSlide
        })
      }, 4200)
    }

    syncCurrentSlide()
    startAutoSlide()

    return () => {
      listElement.removeEventListener('scroll', handleScroll)
      listElement.removeEventListener('wheel', pauseAutoSlide)
      listElement.removeEventListener('pointerdown', pauseAutoSlide)
      listElement.removeEventListener('touchstart', pauseAutoSlide)
      listElement.removeEventListener('scroll', pauseAutoSlide)
      window.clearInterval(autoSlideRef.current)
      window.clearTimeout(resumeTimeoutRef.current)
    }
  }, [events.length])

  const handleDotClick = (index) => {
    const listElement = listRef.current
    const targetCard = listElement?.querySelectorAll('.list-item')[index]
    if (!listElement || !targetCard) {
      return
    }

    pauseUntilRef.current = Date.now() + 5000
    window.clearTimeout(resumeTimeoutRef.current)
    resumeTimeoutRef.current = window.setTimeout(() => {
      pauseUntilRef.current = 0
    }, 5000)

    listElement.scrollTo({
      left: targetCard.offsetLeft,
      behavior: 'smooth',
    })
    setCurrentSlide(index)
  }

  return (
    <section id="events" className="section alt">
      <div className="section-header split">
        <SectionHeader eyebrow={t.events.eyebrow} title={t.events.title} />
        <p className="section-note">{t.events.note}</p>
      </div>

      <div ref={listRef} className="list" role="list" aria-label={t.events.title}>
        {events.map((event, index) => (
          ((eventImage) => (
          <article
            key={event.slug}
            className="list-item reveal"
            style={{ animationDelay: `${0.1 + index * 0.08}s` }}
            role="listitem"
          >
            <div
              className="event-listing__image-wrap event-listing__media"
              style={eventImage ? undefined : { '--event-fallback-accent': `${120 + index * 18}deg` }}
            >
              {eventImage ? (
                <img className="event-listing__image" src={eventImage} alt={event.title} />
              ) : (
                <div className="event-listing__image event-listing__image--fallback" aria-hidden="true" />
              )}
            </div>
            <div className="event-listing__copy">
              <div className="event-listing__content">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>
              <div className="meta" aria-label={`${event.date} ${event.location}`}>
                <span>{event.date}</span>
                <span>{event.location}</span>
              </div>
              <div className="event-listing__actions">
                <a href={`#event/${event.slug}`} className="ghost-btn small">
                  {copy.viewDetailsCta}
                </a>
              </div>
            </div>
          </article>
          ))(event.image ?? eventListingImages[event.slug])
        ))}
      </div>

      {events.length > 1 ? (
        <div className="event-listing__dots" aria-label={`${t.events.title} navigation`}>
          {events.map((event, index) => (
            <button
              key={event.slug}
              type="button"
              className={`event-listing__dot${index === currentSlide ? ' is-active' : ''}`}
              aria-label={`Go to ${event.title}`}
              aria-pressed={index === currentSlide}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

function EventDetailPage({ event, lang }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const copy = eventPageCopy[lang] ?? eventPageCopy.en
  const registrationLink = useEventRegistrationLink(event)

  useEffect(() => {
    if (!isModalOpen) {
      return undefined
    }

    const handleKeyDown = (keyboardEvent) => {
      if (keyboardEvent.key === 'Escape') {
        setIsModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  const handleJoinNow = () => {
    if (registrationLink) {
      window.location.href = registrationLink
      return
    }

    setIsModalOpen(true)
  }

  return (
    <>
      <section className="event-detail-page">
        <div className="event-detail-page__hero">
          <div className="event-detail-page__copy">
            <a href="#events" className="event-detail-page__back">{copy.backToEvents}</a>
            <div className="event-detail-page__eyebrow-row">
              <span className="eyebrow" style={{ color: 'white' }}>{event.tag ?? event.date}</span>
              <span className="event-detail-page__date-pill">{event.scheduleLine}</span>
            </div>
            <h1>{event.title}</h1>
            <p className="event-detail-page__intro">{event.description}</p>
            <div className="event-detail-page__chips">
              {event.highlights.map((highlight) => (
                <span key={highlight}>{highlight}</span>
              ))}
            </div>
          </div>

          <aside className="event-detail-page__info-card">
            <div>
              <span className="event-detail-page__label">{copy.infoLabels.location}</span>
              <strong>{event.location}</strong>
            </div>
            <div>
              <span className="event-detail-page__label">{copy.infoLabels.schedule}</span>
              <strong>{event.scheduleLine}</strong>
            </div>
            <div>
              <span className="event-detail-page__label">{copy.infoLabels.booklet}</span>
              <p>{event.bookletScheduleNote}</p>
            </div>
            <button type="button" className="primary-btn event-detail-page__join-btn" onClick={handleJoinNow}>
              {copy.joinNowCta}
            </button>
          </aside>
        </div>

        <div className="event-detail-page__body">
          <article className="event-detail-page__story-card">
            <h2>{copy.detailSections.about}</h2>
            <p>{event.about}</p>
          </article>
          <article className="event-detail-page__story-card">
            <h2>{copy.detailSections.experience}</h2>
            <p>{event.experience}</p>
          </article>
        </div>
      </section>

      {isModalOpen ? (
        <div className="event-modal" role="dialog" aria-modal="true" aria-labelledby="event-coming-soon-title">
          <button
            type="button"
            className="event-modal__backdrop"
            aria-label={copy.modal.close}
            onClick={() => setIsModalOpen(false)}
          />
          <div className="event-modal__card">
            <button
              type="button"
              className="event-modal__close"
              aria-label={copy.modal.close}
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
            <span className="eyebrow">{event.title}</span>
            <h2 id="event-coming-soon-title">{copy.modal.title}</h2>
            <p>{copy.modal.description}</p>
            <div className="event-modal__schedule">
              <strong>{event.scheduleLine}</strong>
              <span>{event.bookletScheduleNote}</span>
            </div>
            <button type="button" className="primary-btn" onClick={() => setIsModalOpen(false)}>
              {copy.modal.close}
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

export { EventDetailPage }
export default Events
