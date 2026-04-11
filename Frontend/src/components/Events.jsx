import { useEffect, useState } from 'react'
import './Events.css'
import SectionHeader from './SectionHeader'
import { eventPageCopy } from '../data/eventDetails'
import { useEventRegistrationLink } from '../lib/eventRegistration'

function Events({ t, events, lang }) {
  const copy = eventPageCopy[lang] ?? eventPageCopy.en

  return (
    <section id="events" className="section alt">
      <div className="section-header split">
        <SectionHeader eyebrow={t.events.eyebrow} title={t.events.title} />
        <p className="section-note">{t.events.note}</p>
      </div>

      <div className="list">
        {events.map((event, index) => (
          <article
            key={event.slug}
            className="list-item reveal"
            style={{ animationDelay: `${0.1 + index * 0.08}s` }}
          >
            <div className="event-listing__copy">
              <div>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>
              <div className="event-listing__actions">
                <a href={`#event/${event.slug}`} className="ghost-btn small">
                  {copy.viewDetailsCta}
                </a>
              </div>
            </div>
            <div className="meta">
              <span>{event.date}</span>
              <span>{event.location}</span>
            </div>
          </article>
        ))}
      </div>
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
              <span className="eyebrow">{event.tag ?? event.date}</span>
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
