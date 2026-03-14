import SectionHeader from './SectionHeader'

function Campaigns({ t }) {
  return (
    <section id="campaigns" className="section">
      <div className="section-header split">
        <SectionHeader eyebrow={t.campaigns.eyebrow} title={t.campaigns.title} />
        <p className="section-note">{t.campaigns.note}</p>
      </div>
      <div className="card-grid card-grid--campaigns">
        {t.campaigns.items.map((item, index) => (
          <article
            key={item.title}
            className="card campaign-card reveal"
            style={{ animationDelay: `${0.1 + index * 0.08}s` }}
          >
            <div className="tag">{item.tag}</div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="campaign-footer">
              <span>{item.stat}</span>
              <button className="ghost-btn small">{t.campaigns.cta}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Campaigns
