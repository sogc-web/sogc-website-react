import SectionHeader from './SectionHeader'
import './Testimonials.css'

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const StarRating = () => (
  <div className="testimonials-luxe-card__stars" aria-hidden="true">
    {[...Array(5)].map((_, i) => (
      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
)

const QuoteIcon = () => (
  <svg className="testimonials-luxe-card__quote-icon" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
)

function Testimonials({ t }) {
  return (
    <section id="testimonials" className="section testimonials-luxe-section">
      <div className="testimonials-luxe-shell">
        <div className="testimonials-luxe-header reveal">
          <SectionHeader eyebrow={t.testimonials.eyebrow} title={t.testimonials.title} />
          <p className="testimonials-luxe-note">
            Short, grounded feedback from riders, volunteers, students, and local supporters.
          </p>
        </div>

        <div className="testimonials-luxe-grid">
          {t.testimonials.items.map((item, index) => (
            <article
              key={`${item.name}-${index}`}
              className="testimonials-luxe-card reveal"
              style={{ animationDelay: `${0.08 + index * 0.04}s` }}
            >
              <div className="testimonials-luxe-card__header">
                <StarRating />
                <QuoteIcon />
              </div>

              <blockquote className="testimonials-luxe-card__quote">"{item.quote}"</blockquote>

              <div className="testimonials-luxe-card__person">
                <span className="testimonials-luxe-card__avatar" aria-hidden="true">
                  {getInitials(item.name)}
                </span>
                <div className="testimonials-luxe-card__identity">
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
