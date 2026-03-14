import SectionHeader from './SectionHeader'

function GalleryMedia({ t }) {
  return (
    <section id="gallery" className="section">
      <div className="section-header split">
        <SectionHeader eyebrow={t.gallery.eyebrow} title={t.gallery.title} />
        <p className="section-note">{t.gallery.note}</p>
      </div>

      <div className="featured-media">
        {t.gallery.featured.map((item, index) => (
          <div
            key={item.title}
            className="featured-chip reveal"
            style={{ animationDelay: `${0.1 + index * 0.08}s` }}
          >
            <span>{item.outlet}</span>
            <p>{item.title}</p>
          </div>
        ))}
      </div>

      <div className="two-column">
        <div className="stack">
          {t.gallery.galleryItems.map((item, index) => (
            <article
              key={item.title}
              className="glass-row reveal"
              style={{ animationDelay: `${0.1 + index * 0.08}s` }}
            >
              <div>
                <h3>{item.title}</h3>
                <p>{item.type}</p>
              </div>
              <button className="ghost-btn small">{t.gallery.view}</button>
            </article>
          ))}
        </div>
        <div className="stack">
          {t.gallery.mediaItems.map((item, index) => (
            <article
              key={item.title}
              className="glass-row reveal"
              style={{ animationDelay: `${0.1 + index * 0.08}s` }}
            >
              <div>
                <h3>{item.title}</h3>
                <p>{item.source}</p>
              </div>
              <button className="ghost-btn small">{t.gallery.open}</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GalleryMedia
