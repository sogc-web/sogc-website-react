import './Timeline.css'

function Timeline({ t }) {
  return (
    <section id="timeline" className="section timeline">
      <div className="section-header split">
        <div>
          <p className="eyebrow">{t.timeline.eyebrow}</p>
          <h2>{t.timeline.title}</h2>
        </div>
        <p className="section-note">{t.timeline.note}</p>
      </div>
      <div className="timeline-track">
        <div className="timeline-line"></div>
        <div className="timeline-items">
          {t.timeline.items.map((item, index) => {
            const direction =
              item.direction === 'right'
                ? 'right'
                : item.direction === 'left'
                  ? 'left'
                  : index % 2 === 0
                    ? 'left'
                    : 'right'

            return (
              <article
                key={item.title}
                className={`timeline-item timeline-item--${direction} reveal`}
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <span>{item.year}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Timeline
