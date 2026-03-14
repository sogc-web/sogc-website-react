import SectionHeader from './SectionHeader'

function Events({ t }) {
  return (
    <section id="events" className="section alt">
      <div className="section-header split">
        <SectionHeader eyebrow={t.events.eyebrow} title={t.events.title} />
        <p className="section-note">{t.events.note}</p>
      </div>

      <article className="featured-event reveal">
        <div>
          <p className="eyebrow">{t.events.featuredLabel}</p>
          <h3>{t.events.featured.title}</h3>
          <p>{t.events.featured.description}</p>
        </div>
        <div className="featured-meta">
          <span>{t.events.featured.date}</span>
          <span>{t.events.featured.location}</span>
        </div>
      </article>

      <div className="list">
        {t.events.items.map((event, index) => (
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
