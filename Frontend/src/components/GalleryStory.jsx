function GalleryStory({ t }) {
  return (
    <section id="story" className="section story">
      <div className="section-header section-header--center">
        <p className="eyebrow">{t.story.eyebrow}</p>
        <h2>{t.story.title}</h2>
        <p className="section-desc">{t.story.description}</p>
      </div>
      <div className="story-grid">
        {t.story.items.map((item, index) => (
          <article
            key={item.title}
            className="story-card reveal"
            style={{ animationDelay: `${0.1 + index * 0.1}s` }}
          >
            <div className={`story-visual${index % 2 ? ' alt' : ''}`}></div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default GalleryStory
