import SectionHeader from './SectionHeader'

function Testimonials({ t }) {
  return (
    <section id="testimonials" className="section alt">
      <SectionHeader eyebrow={t.testimonials.eyebrow} title={t.testimonials.title} />
      <div className="card-grid card-grid--testimonials">
        {t.testimonials.items.map((item, index) => (
          <article
            key={item.name}
            className="card quote reveal"
            style={{ animationDelay: `${0.1 + index * 0.08}s` }}
          >
            <p className="quote-text">"{item.quote}"</p>
            <div className="quote-meta">
              <p>{item.name}</p>
              <span>{item.role}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
