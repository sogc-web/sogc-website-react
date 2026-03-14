import SectionHeader from './SectionHeader'

function PressMentions({ t }) {
  return (
    <section id="press" className="section press">
      <SectionHeader
        eyebrow={t.press.eyebrow}
        title={t.press.title}
        description={t.press.description}
      />
      <div className="press-grid">
        {t.press.items.map((item, index) => (
          <article
            key={item.headline}
            className="press-card reveal"
            style={{ animationDelay: `${0.1 + index * 0.1}s` }}
          >
            <div>
              <span className="press-outlet">{item.outlet}</span>
              <p className="press-date">{item.date}</p>
            </div>
            <h3>{item.headline}</h3>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PressMentions
