import './Events.css'
import SectionHeader from './SectionHeader'

function Events({ t }) {
  const allEvents = [t.events.featured, ...t.events.items]

  return (
    <section id="events" className="section alt">
      <div className="section-header split">
        <SectionHeader eyebrow={t.events.eyebrow} title={t.events.title} />
        <p className="section-note">{t.events.note}</p>
      </div>

      <div className="list">
        {allEvents.map((event, index) => (
          <article
            key={event.title}
            className="list-item reveal"
            style={{ animationDelay: `${0.1 + index * 0.08}s` }}
          >
            <div>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
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

export default Events
